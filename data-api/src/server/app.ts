import { startApp } from 'modelence/server';
import { dataApi } from './data-api';

startApp({
  modules: [dataApi],
  migrations: [],
});
