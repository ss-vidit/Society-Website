import { useState } from 'react';
import { useNavigate, useSearchParams, Link, Navigate } from 'react-router-dom';
import { Lock, Mail, ArrowLeft, Shield, UserCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';

export default function LoginPage({ onPlayIntro }) {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const roleHint = searchParams.get('role'); // 'board' | 'member' | null

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const isBoardHint = roleHint === 'board';
  if (user && !submitting) {
    const destination = user.mustChangePassword
      ? '/setup-profile'
      : user.isBoardMember ? '/board' : '/member';
    return <Navigate to={destination} replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const loggedInUser = await login(email, password);
      const targetPath = loggedInUser.isBoardMember ? '/board' : '/member';
      if (onPlayIntro) {
        onPlayIntro(() => navigate(targetPath));
      } else {
        navigate(targetPath);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Check your credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div id="main-content" className="app-shell relative flex min-h-screen flex-col items-center justify-center px-4 pb-12 pt-24">
      <Navbar />

      <div className="relative z-10 w-full max-w-md">
        <Link
          to="/home"
          className="mb-5 inline-flex items-center gap-2 text-xs font-medium text-zinc-400 transition hover:text-amber-400"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Binary Boppers
        </Link>

        <div className="app-panel p-6 sm:p-8">
          <div className="mb-6 flex flex-col items-center text-center">
            <img
              src="/logo.jpg"
              alt="Binary Boppers"
              className="h-16 w-16 rounded-full border border-amber-400/70 object-cover"
            />
            <span className="mt-4 inline-flex items-center gap-1.5 rounded-md border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-xs font-semibold text-amber-300">
              {isBoardHint ? <Shield className="h-3 w-3" /> : <UserCheck className="h-3 w-3" />}
              {isBoardHint ? 'Board Member Login' : 'Society Member Login'}
            </span>
            <h1 className="app-page-title mt-4 text-3xl">
              {isBoardHint ? 'Board sign in' : 'Member sign in'}
            </h1>
            <p className="mt-2 max-w-xs text-sm leading-6 text-zinc-400">
              {isBoardHint
                ? 'Sign in with your board account to manage the society.'
                : 'Sign in to see member events, meetings, and updates.'}
            </p>
          </div>

          {error && (
            <div className="mb-4 rounded-lg border border-red-500/40 bg-red-500/15 px-3 py-2 text-xs text-red-200">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="login-email" className="mb-1.5 block text-sm font-medium text-zinc-200">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                <input
                  id="login-email"
                  type="email"
                  required
                  autoComplete="username"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@kiit.ac.in"
                  className="app-input w-full py-3 pl-10 pr-4 text-sm"
                />
              </div>
            </div>

            <div>
              <label htmlFor="login-password" className="mb-1.5 block text-sm font-medium text-zinc-200">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                <input
                  id="login-password"
                  type="password"
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="app-input w-full py-3 pl-10 pr-4 text-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="app-button-primary w-full px-4 py-3 text-sm disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? 'Signing in...' : 'Sign In & Enter'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
