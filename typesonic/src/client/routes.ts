import { lazy } from 'react';

export const routes = [
  {
    path: '/',
    Component: lazy(() => import('./home/HomePage'))
  },
  {
    path: '/login',
    Component: lazy(() => import('./auth/LoginPage'))
  },
  {
    path: '/signup',
    Component: lazy(() => import('./auth/SignupPage'))
  },
  {
    path: '/forgot-password',
    Component: lazy(() => import('./auth/ForgotPasswordPage'))
  },
  {
    path: '/new-password',
    Component: lazy(() => import('./auth/NewPasswordPage'))
  },
  {
    path: '/profile',
    Component: lazy(() => import('./profile/ProfilePage'))
  },
  {
    path: '/account',
    Component: lazy(() => import('./account/AccountPage'))
  },
  {
    path: '/session/:id',
    Component: lazy(() => import('./typing-session/TypingSessionPage'))
  },
  {
    path: '/typing-history',
    Component: lazy(() => import('./typing-history/TypingHistoryPage'))
  },
  {
    path: '*',
    Component: lazy(() => import('./layout/NotFoundPage'))
  }
];
