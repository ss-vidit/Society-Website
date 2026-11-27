import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowUpRight, Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user } = useAuth();
  const { pathname } = useLocation();
  const editorial = pathname === '/home';
  const isWorkspace = ['/board', '/member', '/profile', '/setup-profile'].includes(pathname);
  const portalPath = user?.isBoardMember ? '/board' : '/member';
  const [menuOpen, setMenuOpen] = useState(false);
  const mobileLinks = [
    ['About', '/home#about'],
    ['Events', '/home#events'],
    ['Gallery', '/home#gallery'],
    ['The crew', '/home#team']
  ];

  return (
    <header className={`fixed inset-x-0 top-0 z-40 border-b backdrop-blur ${
      'h-[72px] border-white/10 bg-black/90 text-white'
    }`}>
      <div className={`mx-auto flex h-full max-w-[1440px] items-center px-5 sm:px-10 lg:px-16 ${
        'justify-between'
      }`}>
        <Link to="/home" aria-label="Binary Boppers home" className="flex items-center gap-3">
          <img
            src={user?.photo || '/logo.jpg'}
            alt={user ? `${user.name} profile` : 'Binary Boppers'}
            className={`h-10 w-10 rounded-full border border-amber-400/70 object-cover ${
              user ? 'ring-2 ring-amber-400/20' : ''
            }`}
          />
          <div className="text-left">
            <span className="font-display block bg-gradient-to-r from-amber-200 via-yellow-400 to-orange-400 bg-clip-text text-sm font-extrabold tracking-[0.08em] text-transparent sm:text-base">
              {editorial ? 'Binary Boppers' : 'BINARY BOPPERS'}
            </span>
            <span className="block text-[9px] tracking-[0.07em] text-zinc-400 sm:text-[10px]">
              {editorial ? 'KIIT · Dance and creative collective' : 'KIIT School of Computer Engineering'}
            </span>
          </div>
        </Link>
        {editorial ? (
          <>
            <nav aria-label="Main navigation" className="hidden items-center gap-7 md:flex">
              <a href="/home#about" className="text-xs font-medium text-zinc-300 transition hover:text-amber-300">About</a>
              <a href="/home#events" className="text-xs font-medium text-zinc-300 transition hover:text-amber-300">Events</a>
              <a href="/home#gallery" className="text-xs font-medium text-zinc-300 transition hover:text-amber-300">Gallery</a>
              <a href="/home#team" className="text-xs font-medium text-zinc-300 transition hover:text-amber-300">The crew</a>
              <Link to={user ? portalPath : '/login'} className="inline-flex items-center gap-2 bg-amber-400 px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.1em] text-black transition hover:bg-amber-300">
                {user ? 'Open portal' : 'Member login'} <ArrowUpRight size={13} />
              </Link>
            </nav>
            <div className="flex items-center gap-2 md:hidden">
              <Link to={user ? portalPath : '/login'} className="inline-flex items-center gap-1 bg-[#171714] px-3 py-2.5 text-[10px] font-bold uppercase tracking-[0.08em] text-white">
                {user ? 'Portal' : 'Login'} <ArrowUpRight size={13} />
              </Link>
              <button
                type="button"
                aria-label={menuOpen ? 'Close menu' : 'Open menu'}
                aria-expanded={menuOpen}
                onClick={() => setMenuOpen((open) => !open)}
                className="flex h-9 w-9 items-center justify-center border border-white/20"
              >
                {menuOpen ? <X size={17} /> : <Menu size={17} />}
              </button>
            </div>
          </>
        ) : user && isWorkspace ? (
          <Link to="/profile" className="inline-flex items-center gap-2 border border-white/10 bg-zinc-900/80 px-2 py-1.5 transition hover:border-amber-400/40">
            <img src={user.photo || '/logo.jpg'} alt="" className="h-7 w-7 rounded-full object-cover" />
            <span className="hidden max-w-36 truncate text-xs font-medium text-zinc-200 sm:inline">{user.name}</span>
            <ArrowUpRight size={13} className="text-amber-400" />
          </Link>
        ) : (
          <Link to="/home" className="text-xs font-semibold text-zinc-300 transition hover:text-amber-300">
            Public site <ArrowUpRight size={13} className="ml-1 inline" />
          </Link>
        )}
      </div>
      {editorial && menuOpen && (
        <nav aria-label="Mobile navigation" className="absolute inset-x-0 top-full border-t border-white/10 bg-zinc-950 px-5 py-3 text-white shadow-lg md:hidden">
          {mobileLinks.map(([label, href]) => (
            <a key={href} href={href} onClick={() => setMenuOpen(false)} className="block border-b border-white/10 py-3 text-sm font-medium last:border-0">
              {label}
            </a>
          ))}
        </nav>
      )}
    </header>
  );
}
