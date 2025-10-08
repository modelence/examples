import { Module, ObjectId } from 'modelence/server';
import { z } from 'zod';
import { dbDocuments } from './db';
import { generateEmbedding } from './voyage';

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

      // Generate embedding for the query
      const queryEmbedding = await generateEmbedding(query, 'query');

      // Perform vector search using MongoDB's aggregation pipeline
      const results = await dbDocuments.aggregate([
        {
          $vectorSearch: {
            queryVector: queryEmbedding,
            path: 'embedding',
            numCandidates: 100,
            limit,
            index: 'vector_index',
          },
        },
        {
          $project: {
            content: 1,
            metadata: 1,
            createdAt: 1,
            score: { $meta: 'vectorSearchScore' },
          },
        },
      ]).toArray();

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

      // Generate embedding for the document
      const embedding = await generateEmbedding(content, 'document');

      const result = await dbDocuments.insertOne({
        content,
        metadata: {
          title,
          description,
        },
        embedding,
        createdAt: new Date(),
      });

      return {
        id: result.insertedId.toString(),
        content,
        metadata: {
          title,
          description,
        },
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
