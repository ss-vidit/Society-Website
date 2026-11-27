import { useNavigate } from 'react-router-dom';
import { ArrowUpRight, GraduationCap, Shield, UserCheck } from 'lucide-react';
import Navbar from '../components/Navbar';

const ROLES = [
  {
    id: 'board',
    number: '01',
    title: 'Board Member',
    detail: 'Manage members, meetings, events, and recruitment.',
    icon: Shield
  },
  {
    id: 'member',
    number: '02',
    title: 'Society Member',
    detail: 'See member announcements, upcoming GBMs, and events.',
    icon: UserCheck
  },
  {
    id: 'student',
    number: '03',
    title: 'Student Visitor',
    detail: 'Explore performances, recruitment, and what we do.',
    icon: GraduationCap
  }
];

export default function EntryPortal({ onPlayIntro }) {
  const navigate = useNavigate();

  const handleSelect = (id) => {
    if (id === 'student') {
      onPlayIntro(() => navigate('/home'));
    } else if (id === 'board') {
      navigate('/login?role=board');
    } else {
      navigate('/login?role=member');
    }
  };

  return (
    <div className="app-shell relative min-h-screen overflow-hidden text-white">
      <Navbar />

      <main className="relative z-10 mx-auto flex min-h-screen max-w-3xl flex-col justify-center px-5 pb-12 pt-24 sm:px-8">
        <div className="mb-8">
          <img
            src="/logo.jpg"
            alt="Binary Boppers"
            className="mb-6 h-14 w-14 rounded-full border border-amber-400/75 object-cover"
          />
          <p className="app-kicker">Choose your way in</p>
          <h1 className="font-display mt-3 text-4xl font-bold tracking-[-0.06em] text-white sm:text-5xl">
            Welcome to the crew.
          </h1>
          <p className="mt-3 max-w-lg text-sm leading-6 text-zinc-400">
            Pick the space that fits you. Each one has the right updates and tools for you.
          </p>
        </div>

        <div className="grid gap-3">
          {ROLES.map((role) => {
            const Icon = role.icon;
            return (
              <button
                key={role.id}
                onClick={() => handleSelect(role.id)}
                className="group flex w-full items-center gap-4 border border-white/10 bg-zinc-950/80 p-4 text-left transition hover:border-amber-400/60 hover:bg-zinc-900 sm:p-5"
              >
                <span className="w-8 shrink-0 font-mono text-xs text-amber-400">{role.number}</span>
                <span className="flex h-11 w-11 shrink-0 items-center justify-center border border-amber-500/25 bg-amber-500/10 text-amber-300 transition group-hover:bg-amber-400 group-hover:text-black">
                  <Icon className="h-5 w-5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="font-display block text-lg font-semibold tracking-[-0.03em] text-white">
                    {role.title}
                  </span>
                  <span className="mt-1 block text-xs leading-5 text-zinc-400">{role.detail}</span>
                </span>
                <span className="flex h-9 w-9 shrink-0 items-center justify-center border border-white/10 text-zinc-400 transition group-hover:border-amber-400 group-hover:text-amber-300">
                  <ArrowUpRight className="h-5 w-5" />
                </span>
              </button>
            );
          })}
        </div>
      </main>
    </div>
  );
}
