import { startApp } from 'modelence/server';
import aiChat from './ai-chat';

startApp({
  modules: [aiChat],
  email: {
    passwordReset: {
      redirectUrl: '/auth/new-password',
    },
  },
});
