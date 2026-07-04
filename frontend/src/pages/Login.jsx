import React, { useContext, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { LogIn, AlertCircle, Loader2 } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().min(1, 'Email is required.').email('Please enter a valid email address.'),
  password: z.string().min(1, 'Password is required.'),
});

export default function Login() {
  const { login } = useContext(AuthContext);
  const [serverError, setServerError] = useState('');
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data) => {
    setServerError('');
    try {
      const user = await login(data.email, data.password);
      if (user.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (error) {
      setServerError(error.message || 'Authentication failed. Please check credentials.');
    }
  };

  return (
    <div className="max-w-md mx-auto my-12">
      <div className="bg-slate-900 border border-slate-900 p-8 rounded-2xl space-y-6 shadow-xl shadow-slate-950/60">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
            Welcome Back
          </h2>
          <p className="text-slate-400 text-sm">
            Sign in to check and manage your table bookings.
          </p>
        </div>

        {serverError && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-450 p-4 rounded-xl flex items-start space-x-2 text-sm">
            <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5 text-red-400" />
            <span>{serverError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-300" htmlFor="email">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              placeholder="name@example.com"
              {...register('email')}
              className={`w-full bg-slate-950 border ${
                errors.email ? 'border-red-550' : 'border-slate-800 focus:border-violet-500'
              } text-white px-4 py-2.5 rounded-lg focus:outline-none transition duration-150 text-sm`}
            />
            {errors.email && <span className="text-red-450 text-xs font-medium">{errors.email.message}</span>}
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-300" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              {...register('password')}
              className={`w-full bg-slate-950 border ${
                errors.password ? 'border-red-550' : 'border-slate-800 focus:border-violet-500'
              } text-white px-4 py-2.5 rounded-lg focus:outline-none transition duration-150 text-sm`}
            />
            {errors.password && <span className="text-red-450 text-xs font-medium">{errors.password.message}</span>}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center space-x-2 bg-violet-600 hover:bg-violet-500 disabled:bg-violet-850 text-white font-semibold py-3 rounded-lg transition duration-150 shadow-md shadow-violet-900/30"
          >
            {isSubmitting ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                <LogIn className="h-4 w-4" />
                <span>Sign In</span>
              </>
            )}
          </button>
        </form>

        <div className="text-center pt-4 border-t border-slate-850">
          <p className="text-sm text-slate-400">
            Don't have an account?{' '}
            <Link to="/register" className="text-violet-400 hover:text-violet-300 font-semibold transition">
              Create account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
