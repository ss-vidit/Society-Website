import { Link, useNavigate } from 'react-router-dom';
import { LogIn, LogOut, CalendarCheck, Users, Sparkles, Home, Compass } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Sidebar({ open, onClose, recruitment }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    onClose?.();
    navigate('/');
  };

  const navItems = [
    {
      label: user ? (user.isBoardMember ? 'Board Portal' : 'Member Portal') : 'Login',
      to: user ? (user.isBoardMember ? '/board' : '/member') : '/login',
      icon: LogIn
    },
    {
      label: 'GBMs',
      to: user ? (user.isBoardMember ? '/board?tab=gbm' : '/member?tab=gbms') : '/login',
      icon: CalendarCheck
    },
    ...(user?.isBoardMember ? [{
      label: 'Board Roster',
      to: '/board?tab=members',
      icon: Users
    }] : [])
  ];

  return (
    <>
      {/* Backdrop on mobile */}
      {open && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-xs lg:hidden"
        />
      )}

      <aside
        className={`fixed top-16 left-0 bottom-0 z-30 w-56 border-r border-white/15 bg-black/90 backdrop-blur-xl transition-transform duration-300 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <nav className="flex h-full flex-col justify-between p-3">
          <div className="space-y-1.5">
            <Link
              to="/home"
              onClick={onClose}
              className="glass-btn flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-xs font-semibold uppercase tracking-wider"
            >
              <Home className="h-4 w-4 shrink-0" />
              Home
            </Link>

            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.label}
                  to={item.to}
                  onClick={onClose}
                  className="glass-btn flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-xs font-semibold uppercase tracking-wider"
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {item.label}
                </Link>
              );
            })}

            {!user && (recruitment?.isLive && recruitment?.formLink ? (
              <a
                href={recruitment.formLink}
                target="_blank"
                rel="noreferrer"
                className="glass-btn flex items-center gap-3 rounded-lg border-amber-400/50 px-3.5 py-2.5 text-xs font-bold uppercase tracking-wider text-amber-300"
              >
                <Sparkles className="h-4 w-4 shrink-0" />
                Recruitment (Live)
              </a>
            ) : (
              <Link
                to="/home#recruitment"
                onClick={onClose}
                className="glass-btn flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-xs font-semibold uppercase tracking-wider"
              >
                <Sparkles className="h-4 w-4 shrink-0" />
                Recruitment ended
              </Link>
            ))}
          </div>

          <div className="space-y-1.5 border-t border-white/10 pt-3">
            <Link
              to="/"
              onClick={onClose}
              className="glass-btn flex items-center gap-3 rounded-lg px-3.5 py-2 text-xs font-medium"
            >
              <Compass className="h-4 w-4 shrink-0" />
              Switch Role
            </Link>

            {user && (
              <button
                onClick={handleLogout}
                className="glass-btn flex w-full items-center gap-3 rounded-lg px-3.5 py-2 text-xs font-medium"
              >
                <LogOut className="h-4 w-4 shrink-0" />
                Logout
              </button>
            )}
          </div>
        </nav>
      </aside>
    </>
  );
}
