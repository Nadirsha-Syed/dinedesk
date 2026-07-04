import React from 'react';
import { createBrowserRouter } from 'react-router-dom';
import BaseLayout from '../layouts/BaseLayout';
import Home from '../pages/Home';
import Login from '../pages/Login';
import Register from '../pages/Register';
import Dashboard from '../pages/Dashboard';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <BaseLayout />,
    children: [
      {
        path: '',
        element: <Home />,
      },
      {
        path: 'login',
        element: <Login />,
      },
      {
        path: 'register',
        element: <Register />,
      },
      {
        path: 'dashboard',
        element: <Dashboard />,
      },
      {
        path: '*',
        element: (
          <div className="text-center py-12">
            <h2 className="text-3xl font-extrabold text-red-500">404 - Not Found</h2>
            <p className="text-slate-400 mt-2">The page you are looking for does not exist.</p>
          </div>
        ),
      },
    ],
  },
]);
