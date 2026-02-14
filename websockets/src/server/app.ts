import { startApp } from 'modelence/server';
import chat from './chat';

startApp({
  modules: [chat],
});
