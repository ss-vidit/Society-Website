import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowUpRight } from 'lucide-react';
import Navbar from '../components/Navbar';

export default function NotFoundPage() {
  return (
    <div className="app-shell min-h-screen pt-24">
      <Navbar />
      <main id="main-content" className="mx-auto flex min-h-[calc(100svh-96px)] w-full max-w-5xl flex-col justify-center px-6 py-16 sm:px-10">
        <p className="app-kicker">Wrong turn</p>
        <h1 className="app-page-title mt-4 text-5xl sm:text-6xl">This page missed its cue.</h1>
        <p className="mt-4 max-w-xl text-base leading-7 text-zinc-400">
          The address may have changed. Head back to the society site and find your way from there.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link to="/home" className="app-button-primary inline-flex items-center gap-2 px-4 py-3 text-sm">
            <ArrowLeft size={16} /> Back to the site
          </Link>
          <Link to="/" className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-white/15 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/5">
            Choose a portal <ArrowUpRight size={15} />
          </Link>
        </div>
      </main>
    </div>
  );
}
