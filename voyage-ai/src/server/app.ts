import { startApp } from 'modelence/server';
import voyage from './voyage';
import { seedDocuments } from './migrations/seedDocuments';

startApp({
  modules: [voyage],
  migrations: [
    {
      version: 1,
      description: 'Seed initial documents',
      handler: seedDocuments,
    },
  ]
});
