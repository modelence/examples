import { z } from 'zod';
import dbTodos from '../stores/dbTodos';

export default async function update(args: unknown) {
  const { id, title } = z.object({
    id: z.string(),
    title: z.string().min(1),
  }).parse(args);

  await dbTodos.updateOne(id, {
    $set: {
      title,
    },
  });
}
