import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Bell, Calendar, CheckCircle2, Sparkles } from 'lucide-react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import BottomDock from '../components/BottomDock';

export default function MemberDashboard() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get('tab');
  const validTabs = ['events', 'gbms'];
  const [activeTab, setActiveTab] = useState(validTabs.includes(initialTab) ? initialTab : 'events');
  const [events, setEvents] = useState([]);
  const [gbms, setGbms] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [statusMsg, setStatusMsg] = useState('');

  const loadData = async () => {
    try {
      const [evRes, gbmRes, attRes, notifRes] = await Promise.all([
        api.get('/events'),
        api.get('/gbm'),
        api.get('/gbm/my-attendance'),
        api.get('/notifications')
      ]);
      setEvents(evRes.data.events || []);
      setGbms(gbmRes.data.gbms || []);
      setAttendance(attRes.data.records || []);
      setNotifications(notifRes.data.notifications || []);
    } catch (err) {
      setStatusMsg(err.response?.data?.message || 'Failed to load member data.');
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const requestedTab = searchParams.get('tab');
    setActiveTab(validTabs.includes(requestedTab) ? requestedTab : 'events');
  }, [searchParams]);

  const handleTogglePerform = async (eventId) => {
    try {
      await api.post(`/events/${eventId}/perform`);
      await loadData();
    } catch (err) {
      setStatusMsg(err.response?.data?.message || 'Failed to update performing status.');
    }
  };

  const markNotifRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications((prev) => prev.map((n) => (n._id === id ? { ...n, read: true } : n)));
    } catch (error) {
      setStatusMsg(error.response?.data?.message || 'Could not update notification.');
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const upcomingGbms = gbms.filter(
    (gbm) => new Date(gbm.date) >= startOfToday && gbm.status !== 'completed'
  );
  const upcomingEvents = events.filter(
    (event) => !event.isArchived && new Date(event.date) >= startOfToday
  );
  const upcomingItems = [
    ...upcomingEvents.map((event) => ({ ...event, itemType: 'event' })),
    ...upcomingGbms.map((gbm) => ({ ...gbm, itemType: 'gbm' }))
  ].sort((a, b) => new Date(a.date) - new Date(b.date));
  const firstName = user?.name?.trim().split(/\s+/)[0] || 'member';

  return (
    <div id="main-content" className="app-shell workspace-ui min-h-screen pb-28 pt-24 text-white">
      <Navbar />
      <BottomDock />

      <div className="app-container max-w-6xl py-8 sm:px-6">
        <section className="portal-intro member-intro mb-6">
          <div className="portal-intro-main">
            <img
              src={user?.photo || '/logo.jpg'}
              alt={user?.name}
              className="portal-avatar h-16 w-16 rounded-full object-cover"
            />
            <div className="min-w-0">
              <p className="app-kicker">Member portal</p>
              <h1 className="portal-title mt-2">Welcome back, {firstName}</h1>
              <p className="mt-2 text-sm text-zinc-400">
                Roll {user?.rollNumber} <span className="mx-1.5 text-zinc-600">·</span> Year {user?.year}
              </p>
            </div>
          </div>

          <dl className="portal-metrics portal-metrics-two">
            <div className="portal-metric">
              <dt>On your calendar</dt>
              <dd className="portal-metric-value">{upcomingItems.length}</dd>
            </div>
            <div className="portal-metric">
              <dt>Unread alerts</dt>
              <dd className="portal-metric-value">{unreadCount}</dd>
            </div>
          </dl>
        </section>

        <nav aria-label="Member portal sections" className="portal-tabs mb-8">
            {[
              { id: 'events', label: 'Upcoming Events', icon: Sparkles },
              { id: 'gbms', label: `GBMs & Alerts (${unreadCount})`, icon: Bell }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  type="button"
                  aria-pressed={activeTab === tab.id}
                  onClick={() => setSearchParams({ tab: tab.id })}
                  className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition ${
                    activeTab === tab.id
                      ? 'bg-amber-400 text-black'
                      : 'border border-zinc-800 bg-zinc-900 text-zinc-300 hover:border-amber-500/40'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              );
            })}
        </nav>

        {statusMsg && (
          <div className="mb-6 rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
            {statusMsg}
          </div>
        )}

        {/* Board announcements */}
        {activeTab === 'events' && (
          <section>
            <div className="mb-5 flex items-end justify-between gap-4 border-b border-zinc-800 pb-4">
              <div>
                <p className="app-kicker">From your board</p>
                <h2 className="font-display mt-2 text-2xl font-bold text-white">Upcoming events & GBMs</h2>
              </div>
              <span className="hidden text-xs text-zinc-500 sm:block">Member announcements</span>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
            {upcomingItems.map((item) => {
              if (item.itemType === 'gbm') {
                return (
                  <article key={`gbm-${item._id}`} className="app-panel overflow-hidden border-l-2 border-l-amber-400 p-5">
                    <div className="mb-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.14em] text-amber-300">
                      <Calendar className="h-3.5 w-3.5" />
                      Members-only GBM
                    </div>
                    <h3 className="font-display text-xl font-bold text-white">{item.title}</h3>
                    <p className="mt-2 text-xs text-zinc-400">
                      {new Date(item.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      {' · '}{item.time}{item.venue ? ` · ${item.venue}` : ''}
                    </p>
                    {item.description && <p className="mt-3 text-sm leading-6 text-zinc-400">{item.description}</p>}
                  </article>
                );
              }

              const isPerforming = item.performers?.some((performer) => performer._id === user?._id);
              return (
                <div
                  key={`event-${item._id}`}
                  className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950"
                >
                  {item.banner && (
                    <img src={item.banner} alt={item.title} className="h-44 w-full object-cover" />
                  )}
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.14em] text-amber-300">Society event</p>
                        <h3 className="break-words text-lg font-bold text-white">{item.title}</h3>
                        <p className="mt-1 text-xs text-zinc-400">
                          {new Date(item.date).toLocaleDateString('en-IN')} • {item.time}
                          {item.venue ? ` • ${item.venue}` : ''}
                        </p>
                      </div>
                      <button
                        onClick={() => handleTogglePerform(item._id)}
                        className={`shrink-0 rounded-xl px-4 py-2 text-xs font-bold uppercase tracking-wider transition ${
                          isPerforming
                            ? 'border border-emerald-500/50 bg-emerald-500/20 text-emerald-300'
                            : 'bg-amber-500 text-black hover:bg-amber-400'
                        }`}
                      >
                        {isPerforming ? '✓ Performing' : 'Mark Performing'}
                      </button>
                    </div>
                    {item.description && <p className="mt-3 text-sm text-zinc-400">{item.description}</p>}
                    <p className="mt-3 text-xs text-amber-400/80">
                      {item.performers?.length || 0} member(s) performing
                    </p>
                  </div>
                </div>
              );
            })}
            {upcomingItems.length === 0 && (
              <p className="app-panel col-span-full p-6 text-sm text-zinc-400">No upcoming events or GBMs have been announced.</p>
            )}
            </div>
          </section>
        )}

        {/* Tab 3: GBMs & Notifications */}
        {activeTab === 'gbms' && (
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
              <h2 className="font-display mb-4 text-lg font-bold text-amber-300">
                Notifications
              </h2>
              <div className="space-y-3">
                {notifications.map((n) => (
                  <div
                    key={n._id}
                    onClick={() => markNotifRead(n._id)}
                    className={`cursor-pointer rounded-xl border p-3.5 transition ${
                      n.read
                        ? 'border-zinc-800 bg-zinc-900/40 text-zinc-400'
                        : 'border-amber-500/40 bg-amber-500/10 text-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold">{n.title}</p>
                      {!n.read && (
                        <span className="h-2 w-2 rounded-full bg-amber-400" />
                      )}
                    </div>
                    <p className="mt-1 text-xs text-zinc-300">{n.message}</p>
                  </div>
                ))}
                {notifications.length === 0 && (
                  <p className="text-xs text-zinc-500">No notifications yet.</p>
                )}
              </div>
            </div>

            <div className="space-y-6">
              <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
                <h2 className="font-display mb-4 text-lg font-bold text-amber-300">
                  Upcoming GBMs
                </h2>
                <div className="space-y-3">
                  {upcomingGbms.map((g) => (
                    <div
                      key={g._id}
                      className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-3.5"
                    >
                      <div className="flex items-center justify-between">
                        <p className="font-semibold text-white">{g.title}</p>
                        <span className="rounded-full bg-zinc-800 px-2.5 py-0.5 text-[10px] uppercase text-amber-300">
                          {g.status}
                        </span>
                      </div>
                      <p className="mt-1 flex items-center gap-1.5 text-xs text-zinc-400">
                        <Calendar className="h-3.5 w-3.5 text-amber-400" />
                        {new Date(g.date).toLocaleDateString('en-IN')} at {g.time}
                        {g.venue ? ` • ${g.venue}` : ''}
                      </p>
                    </div>
                  ))}
                  {upcomingGbms.length === 0 && (
                    <p className="text-xs text-zinc-500">No upcoming GBMs announced.</p>
                  )}
                </div>
              </div>

              <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
                <h2 className="font-display mb-4 text-lg font-bold text-amber-300">
                  My GBM Attendance
                </h2>
                <div className="space-y-2">
                  {attendance.map((rec) => (
                    <div
                      key={rec._id}
                      className="flex items-center justify-between rounded-lg border border-zinc-800/80 bg-zinc-900/50 px-3 py-2 text-xs"
                    >
                      <span>{rec.gbm?.title || 'GBM'}</span>
                      <span
                        className={`inline-flex items-center gap-1 font-semibold ${
                          rec.present ? 'text-emerald-400' : 'text-red-400'
                        }`}
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        {rec.present ? 'Present' : 'Absent'}
                      </span>
                    </div>
                  ))}
                  {attendance.length === 0 && (
                    <p className="text-xs text-zinc-500">No attendance records yet.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
