'use strict';

/**
 * purchase-history service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::purchase-history.purchase-history');
