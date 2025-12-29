import { startApp } from 'modelence/server';
import { nextServer } from '@modelence/next';
import todosModule from './todos';
import { createInitialData } from './todos/initialData';

startApp({
  modules: [todosModule],
  server: nextServer,
  migrations: [{
    version: 1,
    description: 'Initial data',
    async handler() {
      await createInitialData();
    },
  }],
});
