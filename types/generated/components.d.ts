import type { Schema, Attribute } from '@strapi/strapi';

export interface ListsCategories extends Schema.Component {
  collectionName: 'components_lists_categories';
  info: {
    displayName: 'categories';
    description: '';
  };
  attributes: {
    categoryName: Attribute.String & Attribute.Required;
  };
}

declare module '@strapi/types' {
  export module Shared {
    export interface Components {
      'lists.categories': ListsCategories;
    }
  }
}
