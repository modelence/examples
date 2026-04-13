import { startApp } from 'modelence/server';
import { nextServer } from '@modelence/next';
//import { ErrorComponent } from './auth/ErrorComponent';

startApp({
  server: nextServer,
  // auth: {
  //   errorComponent: ErrorComponent,
  // },
});
