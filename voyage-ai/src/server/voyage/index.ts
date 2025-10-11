import { Module, ObjectId } from 'modelence/server';
import { z } from 'zod';
import { dbDocuments } from './db';
import { generateEmbedding, rerank } from './voyage';

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
      const { query } = z.object({
        query: z.string(),
      }).parse(args);

      // Generate embedding for the query
      const queryEmbedding = await generateEmbedding(query, 'query');

      // Perform vector search using MongoDB's aggregation pipeline
      const results = await (await dbDocuments.vectorSearch({
        field: 'embedding',
        embedding: queryEmbedding,
        numCandidates: 100,
        limit: 10,
        projection: {
          content: 1,
          metadata: 1,
          createdAt: 1,
        },
      })).toArray();

      return await rerank(results, 'content', query);
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
