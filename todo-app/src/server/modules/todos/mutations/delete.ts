import { z } from 'zod';
import { ObjectId } from 'modelence/server';
import dbTodos from '../stores/dbTodos';

export default async function deleteTodo(args: unknown) {
  const { id } = z.object({
    id: z.string(),
  }).parse(args);

  await dbTodos.deleteMany({ _id: new ObjectId(id) });
}
