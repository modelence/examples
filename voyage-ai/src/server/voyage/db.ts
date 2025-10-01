import { Store, schema } from 'modelence/server';

export const dbDocuments = new Store('documents', {
  schema: {
    content: schema.string(),
    metadata: schema.object({
      title: schema.string().optional(),
      description: schema.string().optional(),
    }).optional(),
    embedding: schema.array(schema.number()),
    createdAt: schema.date(),
  },
  indexes: [
    { key: { createdAt: -1 } },
  ],
});
