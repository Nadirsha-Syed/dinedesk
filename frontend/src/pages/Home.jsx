import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Users, Clock } from 'lucide-react';
import { AuthContext } from '../contexts/AuthContext';

export default function Home() {
  const { user } = useContext(AuthContext);

  return (
    <div className="space-y-16 py-8">
      {/* Hero Section */}
      <section className="text-center max-w-4xl mx-auto space-y-6">
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight bg-gradient-to-r from-violet-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
          Exquisite Dining, Simplified Bookings
        </h1>
        <p className="text-lg sm:text-xl text-slate-400 leading-relaxed max-w-2xl mx-auto">
          Secure your table at the city's premier culinary destination. Real-time availability, instant confirmations, and seamless reservation management.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          {user ? (
            <Link
              to={user.role === 'admin' ? '/admin/dashboard' : '/dashboard'}
              className="w-full sm:w-auto px-8 py-3 rounded-lg bg-violet-650 hover:bg-violet-600 text-white font-semibold shadow-lg shadow-violet-900/30 transition duration-200 text-center"
            >
              Go to Dashboard
            </Link>
          ) : (
            <>
              <Link
                to="/register"
                className="w-full sm:w-auto px-8 py-3 rounded-lg bg-violet-650 hover:bg-violet-600 text-white font-semibold shadow-lg shadow-violet-900/30 transition duration-200 text-center"
              >
                Get Started
              </Link>
              <Link
                to="/login"
                className="w-full sm:w-auto px-8 py-3 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 hover:border-slate-700 font-semibold transition duration-200 text-center"
              >
                Sign In
              </Link>
            </>
          )}
        </div>
      </section>

      {/* Feature Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-slate-900/30 border border-slate-900/80 p-8 rounded-2xl space-y-4 hover:border-slate-800 transition duration-300">
          <div className="h-12 w-12 bg-violet-500/10 rounded-xl flex items-center justify-center border border-violet-500/20 text-violet-400">
            <Calendar className="h-6 w-6" />
          </div>
          <h3 className="text-xl font-bold">Instant Bookings</h3>
          <p className="text-slate-400">
            Find the perfect table and reserve it instantly. No waiting for verification, no double booking worries.
          </p>
        </div>

        <div className="bg-slate-900/30 border border-slate-900/80 p-8 rounded-2xl space-y-4 hover:border-slate-800 transition duration-300">
          <div className="h-12 w-12 bg-indigo-500/10 rounded-xl flex items-center justify-center border border-indigo-500/20 text-indigo-400">
            <Clock className="h-6 w-6" />
          </div>
          <h3 className="text-xl font-bold">Conflict Prevention</h3>
          <p className="text-slate-400">
            Our smart scheduling engine ensures seamless bookings with exact overlap checks. Zero overlaps, guaranteed.
          </p>
        </div>

        <div className="bg-slate-900/30 border border-slate-900/80 p-8 rounded-2xl space-y-4 hover:border-slate-800 transition duration-300">
          <div className="h-12 w-12 bg-purple-500/10 rounded-xl flex items-center justify-center border border-purple-500/20 text-purple-400">
            <Users className="h-6 w-6" />
          </div>
          <h3 className="text-xl font-bold">Capacity Optimization</h3>
          <p className="text-slate-400">
            Intelligent table sorting assigns the most suitable table based on party size to maximize table occupancy.
          </p>
        </div>
      </section>
    </div>
  );
}
