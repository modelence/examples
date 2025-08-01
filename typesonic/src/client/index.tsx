import { renderApp } from 'modelence/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';

import { routes } from './routes';
import favicon from './assets/favicon.png';
import './index.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

renderApp({
  routesElement: (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {routes.map((route) => (
            <Route key={route.path} path={route.path} element={<route.Component />} />
          ))}
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  ),
  errorHandler: (error) => {
    toast.error(error.message);
  },
  loadingElement: <div>Loading...</div>,
  favicon
});
