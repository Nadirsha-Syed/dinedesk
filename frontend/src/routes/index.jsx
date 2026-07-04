import React from 'react';
import { createBrowserRouter } from 'react-router-dom';
import BaseLayout from '../layouts/BaseLayout';
import Home from '../pages/Home';
import Login from '../pages/Login';
import Register from '../pages/Register';
import Dashboard from '../pages/Dashboard';
import ProtectedRoute from './ProtectedRoute';
import AdminRoute from './AdminRoute';

// Temporary AdminDashboard placeholder for routing resolution in M2
const AdminDashboardPlaceholder = () => (
  <div className="bg-slate-905 border border-slate-900 p-8 rounded-2xl space-y-6">
    <h2 className="text-2xl font-bold text-violet-400">Admin Control Panel</h2>
    <p className="text-slate-400 text-sm">
      Admin dashboard statistics and restaurant table manager views will be fully implemented in Milestone 5.
    </p>
  </div>
);

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
      // Authenticated Customer Routes
      {
        element: <ProtectedRoute />,
        children: [
          {
            path: 'dashboard',
            element: <Dashboard />,
          },
        ],
      },
      // Authenticated Admin Routes
      {
        element: <AdminRoute />,
        children: [
          {
            path: 'admin/dashboard',
            element: <AdminDashboardPlaceholder />,
          },
        ],
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
