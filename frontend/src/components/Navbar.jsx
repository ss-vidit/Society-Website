import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowUpRight, Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar({ recruitment }) {
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
    <header className="site-nav fixed inset-x-2 top-2 z-40 mx-auto h-16 w-auto max-w-[1440px] rounded-xl border text-white sm:inset-x-3 sm:top-3">
      <div className="mx-auto flex h-full min-w-0 max-w-[1440px] items-center justify-between gap-2 px-3 sm:px-5 md:px-8 lg:px-10">
        <Link to="/home" aria-label="Binary Boppers home" className="flex min-w-0 shrink items-center gap-2 sm:gap-3">
          <img
            src={user?.photo || '/logo.jpg'}
            alt={user ? `${user.name} profile` : 'Binary Boppers'}
            className={`h-9 w-9 shrink-0 rounded-full border border-amber-400/70 object-cover sm:h-10 sm:w-10 ${
              user ? 'ring-2 ring-amber-400/20' : ''
            }`}
          />
          <div className="text-left">
            <span className="wordmark font-display block max-w-[min(38vw,140px)] truncate text-sm font-semibold text-white sm:max-w-[240px] sm:text-base">
              {user?.name || 'Binary Boppers'}
            </span>
            <span className="block truncate text-[10px] text-zinc-400 max-[380px]:hidden">
              {editorial ? 'KIIT · Dance and creative collective' : 'KIIT School of Computer Engineering'}
            </span>
          </div>
        </Link>
        {editorial ? (
          <>
            <nav aria-label="Main navigation" className="hidden items-center gap-4 lg:flex xl:gap-6">
              <a href="/home#about" className="text-sm font-medium text-zinc-300 transition-colors duration-300 hover:text-amber-300">About</a>
              <a href="/home#events" className="text-sm font-medium text-zinc-300 transition-colors duration-300 hover:text-amber-300">Events</a>
              <a href="/home#gallery" className="text-sm font-medium text-zinc-300 transition-colors duration-300 hover:text-amber-300">Gallery</a>
              <a href="/home#team" className="text-sm font-medium text-zinc-300 transition-colors duration-300 hover:text-amber-300">The crew</a>
              {!user && (
                <a
                  href={recruitment?.isLive && recruitment?.formLink ? recruitment.formLink : '/home#recruitment'}
                  target={recruitment?.isLive && recruitment?.formLink ? '_blank' : undefined}
                  rel={recruitment?.isLive && recruitment?.formLink ? 'noreferrer' : undefined}
                  className={`text-sm font-medium transition-colors duration-300 hover:text-amber-300 ${
                    recruitment?.isLive && recruitment?.formLink ? 'text-amber-300' : 'text-zinc-300'
                  }`}
                >
                  {recruitment?.isLive && recruitment?.formLink ? 'Recruitment' : 'Recruitment ended'}
                </a>
              )}
              <Link to={user ? portalPath : '/login'} className="inline-flex min-h-10 items-center gap-2 rounded-md bg-amber-400 px-4 py-2 text-sm font-semibold text-black transition-colors duration-300 hover:bg-amber-300">
                {user ? 'Member portal' : 'Member login'} <ArrowUpRight size={13} />
              </Link>
            </nav>
            <div className="flex shrink-0 items-center gap-2 lg:hidden">
              <Link to={user ? portalPath : '/login'} className="inline-flex min-h-10 items-center gap-1 rounded-md bg-[#1c1c1c] px-3 py-2 text-xs font-semibold text-white">
                {user ? 'Portal' : 'Login'} <ArrowUpRight size={13} />
              </Link>
              <button
                type="button"
                aria-label={menuOpen ? 'Close menu' : 'Open menu'}
                aria-expanded={menuOpen}
                onClick={() => setMenuOpen((open) => !open)}
                className="flex h-10 w-10 items-center justify-center rounded-md border border-white/15 transition-colors hover:bg-white/5"
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
          <Link to="/home" className="text-sm font-semibold text-zinc-300 transition-colors hover:text-amber-300">
            Public site <ArrowUpRight size={13} className="ml-1 inline" />
          </Link>
        )}
      </div>
      {editorial && (
        <nav
          aria-label="Mobile navigation"
          aria-hidden={!menuOpen}
          className={`fixed inset-x-0 bottom-0 top-[76px] z-40 flex flex-col overflow-y-auto bg-[#090909] px-6 py-8 pb-[max(2rem,env(safe-area-inset-bottom))] text-white transition-[opacity,transform] duration-300 lg:hidden ${menuOpen ? 'translate-y-0 opacity-100' : 'pointer-events-none -translate-y-2 opacity-0'}`}
        >
          {mobileLinks.map(([label, href], index) => (
            <a
              key={href}
              href={href}
              tabIndex={menuOpen ? 0 : -1}
              onClick={() => setMenuOpen(false)}
              style={{ transitionDelay: menuOpen ? `${index * 60}ms` : '0ms' }}
              className={`border-b border-white/10 py-4 text-xl font-semibold transition-[opacity,transform] duration-300 ${menuOpen ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'}`}
            >
              {label}
            </a>
          ))}
          {!user && (
            <a
              href={recruitment?.isLive && recruitment?.formLink ? recruitment.formLink : '/home#recruitment'}
              target={recruitment?.isLive && recruitment?.formLink ? '_blank' : undefined}
              rel={recruitment?.isLive && recruitment?.formLink ? 'noreferrer' : undefined}
              tabIndex={menuOpen ? 0 : -1}
              onClick={() => setMenuOpen(false)}
              className="border-b border-white/10 py-4 text-xl font-semibold text-amber-300"
            >
              {recruitment?.isLive && recruitment?.formLink ? 'Recruitment' : 'Recruitment information'}
            </a>
          )}
        </nav>
      )}
    </header>
  );
}
