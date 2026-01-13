'use server';

import "../app";
import { z } from 'zod';
import { dbTodos } from './db';

export async function getAllTodos() {
  const todos = await dbTodos.fetch({});
  return todos.map(todo => ({
    ...todo,
    _id: todo._id.toString(),
  }));
}

export async function setCompleted(args: unknown) {
  const { id, completed } = z.object({
    id: z.string(),
    completed: z.boolean(),
  }).parse(args);

  await dbTodos.updateOne(id, {
    $set: {
      completed,
    },
  });
}
