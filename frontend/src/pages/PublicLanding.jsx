import { useEffect, useState } from 'react';
import { ArrowDown, ArrowRight, ArrowUpRight, Calendar, Clock, Instagram, MapPin, MoveUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import BottomDock from '../components/BottomDock';

const BOARD_ROLE_LABELS = {
  coordinator: 'Coordinator',
  student_lead: 'Student Lead',
  operations_lead: 'Operations Lead',
  hr_lead: 'HR Lead',
  assistant_coordinator: 'Assistant Coordinator',
  student_representative: 'Student Representative',
  hr_member: 'HR Member',
  operations_member: 'Operations Member',
  content_lead: 'Content Lead',
  social_media_lead: 'Social Media Lead'
};

const WINGS = [
  {
    number: '01',
    title: 'Street & stage',
    copy: 'Big energy, close formations, and the thrill of performing together.',
    image: 'https://images.unsplash.com/photo-1535525153412-5a42439a210d?auto=format&fit=crop&w=1000&q=85'
  },
  {
    number: '02',
    title: 'Classical & contemporary',
    copy: 'Rooted movement, new interpretations, and stories told through dance.',
    image: 'https://images.unsplash.com/photo-1547153760-18fc86324498?auto=format&fit=crop&w=1000&q=85'
  },
  {
    number: '03',
    title: 'The creative crew',
    copy: 'The camera, the edit, the artwork—everything that brings a show to life.',
    image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1000&q=85'
  }
];

const FALLBACK_BOARD = [
  { _id: 'b1', name: 'Amrita Bhattacharyya', boardRole: 'coordinator', photo: '/board/amrita.jpg' },
  { _id: 'b2', name: 'Vishwesh Shukla', boardRole: 'student_lead', photo: '/board/vishwesh.jpg' },
  { _id: 'b3', name: 'Atanu Das', boardRole: 'operations_lead', photo: '/board/atanu.jpg' },
  { _id: 'b4', name: 'Tanishq Singh', boardRole: 'operations_lead', photo: '/board/tanishq.jpg' },
  { _id: 'b5', name: 'Meghma Boral', boardRole: 'hr_lead', photo: '/board/meghma.jpg' },
  { _id: 'b6', name: 'Pratyusha Bhattacharya', boardRole: 'hr_lead', photo: '/board/pratyusha.jpg' },
  { _id: 'b7', name: 'Shayari Maity', boardRole: 'assistant_coordinator', photo: '/board/shayari.jpg' },
  { _id: 'b8', name: 'Shikhar Modi', boardRole: 'assistant_coordinator', photo: '/board/shikhar.jpg' },
  { _id: 'b9', name: 'Ananya Roy', boardRole: 'student_representative', photo: '/board/ananya.jpg' },
  { _id: 'b10', name: 'Aprajita Kumari', boardRole: 'hr_member', photo: '/board/aprajita.jpg' },
  { _id: 'b11', name: 'Sumedha Chatterjee', boardRole: 'hr_member', photo: '/board/sumedha.jpg' },
  { _id: 'b12', name: 'Bidisha Dutta', boardRole: 'operations_member', photo: '/board/bidisha.jpg' },
  { _id: 'b13', name: 'Ritika P. Pattanaik', boardRole: 'operations_member', photo: '/board/ritika.jpg' },
  { _id: 'b14', name: 'Anshuman Kumar', boardRole: 'content_lead', photo: '/board/anshuman.jpg' },
  { _id: 'b15', name: 'Tanishaa das', boardRole: 'social_media_lead', photo: '/board/tanishaa.jpg' }
];

const FALLBACK_PAST = [
  {
    _id: 'fed-omega',
    title: 'FED OMEGA 2025',
    eventPhotos: [
      '/events/fed-omega-1.png',
      '/events/fed-omega-2.png',
      '/events/fed-omega-3.png',
      '/events/fed-omega-4.png',
      '/events/fed-omega-5.png'
    ]
  },
  {
    _id: 'p1',
    title: 'KIIT Fest Opening Act',
    banner: 'https://images.unsplash.com/photo-1518834107812-67b0b7c58434?auto=format&fit=crop&w=900&q=85'
  },
  {
    _id: 'p2',
    title: 'Nritya Sangam Finals',
    banner: 'https://images.unsplash.com/photo-1504609813442-a8924e83f76e?auto=format&fit=crop&w=900&q=85'
  },
  {
    _id: 'p3',
    title: 'Freshers Flashmob',
    banner: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=900&q=85'
  },
  {
    _id: 'p4',
    title: 'Inter-University Groove',
    banner: 'https://images.unsplash.com/photo-1508700929628-666bc8bd84ea?auto=format&fit=crop&w=900&q=85'
  }
];

export default function PublicLanding() {
  const { user, loading } = useAuth();
  const [upcoming, setUpcoming] = useState([]);
  const [gbms, setGbms] = useState([]);
  const [past, setPast] = useState([]);
  const [boardMembers, setBoardMembers] = useState([]);
  const [recruitment, setRecruitment] = useState({ isLive: false, formLink: null });
  const [publicError, setPublicError] = useState('');

  useEffect(() => {
    if (loading) return;
    if (!user) setGbms([]);
    const loadPublicData = async () => {
      try {
        const requests = [
          api.get('/events/public'),
          api.get('/recruitment/status'),
          api.get('/members/board-public')
        ];
        if (user) requests.push(api.get('/gbm/public'));
        const [eventsRes, recRes, boardRes, gbmRes] = await Promise.all(requests);
        setUpcoming(eventsRes.data.upcoming || []);
        setGbms(user ? gbmRes.data.gbms || [] : []);
        setPast(eventsRes.data.past || []);
        setRecruitment(recRes.data || { isLive: false, formLink: null });
        setBoardMembers(boardRes.data.boardMembers || []);
      } catch (err) {
        setGbms([]);
        setPublicError(err.response?.data?.message || 'Live updates are temporarily unavailable. Saved highlights are shown instead.');
      }
    };
    loadPublicData();
  }, [loading, user?._id]);

  const boardItems = boardMembers.length > 0 ? boardMembers : FALLBACK_BOARD;
  const pastItems = past.length > 0 ? past : FALLBACK_PAST;
  const upcomingItems = [
    ...upcoming.map((event) => ({ ...event, itemType: 'event' })),
    ...gbms.map((gbm) => ({ ...gbm, itemType: 'gbm' }))
  ].sort((a, b) => new Date(a.date) - new Date(b.date));
  const galleryItems = pastItems.flatMap((event) =>
    (event.eventPhotos?.length ? event.eventPhotos : [event.banner || '/logo.jpg']).map((photo, index) => ({
      id: `${event._id}-${index}`,
      title: event.title,
      photo
    }))
  );

  return (
    <div className="editorial-site min-h-screen bg-[#09090b] pb-28 pt-[72px] text-zinc-100">
      <Navbar />
      <BottomDock recruitment={recruitment} />

      {publicError && (
        <div className="border-b border-amber-500/30 bg-amber-500/10 px-5 py-2 text-center text-xs text-amber-100">
          {publicError}
        </div>
      )}

      {!user && recruitment.isLive && recruitment.formLink && (
        <div className="flex flex-col items-center justify-between gap-3 bg-zinc-900 px-5 py-3 text-white sm:flex-row sm:px-8">
          <p className="text-sm">
            <span className="mr-2 font-semibold text-amber-300">Auditions are open.</span>
            Come find your place in the crew.
          </p>
          <a
            href={recruitment.formLink}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-white underline decoration-amber-400 underline-offset-4 hover:text-amber-300"
          >
            Sign up <ArrowUpRight size={14} />
          </a>
        </div>
      )}

      <main>
        <section className="relative min-h-[620px] overflow-hidden bg-[#09090b] text-white sm:min-h-[690px]">
          <img
            src="/hero-team.png"
            alt="Binary Boppers dance society together after a performance"
            className="absolute inset-0 h-full w-full object-cover object-center opacity-75"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#10110f]/95 via-[#10110f]/65 to-[#10110f]/10" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#10110f]/50 via-transparent to-[#10110f]/20" />
          <div className="relative mx-auto flex min-h-[620px] max-w-[1440px] flex-col justify-center px-6 pb-20 pt-24 sm:min-h-[690px] sm:px-12 lg:px-20">
            <p className="mb-7 flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/75">
              <span className="h-px w-9 bg-amber-400" />
              KIIT · Dance and creative collective
            </p>
            <h1 className="max-w-4xl font-display text-[clamp(3.75rem,10vw,8.75rem)] font-bold leading-[0.84] tracking-[-0.075em]">
              <span className="text-white">CODE.</span>
              <br />
              <span className="text-amber-400">DANCE.</span>
              <br />
              <span className="text-white">CREATE.</span>
            </h1>
            <div className="mt-8 flex max-w-2xl flex-col gap-7 sm:flex-row sm:items-end sm:justify-between">
              <p className="max-w-sm text-sm leading-6 text-white/75 sm:text-base">
                A student-led dance and creative collective. Built on practice, powered by people, made for the stage.
              </p>
              <div className="flex flex-wrap gap-3">
                <a
                  href="#events"
                  className="inline-flex min-h-12 items-center gap-3 bg-amber-400 px-5 text-xs font-bold uppercase tracking-[0.1em] text-black transition-colors hover:bg-amber-300"
                >
                  What’s on <ArrowRight size={16} />
                </a>
                <Link
                  to="/login"
                  className="inline-flex min-h-12 items-center gap-3 border border-white/50 px-5 text-xs font-bold uppercase tracking-[0.1em] text-white transition-colors hover:border-amber-400 hover:bg-amber-400 hover:text-black"
                >
                  Member portal <MoveUpRight size={15} />
                </Link>
              </div>
            </div>
          </div>
          <a href="#about" className="absolute bottom-7 right-7 hidden items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/70 sm:flex">
            Scroll to explore <ArrowDown size={14} />
          </a>
          <div className="absolute bottom-0 left-0 h-1 w-1/3 bg-amber-400" />
        </section>

        <section id="about" className="mx-auto grid scroll-mt-24 max-w-[1440px] gap-8 px-6 py-20 text-zinc-100 sm:px-12 sm:py-28 lg:grid-cols-[0.7fr_1.3fr] lg:gap-16 lg:px-20">
          <div>
            <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.18em] text-amber-400">More than a dance society</p>
            <h2 className="font-display max-w-md text-4xl font-bold leading-[0.98] tracking-[-0.055em] sm:text-6xl">
              Different people. One rhythm.
            </h2>
          </div>
          <div className="flex flex-col justify-between gap-8 lg:pt-12">
            <p className="max-w-2xl text-lg leading-8 text-zinc-400 sm:text-xl">
              From the first rehearsal to the final cue, we make things together. Dance is the starting point; the community is what keeps us moving.
            </p>
            <a href="#team" className="inline-flex w-fit items-center gap-3 border-b border-white/30 pb-2 text-xs font-bold uppercase tracking-[0.13em] hover:border-amber-400 hover:text-amber-300">
              Meet the people behind it <ArrowRight size={15} />
            </a>
          </div>
        </section>

        <section className="bg-[#11110f] px-6 py-16 text-zinc-100 sm:px-12 sm:py-20 lg:px-20">
          <div className="mx-auto max-w-[1280px]">
            <div className="mb-9 flex items-end justify-between gap-4">
              <div>
                <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.18em] text-amber-400">Find your people</p>
                <h2 className="font-display text-4xl font-bold tracking-[-0.055em] sm:text-5xl">Ways to move</h2>
              </div>
              <span className="hidden text-xs text-zinc-500 sm:block">Dance · Make · Belong</span>
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              {WINGS.map((wing) => (
                <article key={wing.number} className="group relative min-h-[390px] overflow-hidden bg-[#252622] text-white">
                  <img src={wing.image} alt="" className="absolute inset-0 h-full w-full object-cover opacity-70 transition duration-700 group-hover:scale-[1.04] group-hover:opacity-85" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-black/20" />
                  <div className="relative flex h-full min-h-[390px] flex-col justify-between p-6 sm:p-7">
                    <span className="text-xs font-semibold tracking-[0.15em] text-white/75">{wing.number} / 03</span>
                    <div>
                      <h3 className="font-display text-3xl font-semibold leading-tight tracking-[-0.04em]">{wing.title}</h3>
                      <p className="mt-3 max-w-xs text-sm leading-6 text-white/75">{wing.copy}</p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="events" className="mx-auto max-w-[1440px] scroll-mt-24 px-6 py-20 text-zinc-100 sm:px-12 sm:py-28 lg:px-20">
          <div className="mb-10 flex flex-col justify-between gap-5 border-b border-white/15 pb-6 sm:flex-row sm:items-end">
            <div>
              <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.18em] text-amber-400">Mark your calendar</p>
              <h2 className="font-display text-4xl font-bold tracking-[-0.055em] sm:text-5xl">Coming up</h2>
            </div>
            <p className="max-w-xs text-sm leading-6 text-zinc-400">Shows, sessions, and moments worth showing up for.</p>
          </div>
          {upcomingItems.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {upcomingItems.map((event) => (
                <article key={`${event.itemType}-${event._id}`} className="grid overflow-hidden border border-white/10 bg-zinc-900 sm:grid-cols-[0.85fr_1.15fr]">
                  {event.banner ? (
                    <img src={event.banner} alt="" className="h-52 w-full object-cover sm:h-full" />
                  ) : (
                    <div className="flex h-40 items-center justify-center bg-amber-500/10 text-amber-300 sm:h-full">
                      <Calendar size={44} strokeWidth={1.25} />
                    </div>
                  )}
                  <div className="flex flex-col p-5 sm:p-7">
                    <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.16em] text-amber-400">
                      {event.itemType === 'gbm' ? 'Members-only · GBM' : 'Upcoming event'}
                    </p>
                    <h3 className="font-display text-2xl font-bold leading-tight tracking-[-0.04em]">{event.title}</h3>
                    {event.description && <p className="mt-3 text-sm leading-6 text-zinc-400">{event.description}</p>}
                    <div className="mt-auto flex flex-wrap gap-x-4 gap-y-2 pt-6 text-xs text-[#57574f]">
                      <span className="inline-flex items-center gap-1.5 text-amber-200"><Calendar size={14} />{new Date(event.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                      <span className="inline-flex items-center gap-1.5"><Clock size={14} />{event.time || 'To be announced'}</span>
                      {event.venue && <span className="inline-flex items-center gap-1.5"><MapPin size={14} />{event.venue}</span>}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="flex min-h-44 flex-col items-start justify-center border-l-2 border-amber-400 bg-zinc-900 px-6 py-8 sm:px-9">
              <p className="font-display text-2xl font-semibold tracking-[-0.03em]">No upcoming events</p>
              <p className="mt-2 text-sm text-zinc-400">
                {user ? 'When something’s on the calendar, you’ll find it here.' : 'Public events will appear here when announced.'}
              </p>
            </div>
          )}
        </section>

        <section id="gallery" className="scroll-mt-24 overflow-hidden bg-[#11110f] py-16 text-white sm:py-20">
          <div className="mx-auto mb-8 flex max-w-[1440px] items-end justify-between gap-5 px-6 sm:px-12 lg:px-20">
            <div>
              <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.18em] text-amber-400">A few things we’ve made</p>
              <h2 className="font-display text-4xl font-bold tracking-[-0.055em] sm:text-5xl">From the floor</h2>
            </div>
            <span className="hidden text-xs text-white/50 sm:block">Past performances · Swipe to explore</span>
          </div>
          <div className="overflow-hidden">
            <div className="animate-marquee gap-4 px-6">
              {[...galleryItems, ...galleryItems].map((item, index) => (
                <figure key={`${item.id}-${index}`} className="group relative h-[300px] w-[270px] shrink-0 overflow-hidden bg-[#111] sm:h-[390px] sm:w-[340px]">
                  <img src={item.photo} alt={`${item.title} performance`} className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                  <figcaption className="absolute bottom-5 left-5 right-5 font-display text-lg font-semibold tracking-[-0.02em]">{item.title}</figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>

        <section id="team" className="mx-auto max-w-[1440px] scroll-mt-24 px-6 py-20 sm:px-12 sm:py-28 lg:px-20">
          <div className="mb-9 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.18em] text-amber-400">The people who make it happen</p>
              <h2 className="font-display text-4xl font-bold tracking-[-0.055em] sm:text-5xl">Meet the crew</h2>
            </div>
            <p className="max-w-xs text-sm leading-6 text-zinc-400">A little choreography, a lot of teamwork.</p>
          </div>
          <div className="grid grid-cols-2 gap-x-3 gap-y-7 sm:grid-cols-3 sm:gap-x-5 lg:grid-cols-5">
            {boardItems.map((member) => (
              <article key={member._id} className="group">
                <div className="aspect-[4/5] overflow-hidden bg-zinc-900">
                  <img src={member.photo || '/logo.jpg'} alt={member.name} className="h-full w-full object-cover object-top transition duration-500 group-hover:scale-[1.03]" />
                </div>
                <h3 className="mt-3 truncate text-sm font-semibold">{member.name}</h3>
                <p className="mt-1 text-[11px] text-zinc-400">{BOARD_ROLE_LABELS[member.boardRole] || 'Board Member'}</p>
              </article>
            ))}
          </div>
        </section>

        {!user && <section id="recruitment" className="scroll-mt-24 bg-amber-400 px-6 py-16 text-black sm:px-12 sm:py-20 lg:px-20">
          <div className="mx-auto flex max-w-[1280px] flex-col justify-between gap-8 sm:flex-row sm:items-end">
            <div>
              <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.18em] text-black/60">Your turn</p>
              <h2 className="font-display max-w-2xl text-4xl font-bold leading-[0.98] tracking-[-0.055em] sm:text-6xl">
                There’s room for one more.
              </h2>
              <p className="mt-4 max-w-md text-sm leading-6 text-black/75">
                {recruitment.isLive && recruitment.formLink
                  ? 'Come dance, make something, or just see where the rhythm takes you.'
                  : 'Recruitment ended.'}
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              {recruitment.isLive && recruitment.formLink && (
                <a href={recruitment.formLink} target="_blank" rel="noreferrer" className="inline-flex min-h-12 items-center gap-3 bg-black px-5 text-xs font-bold uppercase tracking-[0.1em] text-white hover:bg-zinc-800">
                  Audition now <ArrowUpRight size={15} />
                </a>
              )}
              <a href="https://instagram.com/binaryboppers" target="_blank" rel="noreferrer" className="inline-flex min-h-12 items-center gap-3 border border-black/50 px-5 text-xs font-bold uppercase tracking-[0.1em] hover:bg-black hover:text-white">
                <Instagram size={15} /> Follow along
              </a>
            </div>
          </div>
        </section>}
      </main>

      <footer className="flex flex-col justify-between gap-3 bg-black px-6 py-7 text-xs text-white/60 sm:flex-row sm:items-center sm:px-12 lg:px-20">
        <span>© {new Date().getFullYear()} Binary Boppers · KIIT School of Computer Engineering</span>
        <a href="https://instagram.com/binaryboppers" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 hover:text-white">
          <Instagram size={14} /> @binaryboppers <ArrowUpRight size={13} />
        </a>
      </footer>
    </div>
  );
}
