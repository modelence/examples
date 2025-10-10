import { Module, ObjectId } from 'modelence/server';
import { z } from 'zod';
import { dbDocuments } from './db';

export default new Module('voyage', {
  stores: [dbDocuments],
  queries: {
    async getDocuments() {
      return dbDocuments.fetch({}, {
        sort: { createdAt: -1 },
        limit: 50,
      });
    },
    async searchSimilar(args) {
      const { query, limit = 5 } = z.object({
        query: z.string(),
        limit: z.number().optional(),
      }).parse(args);

      const results = await dbDocuments.vectorSearch(query, {
        limit,
      });

      return results;
    },
  },
  mutations: {
    async addDocument(args) {
      const { title, description } = z.object({
        title: z.string().min(1),
        description: z.string().min(1),
      }).parse(args);

      // Combine title and description for embedding
      const content = `${title}\n${description}`;

      const result = await dbDocuments.insertOne({
        content,
        title,
        description,
        createdAt: new Date(),
      });

      return {
        id: result.insertedId.toString(),
        content,
        title,
        description,
        createdAt: new Date(),
      };
    },
    async deleteDocument(args) {
      const { id } = z.object({
        id: z.string(),
      }).parse(args);

      await dbDocuments.deleteOne({ _id: new ObjectId(id) });

      return { success: true };
    },
  },
  configSchema: {
    apiKey: {
      type: 'string',
      isPublic: false,
      default: '',
    },
  },
});
