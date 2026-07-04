import React, { useContext } from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { User, LogOut, Menu, X, Landmark } from 'lucide-react';
import { AuthContext } from '../contexts/AuthContext';

export default function BaseLayout() {
  const [isOpen, setIsOpen] = React.useState(false);
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100 font-sans antialiased">
      {/* Navigation Header */}
      <nav className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="flex items-center space-x-2 text-xl font-bold tracking-tight bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
                <Landmark className="h-6 w-6 text-violet-400 animate-pulse" />
                <span>DineDesk</span>
              </Link>
            </div>

            {/* Desktop Navbar Menu */}
            <div className="hidden md:flex items-center space-x-4">
              <Link to="/" className="text-slate-350 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition duration-200">
                Home
              </Link>
              {user ? (
                <>
                  <Link
                    to={user.role === 'admin' ? '/admin/dashboard' : '/dashboard'}
                    className="text-slate-350 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition duration-200"
                  >
                    Dashboard
                  </Link>
                  <div className="flex items-center space-x-2 bg-slate-900 px-3.5 py-1.5 rounded-full border border-slate-800">
                    <User className="h-4 w-4 text-slate-400" />
                    <span className="text-sm font-semibold text-slate-200">{user.name}</span>
                    <span className="text-xs px-2 py-0.5 bg-violet-500/20 text-violet-400 border border-violet-500/30 rounded-full capitalize">
                      {user.role}
                    </span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-1.5 bg-red-600/10 hover:bg-red-600/20 text-red-400 px-3.5 py-1.5 rounded-md text-sm font-semibold transition border border-red-500/20"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Logout</span>
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="text-slate-350 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition duration-200"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="bg-violet-600 hover:bg-violet-500 text-white px-4.5 py-2.0 rounded-md text-sm font-semibold transition duration-200 shadow-md shadow-violet-900/30"
                  >
                    Register
                  </Link>
                </>
              )}
            </div>

            {/* Mobile navigation toggle */}
            <div className="flex items-center md:hidden">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-slate-400 hover:text-white hover:bg-slate-900 focus:outline-none transition duration-200"
              >
                {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {isOpen && (
          <div className="md:hidden border-t border-slate-900 bg-slate-950 px-2 pt-2 pb-4 space-y-1.5">
            <Link
              to="/"
              onClick={() => setIsOpen(false)}
              className="block text-slate-300 hover:text-white px-3 py-2 rounded-md text-base font-medium transition"
            >
              Home
            </Link>
            {user ? (
              <>
                <Link
                  to={user.role === 'admin' ? '/admin/dashboard' : '/dashboard'}
                  onClick={() => setIsOpen(false)}
                  className="block text-slate-300 hover:text-white px-3 py-2 rounded-md text-base font-medium transition"
                >
                  Dashboard
                </Link>
                <div className="px-3 py-2 text-slate-450 text-sm border-t border-slate-900 my-2">
                  Authenticated as <span className="text-white font-semibold">{user.name}</span> ({user.role})
                </div>
                <button
                  onClick={() => {
                    setIsOpen(false);
                    handleLogout();
                  }}
                  className="w-full flex items-center justify-center space-x-1.5 bg-red-650/10 hover:bg-red-600/20 text-red-450 px-3.5 py-2.5 rounded-md text-base font-semibold transition border border-red-500/20"
                >
                  <LogOut className="h-5 w-5" />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <div className="pt-4 border-t border-slate-900 flex flex-col space-y-2 px-3">
                <Link
                  to="/login"
                  onClick={() => setIsOpen(false)}
                  className="w-full text-center text-slate-300 hover:text-white py-2 rounded-md text-base font-medium transition border border-slate-800"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setIsOpen(false)}
                  className="w-full text-center bg-violet-600 hover:bg-violet-500 text-white py-2.5 rounded-md text-base font-semibold transition shadow-lg shadow-violet-900/40"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        )}
      </nav>

      {/* Primary Layout Section */}
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Outlet />
        </div>
      </main>

      {/* Page Footer */}
      <footer className="bg-slate-950 border-t border-slate-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
            <div className="flex items-center space-x-2 text-lg font-bold bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
              <Landmark className="h-5 w-5 text-violet-400" />
              <span>DineDesk</span>
            </div>
            <p className="text-sm text-slate-500">
              &copy; {new Date().getFullYear()} DineDesk. All rights reserved. Created for showcase portfolio.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
