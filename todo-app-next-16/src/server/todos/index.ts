import { z } from 'zod';
import { Module } from 'modelence/server';
import { dbTodos } from './db';

export default new Module('todos', {
  stores: [dbTodos],
  queries: {
    async getAll() {
      return await dbTodos.fetch({});
    },
  },
  mutations: {
    async setCompleted(args) {
      const { id, completed } = z.object({
        id: z.string(),
        completed: z.boolean(),
      }).parse(args);

      await dbTodos.updateOne(id, {
        $set: {
          completed,
        },
      });
    },
  },
});
