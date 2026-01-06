import { z } from 'zod';
import { Module, ObjectId } from 'modelence/server';
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
    async create(args) {
      const { title } = z.object({
        title: z.string().min(1),
      }).parse(args);

      await dbTodos.insertOne({
        title,
        completed: false,
      });
    },
    async update(args) {
      const { id, title } = z.object({
        id: z.string(),
        title: z.string().min(1),
      }).parse(args);

      await dbTodos.updateOne(id, {
        $set: {
          title,
        },
      });
    },
    async delete(args) {
      const { id } = z.object({
        id: z.string(),
      }).parse(args);

      await dbTodos.deleteMany({ _id: new ObjectId(id) });
    },
  },
});
