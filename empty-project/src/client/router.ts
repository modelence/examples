import { lazy } from "react";
import { createBrowserRouter } from "react-router-dom";

export const router = createBrowserRouter([
  {
    path: '/',
    Component: lazy(() => import('./pages/HomePage'))
  },
]);
