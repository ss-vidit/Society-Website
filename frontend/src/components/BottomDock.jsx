import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Bell, CalendarCheck, Home, LogOut, User, Users } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';

export default function BottomDock() {
  const { user, logout } = useAuth();
  const { pathname, search } = useLocation();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notificationError, setNotificationError] = useState('');
  const unreadCount = notifications.filter((notification) => !notification.read).length;

  useEffect(() => {
    if (!user) {
      setNotifications([]);
      return;
    }
    api.get('/notifications')
      .then(({ data }) => setNotifications(data.notifications || []))
      .catch((error) => {
        setNotificationError(error.response?.data?.message || 'Could not load notifications.');
      });
  }, [user?._id]);

  const signedInItems = [
    {
      id: 'home',
      title: 'Home',
      to: '/home',
      icon: Home,
      active: pathname === '/home'
    },
    {
      id: 'gbms',
      title: 'GBMs',
      to: user ? (user.isBoardMember ? '/board?tab=gbm' : '/member?tab=gbms') : '/login',
      icon: CalendarCheck,
      active: false
    },
    ...(user?.isBoardMember ? [{
      id: 'members',
      title: 'Board Roster',
      to: '/board?tab=members',
      icon: Users,
      active: pathname === '/board' && new URLSearchParams(search).get('tab') !== 'gbm'
    }] : []),
    {
      id: 'profile',
      title: user ? 'My Profile' : 'Login',
      to: user ? '/profile' : '/login',
      icon: User,
      avatar: user?.photo,
      active: pathname === '/profile' || pathname === '/setup-profile' || pathname === '/login'
    }
  ];
  const items = signedInItems;

  const toggleNotifications = async () => {
    const opening = !notificationsOpen;
    setNotificationsOpen(opening);
    if (!opening || !user) return;
    setNotificationError('');
    try {
      const { data } = await api.get('/notifications');
      setNotifications(data.notifications || []);
    } catch (error) {
      setNotificationError(error.response?.data?.message || 'Could not load notifications.');
    }
  };

  const markAsRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications((current) =>
        current.map((notification) =>
          notification._id === id ? { ...notification, read: true } : notification
        )
      );
    } catch (error) {
      setNotificationError(error.response?.data?.message || 'Could not update notification.');
    }
  };

  if (!user) return null;

  return (
    <div className="bb-dock fixed bottom-5 left-1/2 z-50 -translate-x-1/2">
      {notificationsOpen && user && (
        <section className="bb-notifications absolute bottom-16 left-1/2 w-[min(22rem,calc(100vw-2rem))] -translate-x-1/2 overflow-hidden border border-white/10 bg-[#121214]">
          <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-3">
            <h2 className="text-sm font-bold text-amber-300">Notifications</h2>
            <span className="text-[11px] text-zinc-500">{unreadCount} unread</span>
          </div>
          {notificationError && (
            <p className="px-4 py-2 text-xs text-red-300">{notificationError}</p>
          )}
          <div className="max-h-80 space-y-2 overflow-y-auto p-3">
            {notifications.map((notification) => (
              <button
                type="button"
                key={notification._id}
                onClick={() => !notification.read && markAsRead(notification._id)}
                className={`w-full rounded-xl border p-3 text-left ${
                  notification.read
                    ? 'border-zinc-800 bg-zinc-900/50'
                    : 'border-amber-500/30 bg-amber-500/10'
                }`}
              >
                <span className="block text-xs font-semibold text-white">{notification.title}</span>
                <span className="mt-1 block text-[11px] leading-relaxed text-zinc-400">
                  {notification.message}
                </span>
              </button>
            ))}
            {!notifications.length && !notificationError && (
              <p className="p-3 text-center text-xs text-zinc-500">You're all caught up.</p>
            )}
          </div>
        </section>
      )}
      <nav
        aria-label="Bottom navigation"
        className="bb-dock-nav flex max-w-[calc(100vw-2rem)] items-center gap-1 overflow-x-auto border border-white/10 bg-[#0f0f10] p-1.5"
      >
        {items.map((item) => {
          const Icon = item.icon;
          const classes = `flex h-10 w-10 shrink-0 items-center justify-center gap-2 border px-2.5 text-[10px] font-semibold transition-colors duration-200 sm:w-auto sm:px-3 ${
            item.active
              ? 'border-white/10 bg-zinc-800 text-amber-300'
              : 'border-transparent text-white/75 hover:border-amber-400 hover:bg-amber-400 hover:text-black'
          }`;

          if (item.external) {
            return (
              <a
                key={item.id}
                href={item.to}
                target="_blank"
                rel="noreferrer"
                title={item.title}
                aria-label={item.title}
                className={classes}
              >
                {item.avatar ? (
                  <img src={item.avatar} alt="" className="h-5 w-5 shrink-0 rounded-full object-cover" />
                ) : (
                  <Icon className="h-4 w-4 shrink-0" />
                )}
                <span className="hidden sm:inline">{item.title}</span>
              </a>
            );
          }

          return (
            <Link
              key={item.id}
              to={item.to}
              title={item.title}
              aria-label={item.title}
              className={classes}
            >
              {item.avatar ? (
                <img src={item.avatar} alt="" className="h-5 w-5 shrink-0 rounded-full object-cover" />
              ) : (
                <Icon className="h-4 w-4 shrink-0" />
              )}
              <span className="hidden sm:inline">{item.title}</span>
            </Link>
          );
        })}
        {user && (
          <button
            type="button"
            onClick={toggleNotifications}
            title="Notifications"
            aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ''}`}
            aria-expanded={notificationsOpen}
            className={`relative flex h-10 w-10 shrink-0 items-center justify-center gap-2 border px-2.5 text-[10px] font-semibold transition-colors sm:w-auto sm:px-3 ${
              notificationsOpen
                ? 'border-white/10 bg-zinc-800 text-amber-300'
                : 'border-transparent text-white/75 hover:border-amber-400 hover:bg-amber-400 hover:text-black'
            }`}
          >
            <Bell className="h-4 w-4 shrink-0" />
            <span className="hidden sm:inline">Alerts</span>
            {unreadCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white">
                {unreadCount}
              </span>
            )}
          </button>
        )}
        {user && (
          <button
            type="button"
            onClick={() => {
              logout();
              navigate('/home');
            }}
            title="Log out"
            aria-label="Log out"
            className="flex h-10 w-10 shrink-0 items-center justify-center gap-2 border border-transparent px-2.5 text-[10px] font-semibold text-white/75 transition-colors hover:border-amber-400 hover:bg-amber-400 hover:text-black sm:w-auto sm:px-3"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            <span className="hidden sm:inline">Log out</span>
          </button>
        )}
      </nav>
    </div>
  );
}
