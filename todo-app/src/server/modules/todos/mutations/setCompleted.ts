import { z } from 'zod';
import dbTodos from '../stores/dbTodos';

export default async function setCompleted(args: unknown) {
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
