import { schema } from 'modelence/server';
import { VoyageStore } from '@modelence/voyageai';

export const dbDocuments = new VoyageStore('documents', 'voyage-3.5-lite', {
  schema: {
    title: schema.string(),
    description: schema.string(),
    createdAt: schema.date(),
  },
  indexes: [
    { key: { createdAt: -1 } },
  ],
});
