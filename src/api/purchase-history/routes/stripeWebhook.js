module.exports = {
 routes: [
     {
         method: 'POST',
         path: '/purchase-history/stripeWebhook',
         handler: 'purchase-history.stripeWebhook',
         config: {
            auth: false
         }
     }
 ]
}