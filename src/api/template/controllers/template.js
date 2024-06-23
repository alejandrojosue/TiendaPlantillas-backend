'use strict';
/**
 * template controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::template.template', ({ strapi }) => ({
 async download(ctx) {
  try {
   /**
    * @param {object} customer - Representa al usuario que está descargando la plantilla
    * @param {string} stripeId - id del stripeId que se creó al hacer
    */
   const { customer, stripeId } = ctx.request.body

   if (!customer) throw new Error("customer is required!")
   if (!stripeId) throw new Error("stripeId is required!")
   if (isNaN(customer.id)) throw new Error("stripeId it must be number!")

   const entry = await strapi.db.query('api::purchase-history.purchase-history')
    .findOne({
     where: { stripeId, customer: { id: customer.id } },
     populate: { customer: true }
    });

   const urls_templates = await Promise.all(
    entry.products.map(async (product) => {
     const { template: templateURL } = await strapi.service('api::template.template')
      .findOne(product.id, { populate: { template: true } });
     return { url: templateURL.url }
    })
   );

   return { urls: urls_templates }
  } catch (error) {
   ctx.response.status = 500
   return {
    error: error,
    message: error.message
   }
  }
 }
}));
