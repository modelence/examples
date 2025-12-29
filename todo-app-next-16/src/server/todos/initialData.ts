import { dbTodos } from './db';

export async function createInitialData() {
  console.log('Creating initial data for todos');
  await dbTodos.insertMany([
    { title: 'Learn Modelence', completed: false },
    { title: 'Build a Todo App', completed: false },
    { title: 'Deploy to Modelence Cloud', completed: false },
  ]);
}
