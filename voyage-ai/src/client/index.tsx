import { Suspense } from 'react';
import { renderApp } from 'modelence/client';
import { toast } from 'react-hot-toast';
import { RouterProvider } from 'react-router-dom';

import { router } from './router';
import favicon from './assets/favicon.svg';
import './index.css';
import LoadingSpinner from './components/LoadingSpinner';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

renderApp({
  routesElement: (
    <Suspense fallback={<LoadingSpinner fullScreen />}>
      <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      </QueryClientProvider>
    </Suspense>
  ),
  errorHandler: (error) => {
    toast.error(error.message);
  },
  loadingElement: <LoadingSpinner fullScreen />,
  favicon
});

