import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Users,
  CalendarCheck,
  Sparkles,
  UserPlus,
  Search,
  Check,
  X,
  Shield,
  Instagram
} from 'lucide-react';
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

const SOCIETY_ROLE_LABELS = {
  western_dancer: 'Western dance',
  classical_dancer: 'Classical dance',
  both_dancer: 'Western & classical',
  videographer: 'Videography',
  photographer: 'Photography',
  content_team: 'Content',
  graphics_designer: 'Graphic design'
};

const getInstagramUrl = (value) => {
  if (!value) return null;
  const cleaned = value.trim();
  const profileUrl = /^https?:\/\//i.test(cleaned)
    ? cleaned
    : `https://www.instagram.com/${cleaned.replace(/^@/, '')}/`;
  try {
    const url = new URL(profileUrl);
    if (
      url.protocol === 'https:' &&
      ['instagram.com', 'www.instagram.com'].includes(url.hostname) &&
      /^\/[A-Za-z0-9._]+\/?$/.test(url.pathname)
    ) {
      return `https://www.instagram.com${url.pathname.endsWith('/') ? url.pathname : `${url.pathname}/`}`;
    }
  } catch {
    return null;
  }
  return null;
};

export default function BoardDashboard() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get('tab');
  const validTabs = ['members', 'gbm', 'attendance', 'events', 'recruitment'];
  const [tab, setTab] = useState(validTabs.includes(initialTab) ? initialTab : 'members');

  // Members state
  const [members, setMembers] = useState([]);
  const [membersLoading, setMembersLoading] = useState(true);
  const [membersError, setMembersError] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [yearFilter, setYearFilter] = useState('');
  const [search, setSearch] = useState('');
  const [newMember, setNewMember] = useState({
    name: '',
    rollNumber: '',
    year: '',
    domain: ''
  });

  // GBM state
  const [gbms, setGbms] = useState([]);
  const [gbmForm, setGbmForm] = useState({ title: '', date: '', time: '', venue: '', description: '' });
  const [selectedGbm, setSelectedGbm] = useState(null);
  const [checklist, setChecklist] = useState([]);

  // Events state
  const [events, setEvents] = useState([]);
  const [eventForm, setEventForm] = useState({ title: '', date: '', time: '', venue: '', description: '' });
  const [bannerFile, setBannerFile] = useState(null);

  // Recruitment state
  const [recruitment, setRecruitment] = useState({ isLive: false, formLink: '', applicants: [] });
  const [recFormLink, setRecFormLink] = useState('');
  const [recApplicantForm, setRecApplicantForm] = useState({
    name: '',
    email: '',
    rollNumber: '',
    phone: '',
    year: 1,
    interestedIn: ''
  });

  const [toast, setToast] = useState('');

  const notify = (msg, duration = 4500) => {
    setToast(msg);
    setTimeout(() => setToast(''), duration);
  };

  const loadMembers = async () => {
    setMembersLoading(true);
    setMembersError('');
    const params = {};
    if (roleFilter) params.societyRole = roleFilter;
    if (yearFilter) params.year = yearFilter;
    if (search) params.search = search;
    try {
      const { data } = await api.get('/members', { params });
      setMembers(data.members || []);
    } catch (error) {
      setMembersError(error.response?.status === 401
        ? 'Your session has expired. Log in again to load the member roster.'
        : error.response?.data?.message || 'Could not load the board roster. Try again in a moment.');
    } finally {
      setMembersLoading(false);
    }
  };

  const loadGbms = async () => {
    try {
      const { data } = await api.get('/gbm');
      setGbms(data.gbms || []);
    } catch (error) {
      notify(error.response?.data?.message || 'Could not load GBMs.');
    }
  };

  const loadEvents = async () => {
    try {
      const { data } = await api.get('/events');
      setEvents(data.events || []);
    } catch (error) {
      notify(error.response?.data?.message || 'Could not load events.');
    }
  };

  const loadRecruitment = async () => {
    try {
      const { data } = await api.get('/recruitment/applicants');
      setRecruitment(data);
      setRecFormLink(data.formLink || '');
    } catch (error) {
      notify(error.response?.data?.message || 'Could not load recruitment status.');
    }
  };

  useEffect(() => {
    loadGbms();
    loadEvents();
    loadRecruitment();
  }, []);

  useEffect(() => {
    loadMembers();
  }, [roleFilter, yearFilter, search]);

  useEffect(() => {
    const requestedTab = searchParams.get('tab');
    setTab(validTabs.includes(requestedTab) ? requestedTab : 'members');
  }, [searchParams]);

  const activeGbmCount = gbms.filter((gbm) => gbm.status !== 'completed').length;
  const publishedEventCount = events.filter((event) => !event.isArchived).length;

  // ── Create Member ──
  const handleCreateMember = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post('/auth/create-member', newMember);
      notify(data.temporaryPassword
        ? `Member created. Email: ${data.user.email}. Temporary password: ${data.temporaryPassword}`
        : 'Member account created!');
      setNewMember({ name: '', rollNumber: '', year: '', domain: '' });
      loadMembers();
    } catch (err) {
      notify(err.response?.data?.message || 'Could not create member.');
    }
  };

  // ── Schedule GBM ──
  const handleScheduleGbm = async (e) => {
    e.preventDefault();
    try {
      await api.post('/gbm', gbmForm);
      notify('GBM scheduled & members notified!');
      setGbmForm({ title: '', date: '', time: '', venue: '', description: '' });
      loadGbms();
    } catch (err) {
      notify(err.response?.data?.message || 'Failed to schedule GBM.');
    }
  };

  const openAttendance = async (gbmId) => {
    try {
      const { data } = await api.get(`/gbm/${gbmId}/attendance`);
      setSelectedGbm(data.gbm);
      setChecklist(data.checklist || []);
      setTab('attendance');
      setSearchParams({ tab: 'attendance' });
    } catch (error) {
      notify(error.response?.data?.message || 'Could not load attendance.');
    }
  };

  const togglePresent = (memberId) => {
    setChecklist((prev) =>
      prev.map((item) =>
        item.member._id === memberId ? { ...item, present: !item.present } : item
      )
    );
  };

  const saveAttendance = async () => {
    if (!selectedGbm) return;
    try {
      await api.post(`/gbm/${selectedGbm._id}/attendance`, {
        records: checklist.map((c) => ({ memberId: c.member._id, present: c.present }))
      });
      notify('Attendance saved!');
      loadMembers();
      loadGbms();
    } catch (error) {
      notify(error.response?.data?.message || 'Could not save attendance.');
    }
  };

  // ── Create Event ──
  const handleCreateEvent = async (e) => {
    e.preventDefault();
    try {
      const fd = new FormData();
      Object.entries(eventForm).forEach(([k, v]) => fd.append(k, v));
      if (bannerFile) fd.append('banner', bannerFile);
      const { data } = await api.post('/events', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      notify('Event published!');
      setEventForm({ title: '', date: '', time: '', venue: '', description: '' });
      setBannerFile(null);
      setEvents((current) => [data.event, ...current]);
      loadEvents();
    } catch (err) {
      notify(err.response?.data?.message || 'Failed to create event.');
    }
  };

  // ── Recruitment ──
  const handleToggleRecruitment = async (goLive) => {
    try {
      const { data } = await api.post('/recruitment/toggle', {
        isLive: goLive,
        formLink: recFormLink
      });
      notify(data.message);
      loadRecruitment();
    } catch (err) {
      notify(err.response?.data?.message || 'Failed to update recruitment.');
    }
  };

  const handleAddApplicant = async (e) => {
    e.preventDefault();
    try {
      await api.post('/recruitment/applicants', recApplicantForm);
      notify('Applicant added to temporary list!');
      setRecApplicantForm({ name: '', email: '', rollNumber: '', phone: '', year: 1, interestedIn: '' });
      loadRecruitment();
    } catch (err) {
      notify(err.response?.data?.message || 'Failed to add applicant.');
    }
  };

  const handleGrantAccess = async (applicantId) => {
    try {
      const { data } = await api.post(`/recruitment/grant-access/${applicantId}`, {});
      notify(data.temporaryPassword
        ? `${data.message} Temporary password: ${data.temporaryPassword}`
        : data.message);
      loadRecruitment();
      loadMembers();
    } catch (err) {
      notify(err.response?.data?.message || 'Failed to grant access.');
    }
  };

  return (
    <div id="main-content" className="app-shell workspace-ui min-h-screen pb-28 pt-24 text-white">
      <Navbar />
      <BottomDock recruitment={recruitment} />

      <div className="app-container max-w-7xl py-8 sm:px-6">
        <section className="portal-intro board-intro mb-6">
          <div className="portal-intro-main">
            <img
              src={user?.photo || '/logo.jpg'}
              alt={user?.name || 'Board member'}
              className="portal-avatar h-16 w-16 rounded-full object-cover"
            />
            <div className="min-w-0">
              <p className="app-kicker flex items-center gap-2">
                <Shield className="h-3.5 w-3.5" />
                {BOARD_ROLE_LABELS[user?.boardRole] || 'Board Member'}
              </p>
              <h1 className="portal-title mt-2">Board workspace</h1>
              <p className="mt-2 max-w-xl text-sm text-zinc-400">
                Manage your members, meetings, events, and recruitment.
              </p>
            </div>
          </div>

          <dl className="portal-metrics portal-metrics-three">
            <div className="portal-metric">
              <dt>Members</dt>
              <dd className="portal-metric-value">{membersLoading ? '…' : membersError ? '—' : members.length}</dd>
            </div>
            <div className="portal-metric">
              <dt>Active GBMs</dt>
              <dd className="portal-metric-value">{activeGbmCount}</dd>
            </div>
            <div className="portal-metric">
              <dt>Published events</dt>
              <dd className="portal-metric-value">{publishedEventCount}</dd>
            </div>
          </dl>
        </section>

        <nav aria-label="Board workspace sections" className="portal-tabs mb-8">
            {[
              { id: 'members', label: 'Member Roster', icon: Users },
              { id: 'gbm', label: 'Schedule GBM', icon: CalendarCheck },
              { id: 'attendance', label: 'Attendance', icon: Check },
              { id: 'events', label: 'Add Event', icon: Sparkles },
              {
                id: 'recruitment',
                label: recruitment.isLive ? 'Recruitment (LIVE)' : 'Recruitment',
                icon: UserPlus
              },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  type="button"
                  aria-pressed={tab === item.id}
                  onClick={() => setSearchParams({ tab: item.id })}
                  className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition ${
                    tab === item.id
                      ? 'bg-amber-400 text-black'
                      : 'border border-zinc-800 bg-zinc-900 text-zinc-300 hover:border-amber-500/40'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </button>
              );
            })}
        </nav>

        {toast && (
          <div className="mb-6 rounded-xl border border-amber-500/40 bg-amber-500/15 px-4 py-3 text-sm text-amber-200">
            {toast}
          </div>
        )}

        {/* 1. MEMBERS TAB */}
        {tab === 'members' && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by name, roll number, email..."
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-900 py-2 pl-9 pr-3 text-xs outline-none focus:border-amber-500"
                />
              </div>

              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs outline-none focus:border-amber-500"
              >
                <option value="">All Society Roles</option>
                <option value="western_dancer">Western Dancer</option>
                <option value="classical_dancer">Classical Dancer</option>
                <option value="both_dancer">Both (Western & Classical)</option>
                <option value="videographer">Videographer</option>
                <option value="photographer">Photographer</option>
                <option value="content_team">Content Team</option>
                <option value="graphics_designer">Graphics Designer</option>
              </select>

              <select
                value={yearFilter}
                onChange={(e) => setYearFilter(e.target.value)}
                className="rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs outline-none focus:border-amber-500"
              >
                <option value="">All Years</option>
                {[1, 2, 3, 4].map((y) => (
                  <option key={y} value={y}>
                    Year {y}
                  </option>
                ))}
              </select>
            </div>

            {membersError ? (
              <div role="alert" className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-amber-500/30 bg-amber-500/5 p-6 text-sm text-amber-100">
                <span>{membersError}</span>
                <button type="button" onClick={loadMembers} className="rounded-lg border border-amber-500/40 px-3 py-2 font-semibold text-amber-200 hover:bg-amber-500/10">
                  Retry
                </button>
              </div>
            ) : membersLoading ? (
              <p className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6 text-center text-sm text-zinc-400" aria-live="polite">
                Loading member roster…
              </p>
            ) : members.length === 0 ? (
              <p className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6 text-center text-sm text-zinc-400">
                No member profiles match these filters.
              </p>
            ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {members.map((m) => (
                <div
                  key={m._id}
                  className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4 transition hover:border-amber-500/40"
                >
                  <div className="flex items-start gap-3">
                    <img
                      src={m.photo || '/logo.jpg'}
                      alt={m.name}
                      className="h-12 w-12 rounded-full border border-amber-500/40 object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate font-bold text-white">{m.name}</h3>
                      <p className="text-xs text-zinc-400">Year {m.year} · {m.rollNumber}</p>
                      <p className="mt-1 truncate text-xs text-zinc-500">{m.email}</p>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {(m.societyRole || []).length ? m.societyRole.map((role) => (
                          <span key={role} className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] text-amber-200">
                            {SOCIETY_ROLE_LABELS[role] || role.replaceAll('_', ' ')}
                          </span>
                        )) : <span className="text-[10px] text-zinc-500">Domain not added</span>}
                      </div>
                      {m.instagram && getInstagramUrl(m.instagram) && (
                        <a
                          href={getInstagramUrl(m.instagram)}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-2 inline-flex items-center gap-1 text-xs text-zinc-400 hover:text-amber-300"
                        >
                          <Instagram className="h-3.5 w-3.5" />
                          {m.instagram}
                        </a>
                      )}
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {m.isBoardMember && m.boardRole && (
                      <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 text-[10px] capitalize text-amber-300">
                        {BOARD_ROLE_LABELS[m.boardRole] || m.boardRole.replace('_', ' ')}
                      </span>
                    )}
                    {(m.societyRole || []).map((r) => (
                      <span
                        key={r}
                        className="rounded-full bg-zinc-900 px-2.5 py-0.5 text-[10px] capitalize text-zinc-300"
                      >
                        {r.replace('_', ' ')}
                      </span>
                    ))}
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-zinc-800/80 pt-3 text-xs">
                    <span className="text-zinc-400">Recent GBM Attendance</span>
                    <span className="font-bold text-amber-400">
                      {m.attendanceSummary?.present || 0} / {m.attendanceSummary?.total || 0}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            )}

            {/* Quick Add Member */}
            <form
              onSubmit={handleCreateMember}
              className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5"
            >
              <h2 className="font-display mb-4 text-lg font-bold text-amber-300">
                Add a member
              </h2>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <input
                  required
                  placeholder="Name"
                  maxLength={100}
                  value={newMember.name}
                  onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                  className="rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs outline-none focus:border-amber-500"
                />
                <input
                  required
                  placeholder="Roll Number"
                  minLength={3}
                  maxLength={30}
                  pattern="[A-Za-z0-9_-]{3,30}"
                  title="Use 3 to 30 letters, numbers, underscores, or hyphens."
                  value={newMember.rollNumber}
                  onChange={(e) => setNewMember({ ...newMember, rollNumber: e.target.value.trim() })}
                  className="rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs outline-none focus:border-amber-500"
                />
                <select
                  required
                  value={newMember.domain}
                  onChange={(e) => setNewMember({ ...newMember, domain: e.target.value })}
                  className="rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs outline-none focus:border-amber-500"
                >
                  <option value="">Choose domain</option>
                  <option value="western_dancer">Western Dancer</option>
                  <option value="classical_dancer">Classical Dancer</option>
                  <option value="both_dancer">Western and Classical</option>
                  <option value="videographer">Videographer</option>
                  <option value="photographer">Photographer</option>
                  <option value="content_team">Content Team</option>
                  <option value="graphics_designer">Graphics Designer</option>
                </select>
                <select
                  required
                  value={newMember.year}
                  onChange={(e) => setNewMember({ ...newMember, year: e.target.value })}
                  className="rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs outline-none focus:border-amber-500"
                >
                  <option value="">Choose year</option>
                  {[1, 2, 3, 4].map((year) => <option key={year} value={year}>Year {year}</option>)}
                </select>
                <button
                  type="submit"
                  className="rounded-xl bg-amber-500 px-4 py-2 text-xs font-bold text-black hover:bg-amber-400 sm:col-span-2 lg:col-span-1"
                >
                  Create Member
                </button>
              </div>
              <p className="mt-3 text-xs text-zinc-400">
                Account email: <span className="text-zinc-200">{newMember.rollNumber.trim() ? `${newMember.rollNumber.trim().toLowerCase()}@kiit.ac.in` : 'rollnumber@kiit.ac.in'}</span>
                <span className="mt-1 block">Temporary password: binaryboppers. The member will set a new password at first sign in.</span>
              </p>
            </form>
          </div>
        )}

        {/* 2. GBM & ATTENDANCE TAB */}
        {['gbm', 'attendance'].includes(tab) && (
          <div className={tab === 'gbm' ? 'grid gap-6 lg:grid-cols-2' : 'grid gap-6'}>
            {tab === 'gbm' && <div className="space-y-6">
              <form
                onSubmit={handleScheduleGbm}
                className="space-y-3 rounded-2xl border border-zinc-800 bg-zinc-950 p-5"
              >
                <h2 className="font-display text-lg font-bold text-amber-300">
                  Schedule GBM (Notifies All Members)
                </h2>
                <input
                  required
                  placeholder="GBM Title (e.g. Fest Choreography Sync)"
                  value={gbmForm.title}
                  onChange={(e) => setGbmForm({ ...gbmForm, title: e.target.value })}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm outline-none focus:border-amber-500"
                />
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <input
                    required
                    type="date"
                    value={gbmForm.date}
                    onChange={(e) => setGbmForm({ ...gbmForm, date: e.target.value })}
                    className="rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm outline-none focus:border-amber-500"
                  />
                  <input
                    required
                    placeholder="Time (e.g. 5:30 PM)"
                    value={gbmForm.time}
                    onChange={(e) => setGbmForm({ ...gbmForm, time: e.target.value })}
                    className="rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm outline-none focus:border-amber-500"
                  />
                </div>
                <input
                  placeholder="Venue (e.g. Auditorium / Room 204)"
                  value={gbmForm.venue}
                  onChange={(e) => setGbmForm({ ...gbmForm, venue: e.target.value })}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm outline-none focus:border-amber-500"
                />
                <button
                  type="submit"
                  className="w-full rounded-xl bg-amber-500 py-2.5 text-xs font-bold uppercase tracking-wider text-black hover:bg-amber-400"
                >
                  Schedule & Notify Members
                </button>
              </form>

              <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
                <h2 className="font-display mb-3 text-lg font-bold text-amber-300">
                  All GBMs (Click to Take Attendance)
                </h2>
                <div className="space-y-2.5">
                  {gbms.map((g) => (
                    <button
                      key={g._id}
                      onClick={() => openAttendance(g._id)}
                      className={`flex w-full items-center justify-between rounded-xl border p-3 text-left transition ${
                        selectedGbm?._id === g._id
                          ? 'border-amber-500 bg-amber-500/10'
                          : 'border-zinc-800 bg-zinc-900/60 hover:border-amber-500/40'
                      }`}
                    >
                      <div>
                        <p className="font-semibold text-white">{g.title}</p>
                        <p className="text-xs text-zinc-400">
                          {new Date(g.date).toLocaleDateString('en-IN')} • {g.time}
                        </p>
                      </div>
                      <span className="text-xs font-semibold text-amber-400">Take Attendance →</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>}

            {tab === 'attendance' && <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-display text-lg font-bold text-amber-300">
                  {selectedGbm ? `Attendance: ${selectedGbm.title}` : 'Select a GBM'}
                </h2>
                {selectedGbm && (
                  <button
                    onClick={saveAttendance}
                    className="rounded-xl bg-emerald-500 px-4 py-1.5 text-xs font-bold text-black hover:bg-emerald-400"
                  >
                    Save Attendance
                  </button>
                )}
              </div>

              {selectedGbm ? (
                <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1">
                  {checklist.map((item) => (
                    <div
                      key={item.member._id}
                      onClick={() => togglePresent(item.member._id)}
                      className="flex cursor-pointer items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900/50 px-3.5 py-2.5 transition hover:border-amber-500/40"
                    >
                      <div>
                        <p className="text-sm font-medium text-white">{item.member.name}</p>
                        <p className="text-xs text-zinc-400">{item.member.rollNumber}</p>
                      </div>
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold ${
                          item.present
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : 'bg-red-500/20 text-red-300'
                        }`}
                      >
                        {item.present ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5" />}
                        {item.present ? 'Present' : 'Absent'}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-zinc-500">
                  Choose any GBM from the left to mark present/absent for members.
                </p>
              )}
            </div>}
          </div>
        )}

        {/* 3. EVENTS TAB */}
        {tab === 'events' && (
          <div className="grid gap-6 lg:grid-cols-3">
            <form
              onSubmit={handleCreateEvent}
              className="space-y-3 rounded-2xl border border-zinc-800 bg-zinc-950 p-5"
            >
              <h2 className="font-display text-lg font-bold text-amber-300">Add an Upcoming Event</h2>
              <input
                required
                placeholder="Event name"
                value={eventForm.title}
                onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm outline-none focus:border-amber-500"
              />
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <input
                  required
                  type="date"
                  value={eventForm.date}
                  onChange={(e) => setEventForm({ ...eventForm, date: e.target.value })}
                  className="rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm outline-none focus:border-amber-500"
                />
                <input
                  placeholder="Time (optional)"
                  value={eventForm.time}
                  onChange={(e) => setEventForm({ ...eventForm, time: e.target.value })}
                  className="rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm outline-none focus:border-amber-500"
                />
              </div>
              <input
                placeholder="Venue"
                value={eventForm.venue}
                onChange={(e) => setEventForm({ ...eventForm, venue: e.target.value })}
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm outline-none focus:border-amber-500"
              />
              <textarea
                rows={3}
                placeholder="Event description..."
                value={eventForm.description}
                onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm outline-none focus:border-amber-500"
              />
              <div>
                <label className="mb-1 block text-xs text-zinc-400">Event Banner (required)</label>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  required
                  onChange={(e) => setBannerFile(e.target.files?.[0] || null)}
                  className="w-full text-xs text-zinc-400 file:mr-3 file:rounded-lg file:border-0 file:bg-amber-500/20 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-amber-300"
                />
              </div>
              <button
                type="submit"
                className="w-full rounded-xl bg-amber-500 py-2.5 text-xs font-bold uppercase tracking-wider text-black hover:bg-amber-400"
              >
                Publish Event
              </button>
            </form>

            <div className="space-y-4 lg:col-span-2">
              {events.map((ev) => (
                <div
                  key={ev._id}
                  className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5"
                >
                  <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                    <div>
                      <h3 className="text-lg font-bold text-white">{ev.title}</h3>
                      <p className="text-xs text-zinc-400">
                        {new Date(ev.date).toLocaleDateString('en-IN')} • {ev.time}
                        {ev.venue ? ` • ${ev.venue}` : ''}
                      </p>
                    </div>
                    <span className="rounded-full bg-amber-500/15 px-3 py-1 text-xs font-semibold text-amber-300">
                      {ev.performers?.length || 0} Performing
                    </span>
                  </div>

                  {ev.performers?.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {ev.performers.map((p) => (
                        <span
                          key={p._id}
                          className="rounded-lg border border-zinc-800 bg-zinc-900 px-2.5 py-1 text-xs text-zinc-200"
                        >
                          {p.name} ({p.rollNumber})
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 4. RECRUITMENT TAB */}
        {tab === 'recruitment' && (
          <div className="space-y-6">
            <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
              <h2 className="font-display text-lg font-bold text-amber-300">
                Recruitment Announcement
              </h2>
              <p className="mt-1 text-xs text-zinc-400">
                Share a Google Form with student visitors by publishing its link. Ending recruitment hides the link from the public site; the saved link stays here so you can publish it again later.
              </p>

              <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                <input
                  type="url"
                  value={recFormLink}
                  onChange={(e) => setRecFormLink(e.target.value)}
                  placeholder="https://docs.google.com/forms/... or https://forms.gle/..."
                  className="flex-1 rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm outline-none focus:border-amber-500"
                />
                {!recruitment.isLive ? (
                  <button
                    onClick={() => handleToggleRecruitment(true)}
                    className="rounded-xl bg-emerald-500 px-5 py-2 text-xs font-bold uppercase tracking-wider text-black hover:bg-emerald-400"
                  >
                    Publish Recruitment Announcement
                  </button>
                ) : (
                  <button
                    onClick={() => handleToggleRecruitment(false)}
                    className="rounded-xl bg-red-500 px-5 py-2 text-xs font-bold uppercase tracking-wider text-white hover:bg-red-400"
                  >
                    Stop Sharing Form Link
                  </button>
                )}
              </div>
            </div>

            {recruitment.isLive && (
              <div className="grid gap-6 lg:grid-cols-3">
                <form
                  onSubmit={handleAddApplicant}
                  className="space-y-3 rounded-2xl border border-zinc-800 bg-zinc-950 p-5"
                >
                  <h3 className="font-display text-base font-bold text-amber-300">
                    Log Registered Applicant
                  </h3>
                  <input
                    required
                    placeholder="Applicant Name"
                    value={recApplicantForm.name}
                    onChange={(e) =>
                      setRecApplicantForm({ ...recApplicantForm, name: e.target.value })
                    }
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs outline-none focus:border-amber-500"
                  />
                  <input
                    required
                    type="email"
                    placeholder="Email"
                    value={recApplicantForm.email}
                    onChange={(e) =>
                      setRecApplicantForm({ ...recApplicantForm, email: e.target.value })
                    }
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs outline-none focus:border-amber-500"
                  />
                  <input
                    placeholder="Roll Number"
                    value={recApplicantForm.rollNumber}
                    onChange={(e) =>
                      setRecApplicantForm({ ...recApplicantForm, rollNumber: e.target.value })
                    }
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs outline-none focus:border-amber-500"
                  />
                  <input
                    placeholder="Interested In (e.g. Western Dancer)"
                    value={recApplicantForm.interestedIn}
                    onChange={(e) =>
                      setRecApplicantForm({ ...recApplicantForm, interestedIn: e.target.value })
                    }
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs outline-none focus:border-amber-500"
                  />
                  <button
                    type="submit"
                    className="w-full rounded-xl bg-amber-500 py-2 text-xs font-bold text-black hover:bg-amber-400"
                  >
                    Add to Temporary Tab
                  </button>
                </form>

                <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5 lg:col-span-2">
                  <h3 className="font-display mb-4 text-base font-bold text-amber-300">
                    Temporary Recruitment List ({recruitment.applicants?.length || 0})
                  </h3>
                  <div className="space-y-2.5">
                    {(recruitment.applicants || []).map((app) => (
                      <div
                        key={app._id}
                        className="flex flex-col justify-between gap-2 rounded-xl border border-zinc-800 bg-zinc-900/60 p-3 sm:flex-row sm:items-center"
                      >
                        <div>
                          <p className="font-semibold text-white">{app.name}</p>
                          <p className="text-xs text-zinc-400">
                            {app.email} • {app.rollNumber || 'No roll'} • {app.interestedIn || 'General'}
                          </p>
                        </div>
                        {app.isSelected ? (
                          <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-bold text-emerald-300">
                            ✓ Member Access Granted
                          </span>
                        ) : (
                          <button
                            onClick={() => handleGrantAccess(app._id)}
                            className="rounded-xl bg-amber-500 px-3 py-1.5 text-xs font-bold text-black hover:bg-amber-400"
                          >
                            Select & Grant Access
                          </button>
                        )}
                      </div>
                    ))}
                    {(!recruitment.applicants || recruitment.applicants.length === 0) && (
                      <p className="text-xs text-zinc-500">No applicants logged yet.</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
