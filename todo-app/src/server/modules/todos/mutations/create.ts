import { z } from 'zod';
import dbTodos from '../stores/dbTodos';

export default async function create(args: unknown) {
  const { title } = z.object({
    title: z.string().min(1),
  }).parse(args);

  await dbTodos.insertOne({
    title,
    completed: false,
    luckyNumber: Math.floor(Math.random() * 100) + 1,
  });
}
