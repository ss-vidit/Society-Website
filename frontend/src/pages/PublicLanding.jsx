import { useEffect, useState } from 'react';
import { ArrowRight, ArrowUpRight, Calendar, Clock, Instagram, MapPin, MoveUpRight, Pause, Play, Plus, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import BottomDock from '../components/BottomDock';
import TaglineReveal from '../components/TaglineReveal';

const TAGLINE_LINES = ['We rehearse together.', 'We make room for every kind of talent.'];

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
    copy: 'Big energy, close formations, and the thrill of performing together.'
  },
  {
    number: '02',
    title: 'Classical & contemporary',
    copy: 'Rooted movement, new interpretations, and stories told through dance.'
  },
  {
    number: '03',
    title: 'The creative crew',
    copy: 'The camera, the edit, the artwork—everything that brings a show to life.'
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
  }
];

export default function PublicLanding() {
  const { user, loading } = useAuth();
  const [upcoming, setUpcoming] = useState([]);
  const [gbms, setGbms] = useState([]);
  const [past, setPast] = useState([]);
  const [boardMembers, setBoardMembers] = useState([]);
  const [galleryEntries, setGalleryEntries] = useState([]);
  const [recruitment, setRecruitment] = useState({ isLive: false, formLink: null });
  const [publicError, setPublicError] = useState('');
  const [galleryPaused, setGalleryPaused] = useState(false);
  const [galleryFormOpen, setGalleryFormOpen] = useState(false);
  const [galleryEventName, setGalleryEventName] = useState('');
  const [galleryFiles, setGalleryFiles] = useState([]);
  const [galleryUploadStatus, setGalleryUploadStatus] = useState('');
  const [galleryUploading, setGalleryUploading] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!user) setGbms([]);
    const loadPublicData = async () => {
      const requests = [
        ['events', api.get('/events/public')],
        ['gallery', api.get('/gallery/public')],
        ['recruitment', api.get('/recruitment/status')],
        ['board', api.get('/members/board-public')],
        ...(user ? [['gbms', api.get('/gbm/public')]] : [])
      ];
      const results = await Promise.allSettled(requests.map(([, request]) => request));
      const failures = [];

      results.forEach((result, index) => {
        const [section] = requests[index];
        if (result.status === 'rejected') {
          failures.push(section);
          return;
        }
        const { data } = result.value;
        if (section === 'events') {
          setUpcoming(data.upcoming || []);
          setPast(data.past || []);
        }
        if (section === 'gallery') setGalleryEntries(data.photos || []);
        if (section === 'recruitment') setRecruitment(data || { isLive: false, formLink: null });
        if (section === 'board') setBoardMembers(data.boardMembers || []);
        if (section === 'gbms') setGbms(data.gbms || []);
      });

      setPublicError(failures.length
        ? 'Some live updates could not load. Available highlights are still shown.'
        : '');
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
  const allGalleryItems = [
    ...galleryEntries.map((entry) => ({
      id: `gallery-${entry._id}`,
      title: entry.eventName,
      photo: entry.photo
    })),
    ...galleryItems
  ];

  const handleGalleryUpload = async (event) => {
    event.preventDefault();
    setGalleryUploadStatus('');

    if (!galleryFiles.length) {
      setGalleryUploadStatus('Choose at least one photo to continue.');
      return;
    }

    setGalleryUploading(true);
    try {
      const formData = new FormData();
      formData.append('eventName', galleryEventName.trim());
      galleryFiles.forEach((file) => formData.append('photos', file));

      const { data } = await api.post('/gallery', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setGalleryEntries((current) => [...(data.photos || []), ...current]);
      setGalleryUploadStatus(data.message || 'Photos added to the gallery.');
      setGalleryEventName('');
      setGalleryFiles([]);
      setGalleryFormOpen(false);
    } catch (error) {
      setGalleryUploadStatus(error.response?.data?.message || 'Could not add these photos. Please try again.');
    } finally {
      setGalleryUploading(false);
    }
  };

  return (
    <div className={`editorial-site min-h-screen pt-24 text-zinc-100 ${user ? 'pb-28' : ''}`}>
      <Navbar recruitment={recruitment} />
      <BottomDock />

      {publicError && (
        <div className="public-live-error w-full max-w-full border-b border-amber-500/30 bg-amber-500/10 px-4 py-2 text-center text-xs text-amber-100 sm:px-5">
          {publicError}
        </div>
      )}

      {!user && recruitment.isLive && recruitment.formLink && (
        <div className="flex flex-col items-center justify-between gap-3 bg-zinc-900 px-5 py-3 text-white sm:flex-row sm:px-8">
          <p className="text-sm">
            <span className="mr-2 font-semibold text-amber-300">Recruitment is open.</span>
            Come find your place in the crew.
          </p>
          <a
            href={recruitment.formLink}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 text-sm font-medium text-white underline decoration-amber-400 underline-offset-4 hover:text-amber-300"
          >
            Apply to join <ArrowUpRight size={14} />
          </a>
        </div>
      )}

      <main id="main-content">
        <section className="hero-layout text-white">
          <div className="hero-copy">
            <p className="mb-6 flex items-center gap-3 text-xs font-medium text-white/75">
              <span className="cue-rule" />
              KIIT dance and creative collective
            </p>
            <h1 className="max-w-[680px] font-display text-5xl font-semibold leading-none sm:text-6xl lg:text-7xl">
              <span className="hero-line">CODE.</span>
              <span className="hero-line hero-line-accent">DANCE.</span>
              <span className="hero-line">CREATE.</span>
            </h1>
            <div className="mt-8 flex max-w-[680px] flex-col gap-6">
              <p className="max-w-lg text-base leading-7 text-white/80">
                A student-led dance and creative collective. Built on practice, powered by people, made for the stage.
              </p>
              <div className="flex flex-wrap gap-3">
                <a
                  href="#events"
                  className="inline-flex min-h-12 items-center gap-3 bg-amber-400 px-5 text-sm font-semibold text-black transition-colors hover:bg-amber-300"
                >
                  Explore upcoming events <ArrowRight size={16} />
                </a>
                <Link
                  to="/login"
                  className="inline-flex min-h-12 items-center gap-3 border border-white/20 px-5 text-sm font-medium text-white transition-colors hover:border-white/40 hover:bg-white/5"
                >
                  Member portal <MoveUpRight size={15} />
                </Link>
              </div>
            </div>
          </div>
          <figure className="hero-visual">
            <img
              src="/hero-team.png"
              alt="Binary Boppers dance society together after a performance"
              className="hero-image"
            />
            <figcaption className="hero-visual-caption">
              <span className="cue-rule" />
              <span>One crew, many ways to move</span>
              <span className="hero-visual-location">KIIT · Bhubaneswar</span>
            </figcaption>
          </figure>
        </section>

        <section id="about" className="section-wrap grid scroll-mt-24 gap-8 py-20 sm:py-24 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
          <div>
            <p className="mb-4 text-xs font-medium text-amber-400">More than a dance society</p>
              <h2 className="font-display max-w-md text-4xl font-semibold leading-tight sm:text-6xl">
              Different people. One rhythm.
            </h2>
          </div>
          <div className="flex flex-col justify-between gap-8 lg:pt-12">
            <p className="max-w-2xl text-base leading-7 text-zinc-400 sm:text-lg sm:leading-8">
              From the first rehearsal to the final cue, we make things together. Dance is the starting point; the community is what keeps us moving.
            </p>
            <a href="#team" className="inline-flex w-fit items-center gap-3 border-b border-white/30 pb-2 text-sm font-medium hover:border-amber-400 hover:text-amber-300">
              Meet the people behind it <ArrowRight size={15} />
            </a>
          </div>
        </section>

        <section aria-label="Our shared purpose" className="purpose-section border-y border-white/10 px-6 py-20 sm:px-12 sm:py-24 lg:px-20">
          <div className="mx-auto max-w-[1280px]">
            <p className="cue-heading mb-6 text-xs font-semibold text-amber-300">
              <span className="cue-rule" />
              Practice, people, performance
            </p>
            <TaglineReveal lines={TAGLINE_LINES} />
          </div>
        </section>

        <section className="movement-section px-6 py-16 text-zinc-100 sm:px-12 sm:py-20 lg:px-20">
          <div className="mx-auto max-w-[1280px]">
            <div className="mb-9 flex items-end justify-between gap-4">
              <div>
                <p className="mb-3 text-xs font-medium text-amber-400">Find your people</p>
                <h2 className="font-display text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">Ways to move</h2>
              </div>
              <span className="hidden text-xs text-zinc-400 sm:block">Dance · Make · Belong</span>
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              {WINGS.map((wing) => (
                <article key={wing.number} className="board-card flex min-h-[240px] flex-col justify-between p-6 text-white sm:min-h-[260px] sm:p-7">
                    <span className="text-sm font-medium text-amber-400">{wing.number}</span>
                    <div>
                      <h3 className="font-display text-2xl font-semibold leading-tight tracking-[-0.03em] sm:text-3xl">{wing.title}</h3>
                      <p className="mt-3 max-w-xs text-sm leading-6 text-zinc-400">{wing.copy}</p>
                    </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="events" className="section-wrap scroll-mt-24 py-20 text-zinc-100 sm:py-24">
          <div className="mb-10 flex flex-col justify-between gap-5 border-b border-white/15 pb-6 sm:flex-row sm:items-end">
            <div>
              <p className="mb-3 text-xs font-medium text-amber-400">Mark your calendar</p>
              <h2 className="font-display text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">Coming up</h2>
            </div>
            <p className="max-w-xs text-sm leading-6 text-zinc-400">Shows, sessions, and moments worth showing up for.</p>
          </div>
          {upcomingItems.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {upcomingItems.map((event) => (
                <article key={`${event.itemType}-${event._id}`} className="event-card grid overflow-hidden sm:grid-cols-[0.85fr_1.15fr]">
                  {event.banner ? (
                    <img src={event.banner} alt="" className="h-52 w-full object-cover sm:h-full" />
                  ) : (
                    <div className="flex h-40 items-center justify-center bg-amber-500/10 text-amber-300 sm:h-full">
                      <Calendar size={44} strokeWidth={1.25} />
                    </div>
                  )}
                  <div className="flex flex-col p-5 sm:p-7">
                    <p className="mb-3 text-xs font-medium text-amber-400">
                      {event.itemType === 'gbm' ? 'Members-only meeting' : 'Upcoming event'}
                    </p>
                    <h3 className="font-display text-2xl font-bold leading-tight tracking-[-0.04em]">{event.title}</h3>
                    {event.description && <p className="mt-3 text-sm leading-6 text-zinc-400">{event.description}</p>}
                    <div className="mt-auto flex flex-wrap gap-x-4 gap-y-2 pt-6 text-xs text-zinc-400">
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

        <section id="gallery" className="gallery-surface scroll-mt-24 overflow-hidden py-16 text-white sm:py-20">
          <div className="section-wrap mb-8 flex flex-col items-start justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <p className="mb-3 text-xs font-medium text-amber-400">A few things we’ve made</p>
              <h2 className="font-display text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">From the floor</h2>
            </div>
              <div className="flex w-full flex-wrap items-center justify-start gap-2 sm:w-auto sm:justify-end sm:gap-4">
              {user?.isBoardMember && (
                <button
                  type="button"
                  className="gallery-add-button"
                  aria-expanded={galleryFormOpen}
                  aria-controls="gallery-upload-form"
                  disabled={galleryUploading}
                  onClick={() => {
                    setGalleryFormOpen((open) => !open);
                    setGalleryUploadStatus('');
                  }}
                >
                  {galleryFormOpen ? <X size={15} /> : <Plus size={15} />}
                  <span>{galleryFormOpen ? 'Close' : 'Add photos'}</span>
                </button>
              )}
              <span className="hidden text-xs text-white/60 sm:block">Past performances · In motion</span>
              <button
                type="button"
                className="gallery-motion-toggle"
                aria-label={galleryPaused ? 'Resume gallery animation' : 'Pause gallery animation'}
                aria-pressed={galleryPaused}
                onClick={() => setGalleryPaused((paused) => !paused)}
              >
                {galleryPaused ? <Play size={15} /> : <Pause size={15} />}
                <span>{galleryPaused ? 'Play' : 'Pause'}</span>
              </button>
            </div>
          </div>
          {galleryFormOpen && user?.isBoardMember && (
            <form
              id="gallery-upload-form"
              onSubmit={handleGalleryUpload}
              className="gallery-upload-panel section-wrap mb-6"
            >
              <div className="mb-4 flex items-start justify-between gap-4">
                <div>
                  <p className="app-kicker">Add to the archive</p>
                  <h3 className="mt-1 text-lg font-semibold text-white">New performance photos</h3>
                </div>
                <span className="text-xs text-zinc-400">Up to 10 photos</span>
              </div>
              <div className="grid gap-4 sm:grid-cols-[minmax(180px,0.8fr)_minmax(240px,1.2fr)_auto] sm:items-end">
                <label className="block text-xs font-medium text-zinc-300">
                  Event name
                  <input
                    required
                    maxLength={120}
                    value={galleryEventName}
                    onChange={(event) => setGalleryEventName(event.target.value)}
                    placeholder="e.g. FED OMEGA 2025"
                    className="mt-2 block min-h-11 w-full rounded-md border border-zinc-700 bg-black/40 px-3 text-sm text-white outline-none transition-colors focus:border-amber-400"
                  />
                </label>
                <label className="block text-xs font-medium text-zinc-300">
                  Photos
                  <input
                    required
                    multiple
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={(event) => {
                      const selectedFiles = Array.from(event.target.files || []);
                      if (selectedFiles.length > 10) {
                        setGalleryFiles([]);
                        setGalleryUploadStatus('Choose up to 10 photos per upload.');
                        event.target.value = '';
                        return;
                      }
                      setGalleryFiles(selectedFiles);
                      setGalleryUploadStatus('');
                    }}
                    className="gallery-file-input mt-2 block min-h-11 w-full rounded-md border border-zinc-700 bg-black/40 px-3 py-2 text-xs text-zinc-300"
                  />
                </label>
                <button
                  type="submit"
                  disabled={galleryUploading || galleryFiles.length === 0}
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-amber-400 px-4 text-sm font-semibold text-black transition-colors hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Plus size={15} />
                  {galleryUploading ? 'Adding…' : 'Add to gallery'}
                </button>
              </div>
              {galleryFiles.length > 0 && (
                <p className="mt-3 text-xs text-zinc-400" aria-live="polite">
                  {galleryFiles.length} photo{galleryFiles.length === 1 ? '' : 's'} selected
                </p>
              )}
              {galleryUploadStatus && (
                <p className="mt-3 text-sm text-amber-200" role="status">{galleryUploadStatus}</p>
              )}
            </form>
          )}
          {!galleryFormOpen && galleryUploadStatus && (
            <p className="section-wrap mb-4 text-sm text-amber-200" role="status">{galleryUploadStatus}</p>
          )}
          <div
            className="gallery-track"
            role="region"
            aria-label="Past performances gallery"
            tabIndex={0}
            data-paused={galleryPaused}
          >
            <div
              className="gallery-marquee"
              style={{ '--gallery-duration': `${Math.max(allGalleryItems.length * 8, 40)}s` }}
            >
              {[0, 1].map((groupIndex) => (
                <div key={groupIndex} className="gallery-marquee-group" aria-hidden={groupIndex === 1}>
                  {allGalleryItems.map((item) => (
                    <figure key={`${groupIndex}-${item.id}`} className="relative h-[300px] w-[270px] shrink-0 overflow-hidden rounded-lg bg-[#1c1c1c] sm:h-[390px] sm:w-[340px]">
                      <img src={item.photo} alt={groupIndex === 0 ? `${item.title} performance` : ''} loading="lazy" className="h-full w-full object-cover" />
                      <figcaption className="absolute inset-x-0 bottom-0 bg-black/65 px-5 py-4 font-display text-lg font-semibold">{item.title}</figcaption>
                    </figure>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="team" className="section-wrap scroll-mt-24 py-20 sm:py-24">
          <div className="mb-9 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="mb-3 text-xs font-medium text-amber-400">The people who make it happen</p>
              <h2 className="font-display text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">Meet the crew</h2>
            </div>
            <p className="max-w-xs text-sm leading-6 text-zinc-400">A little choreography, a lot of teamwork.</p>
          </div>
          <div className="grid grid-cols-2 gap-x-3 gap-y-7 sm:grid-cols-3 sm:gap-x-5 lg:grid-cols-5">
            {boardItems.map((member) => (
              <article key={member._id} className="group">
                <div className="aspect-[4/5] overflow-hidden rounded-lg bg-zinc-900">
                  <img src={member.photo || '/logo.jpg'} alt={member.name} loading="lazy" className="h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-[1.02]" />
                </div>
                <h3 className="mt-3 truncate text-sm font-semibold">{member.name}</h3>
                <p className="mt-1 text-[11px] text-zinc-400">{BOARD_ROLE_LABELS[member.boardRole] || 'Board Member'}</p>
              </article>
            ))}
          </div>
        </section>

        {!user && <section id="recruitment" className="scroll-mt-24 bg-[#f2b83f] px-6 py-16 text-black sm:px-12 sm:py-20 lg:px-20">
          <div className="mx-auto flex max-w-[1280px] flex-col justify-between gap-8 sm:flex-row sm:items-end">
            <div>
              <p className="mb-3 text-xs font-medium text-black/70">Your turn</p>
              <h2 className="font-display max-w-2xl text-4xl font-semibold leading-[1.02] tracking-[-0.04em] sm:text-6xl">
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
                <a href={recruitment.formLink} target="_blank" rel="noreferrer" className="inline-flex min-h-12 items-center gap-3 bg-black px-5 text-sm font-semibold text-white hover:bg-zinc-800">
                  Open recruitment form <ArrowUpRight size={15} />
                </a>
              )}
              <a href="https://instagram.com/binaryboppers" target="_blank" rel="noreferrer" className="inline-flex min-h-12 items-center gap-3 border border-black/50 px-5 text-sm font-medium hover:bg-black hover:text-white">
                <Instagram size={15} /> Follow along
              </a>
            </div>
          </div>
        </section>}
      </main>

      <footer className="flex flex-col justify-between gap-3 border-t border-white/10 px-6 py-7 text-xs text-white/60 sm:flex-row sm:items-center sm:px-12 lg:px-20">
        <span>© {new Date().getFullYear()} Binary Boppers · KIIT School of Computer Engineering</span>
        <a href="https://instagram.com/binaryboppers" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 hover:text-white">
          <Instagram size={14} /> @binaryboppers <ArrowUpRight size={13} />
        </a>
      </footer>
    </div>
  );
}
