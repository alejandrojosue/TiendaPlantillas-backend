'use strict';
// @ts-ignore
const stripe = require('stripe')(process.env.STRIPE_KEY)
/**
 * purchase-history controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::purchase-history.purchase-history', ({ strapi }) => ({
  async create(ctx) {
    const { products, customer } = ctx.request.body;
    try {
      if (!products) throw new Error('products is required!')
      if (!customer) throw new Error('customer is required!')
      const productsJSON = [];
      const lineItems = await Promise.all(
        products.map(async (product) => {
          const item = await strapi.service('api::template.template')
            .findOne(product.id, {
              populate: { images: true }
            });
          productsJSON.push({
            id: item.id,
            name: item.title,
            unitPrice: item.unitPrice
          });
          return {
            price_data: {
              currency: "usd",
              product_data: {
                name: item.title,
                images: item.images?.map(({ url }) => "https://vsjbkj52-1337.use2.devtunnels.ms" + url)
              },
              unit_amount: Math.round(item.unitPrice * 100),
            },
            quantity: 1
          }
        })
      )

      const session = await stripe.checkout.sessions.create({
        // shipping_address_collection: {
        //   allowed_countries: [
        //     'BZ', // Belize
        //     'CR', // Costa Rica
        //     'SV', // El Salvador
        //     'GT', // Guatemala
        //     'HN', // Honduras
        //     'NI', // Nicaragua
        //     'PA', // Panama
        //     'DE', // Germany
        //     'FR', // France
        //     'IT', // Italy
        //     'ES', // Spain
        //     'PT', // Portugal
        //   ]
        // },
        mode: "payment",
        payment_method_types: ["card"],
        success_url: process.env.CLIENT_URL + "/success",
        cancel_url: process.env.CLIENT_URL + "/cancel",
        line_items: lineItems
      })

      await strapi.service('api::purchase-history.purchase-history')
        .create({ data: { products: productsJSON, stripeId: session.id, customer: { id: customer.id } } });

      await Promise.all(
        productsJSON.map(async (product) => {
          await strapi.service('api::payment.payment')
            .create({ data: { template: { id: product.id }, amount: product.unitPrice } })
        })
      )

      return { stripeSession: session }
    } catch (error) {
      ctx.response.status = 500
      return {
        errors: {
          error,
          message: error.message
        }
      }
    }
  },
  // endpoint destinado para que stripe lo use
  async stripeWebhook(ctx) {
    const body = ctx.request.body;
    if (body.type && body.type === 'checkout.session.completed') {
      try {
        await strapi.db.query('api::purchase-history.purchase-history')
          .update({
            where: { stripeId: body.data.object.id },
            data: { completed: true }
          });
      } catch (error) {
        ctx.response.status = 500;
        return { error, message: error.message }
      }
    }
  }
}));
