import { Suspense } from 'react';
import { renderApp } from 'modelence/client';
import { toast } from 'react-hot-toast';
import { RouterProvider } from 'react-router-dom';

import { router } from './router';
import favicon from './assets/favicon.svg';
import './index.css';
import LoadingSpinner from './components/LoadingSpinner';

renderApp({
  routesElement: (
    <Suspense fallback={<LoadingSpinner fullScreen />}>
      <RouterProvider router={router} />
    </Suspense>
  ),
  errorHandler: (error) => {
    toast.error(error.message);
  },
  loadingElement: <LoadingSpinner fullScreen />,
  favicon
});

