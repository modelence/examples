import type { MigrationScript } from 'modelence/server';
import dbTodos from '../modules/todos/stores/dbTodos';

export default {
  version: 1,
  description: 'Initial data',
  handler: async () => {
    console.log('Creating initial data for todos');
    await dbTodos.insertMany([
      { title: 'Learn Modelence', completed: false },
      { title: 'Build a Todo App', completed: false },
      { title: 'Deploy to Modelence Cloud', completed: false },
    ]);
  },
} satisfies MigrationScript;
