import { Suspense } from 'react';
import { renderApp, startWebsockets } from 'modelence/client';
import { toast } from 'react-hot-toast';
import { RouterProvider } from 'react-router-dom';

import { router } from './router';
import favicon from './assets/favicon.svg';
import './index.css';
import LoadingSpinner from './components/LoadingSpinner';
import chatClientChannel from './channels/chatClientChannel';

startWebsockets({
  channels: [
    chatClientChannel,
  ],
});

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

