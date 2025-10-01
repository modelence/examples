import { Store, schema } from 'modelence/server';

export const dbDocuments = new Store('documents', {
  schema: {
    content: schema.string(),
    metadata: schema.object({
      title: schema.string(),
      description: schema.string(),
    }),
    embedding: schema.array(schema.number()),
    createdAt: schema.date(),
  },
  indexes: [
    { key: { createdAt: -1 } },
  ],
});
