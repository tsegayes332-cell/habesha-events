import { useCallback, useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { useTranslation } from 'react-i18next';
import { formatEthiopianDate } from '../utils/ethiopianCalendar';
import {
  CalendarDays,
  Check,
  CheckCircle2,
  Clock3,
  ExternalLink,
  LayoutDashboard,
  LogOut,
  Shield,
  Trash2,
  X,
} from 'lucide-react';
import ErrorCard from '../components/ErrorCard';

dayjs.extend(relativeTime);

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('pending');
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(null);
  const navigate = useNavigate();
  const { i18n } = useTranslation();

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    const token = localStorage.getItem('adminToken');

    if (!token) {
      navigate('/admin/login');
      return;
    }

    try {
      const endpoint = activeTab === 'pending' ? '/api/admin/events/pending' : '/api/admin/events/all';
      const response = await axios.get(`${(import.meta.env.VITE_API_URL || '')}${endpoint}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEvents(Array.isArray(response.data) ? response.data : []);
      setError('');
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        localStorage.removeItem('adminToken');
        navigate('/admin/login');
        return;
      }
      setError('Failed to fetch events. Please check your connection.');
    } finally {
      setLoading(false);
    }
  }, [activeTab, navigate]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchEvents();
  }, [fetchEvents]);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/admin/login');
  };

  const handleAction = async (id, action) => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/admin/login');
      return;
    }

    if (action === 'delete') {
      const confirmed = window.confirm('Are you sure you want to permanently delete this event? This action cannot be undone.');
      if (!confirmed) return;
    }

    setActionLoading(id);
    try {
      if (action === 'delete') {
        await axios.delete(`${(import.meta.env.VITE_API_URL || '')}/api/admin/events/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        await axios.put(
          `${(import.meta.env.VITE_API_URL || '')}/api/admin/events/${id}/${action}`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
      await fetchEvents();
    } catch {
      window.alert(`Failed to ${action} event. Please try again.`);
    } finally {
      setActionLoading(null);
    }
  };

  const statusClass = (status) => {
    if (status === 'approved') return 'bg-imperial-green/10 text-imperial-green border-imperial-green/20';
    if (status === 'rejected') return 'bg-patriot-red/10 text-patriot-red border-patriot-red/20';
    return 'bg-gold/15 text-[#9b6c00] border-gold/30';
  };

  return (
    <div className="min-h-screen bg-habesha-white">
      <Helmet>
        <title>Admin Dashboard - Habesha Events</title>
      </Helmet>

      <nav className="sticky top-0 z-50 border-b border-imperial-green/10 bg-habesha-white/92 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gold text-charcoal shadow-gold">
              <LayoutDashboard className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] font-black uppercase tracking-[0.24em] text-patriot-red">Control room</div>
              <div className="text-xl font-playfair font-black text-imperial-green">Habesha Admin</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="hidden sm:inline-flex rounded-full px-4 py-3 text-[11px] font-black uppercase tracking-[0.18em] text-gold hover:text-imperial-green transition-colors"
            >
              Public Site
            </Link>
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-2 rounded-2xl border border-gold/25 bg-white px-4 py-3 text-[11px] font-black uppercase tracking-[0.18em] text-gold hover:bg-gold hover:text-white transition-all"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-12">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between mb-12">
          <div>
            <div className="section-kicker">Admin dashboard</div>
            <h1 className="mt-5 text-5xl md:text-7xl font-playfair font-black text-gold leading-[0.96]">
            </h1>
            <div className="mt-4 h-1 w-28 rounded-full bg-gold" />
          </div>

          <div className="editorial-panel rounded-[24px] p-2 w-full max-w-md">
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setActiveTab('pending')}
                className={`inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-4 text-xs font-black uppercase tracking-[0.18em] transition-all ${activeTab === 'pending'
                    ? 'bg-gold text-charcoal shadow-gold'
                    : 'text-charcoal/60 hover:bg-imperial-green/5 hover:text-imperial-green'
                  }`}
              >
                <Clock3 className="w-4 h-4" />
                <span>Pending</span>
                {activeTab === 'pending' && events.length > 0 && (
                  <span className="rounded-full bg-charcoal px-2 py-1 text-[10px] text-white">
                    {events.length}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab('all')}
                className={`inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-4 text-xs font-black uppercase tracking-[0.18em] transition-all ${activeTab === 'all'
                    ? 'bg-imperial-green text-white shadow-imperial'
                    : 'text-charcoal/60 hover:bg-imperial-green/5 hover:text-imperial-green'
                  }`}
              >
                <CalendarDays className="w-4 h-4" />
                <span>History</span>
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="grid gap-6">
            {[1, 2, 3].map((item) => (
              <div key={item} className="editorial-panel h-40 skeleton-pulse rounded-[28px]" />
            ))}
          </div>
        ) : error ? (
          <ErrorCard message={error} onRetry={fetchEvents} />
        ) : events.length === 0 ? (
          <div className="editorial-panel relative overflow-hidden rounded-[32px] px-6 py-20 md:px-10 md:py-24 text-center">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(212,168,67,0.08),transparent_36%)]" />
            <div className="relative z-10 mx-auto max-w-xl">
              <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-full border border-gold/25 bg-gold/8">
                <CheckCircle2 className="w-14 h-14 text-charcoal" />
              </div>
              <h2 className="mt-8 text-4xl font-playfair font-black italic text-gold">
                {activeTab === 'pending' ? 'All Events Cleared' : 'No event history yet'}
              </h2>
              <p className="mt-4 text-base leading-relaxed text-charcoal/55">
                {activeTab === 'pending'
                  ? 'Nothing is waiting for review right now. New submissions will show up here when they arrive.'
                  : 'Once events move through the system, this archive view will populate automatically.'}
              </p>
            </div>
          </div>
        ) : activeTab === 'pending' ? (
          <div className="grid gap-6">
            {events.map((event) => (
              <div
                key={event.id}
                className="editorial-panel rounded-[30px] p-5 md:p-6 lg:p-7"
              >
                <div className="grid gap-6 lg:grid-cols-[260px_1fr] lg:items-start">
                  <div className="overflow-hidden rounded-[24px] border border-imperial-green/10 bg-habesha-white aspect-video">
                    {event.image_url ? (
                      <img src={event.image_url} alt={event.title} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-imperial-green/5 text-5xl font-playfair font-black text-imperial-green">
                        {event.title.charAt(0)}
                      </div>
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="rounded-full bg-patriot-red/10 px-3 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-patriot-red">
                        {event.category}
                      </span>
                      <span className="rounded-full bg-imperial-green/5 px-3 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-imperial-green">
                        {dayjs(event.created_at).fromNow()}
                      </span>
                    </div>

                    <h3 className="mt-4 text-3xl font-playfair font-black text-charcoal leading-tight">
                      {event.title}
                    </h3>

                    <p className="mt-3 text-sm leading-relaxed text-charcoal/58">
                      {event.description}
                    </p>

                    <div className="mt-5 flex flex-wrap gap-3 text-[11px] font-black uppercase tracking-[0.16em] text-charcoal/45">
                      <span>{event.city}</span>
                      <span>{event.location_name}</span>
                      <span>Host: {event.organizer_name}</span>
                    </div>

                    <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-imperial-green/10 pt-5">
                      <button
                        onClick={() => handleAction(event.id, 'approve')}
                        disabled={actionLoading === event.id}
                        className="inline-flex items-center gap-2 rounded-2xl bg-imperial-green px-5 py-3 text-xs font-black uppercase tracking-[0.18em] text-white shadow-imperial disabled:opacity-40"
                      >
                        <Check className="w-4 h-4" />
                        <span>{actionLoading === event.id ? 'Working...' : 'Approve'}</span>
                      </button>

                      <button
                        onClick={() => handleAction(event.id, 'reject')}
                        disabled={actionLoading === event.id}
                        className="inline-flex items-center gap-2 rounded-2xl border border-patriot-red/20 bg-white px-5 py-3 text-xs font-black uppercase tracking-[0.18em] text-patriot-red disabled:opacity-40"
                      >
                        <X className="w-4 h-4" />
                        <span>{actionLoading === event.id ? 'Working...' : 'Reject'}</span>
                      </button>

                      <Link
                        to={`/events/${event.id}`}
                        target="_blank"
                        className="inline-flex items-center gap-2 rounded-2xl px-3 py-3 text-[11px] font-black uppercase tracking-[0.18em] text-gold hover:text-imperial-green transition-colors"
                      >
                        <ExternalLink className="w-4 h-4" />
                        <span>Preview</span>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="editorial-panel overflow-hidden rounded-[30px]">
            <div className="overflow-x-auto no-scrollbar">
              <table className="w-full min-w-[840px] text-left">
                <thead className="border-b border-imperial-green/10 bg-imperial-green/4">
                  <tr className="text-[10px] font-black uppercase tracking-[0.2em] text-imperial-green/55">
                    <th className="px-6 py-5">Event</th>
                    <th className="px-6 py-5">Location</th>
                    <th className="px-6 py-5">Status</th>
                    <th className="px-6 py-5">Date</th>
                    <th className="px-6 py-5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-imperial-green/8">
                  {events.map((event) => (
                    <tr key={event.id} className="hover:bg-imperial-green/3 transition-colors">
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-4">
                          <div className="h-14 w-14 overflow-hidden rounded-2xl border border-imperial-green/10 bg-habesha-white">
                            {event.image_url ? (
                              <img src={event.image_url} alt={event.title} className="h-full w-full object-cover" />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-lg font-playfair font-black text-imperial-green">
                                {event.title.charAt(0)}
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="truncate text-lg font-playfair font-black text-charcoal">{event.title}</div>
                            <div className="mt-1 text-[10px] font-black uppercase tracking-[0.18em] text-charcoal/40">
                              {event.category}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-sm font-semibold text-charcoal/60">
                        <div>{event.city}</div>
                        <div className="mt-1 text-charcoal/40">{event.location_name}</div>
                      </td>
                      <td className="px-6 py-5">
                        <span className={`inline-flex rounded-full border px-3 py-2 text-[10px] font-black uppercase tracking-[0.18em] ${statusClass(event.status)}`}>
                          {event.status}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-sm font-semibold text-charcoal/55">
                        {formatEthiopianDate(event.start_date, i18n.language)}
                      </td>
                      <td className="px-6 py-5 text-right">
                        <button
                          onClick={() => handleAction(event.id, 'delete')}
                          disabled={actionLoading === event.id}
                          className="inline-flex items-center gap-2 rounded-2xl border border-patriot-red/15 bg-white px-4 py-3 text-[11px] font-black uppercase tracking-[0.18em] text-patriot-red disabled:opacity-40"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span>{actionLoading === event.id ? 'Working...' : 'Delete'}</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="mt-10 editorial-panel rounded-[26px] p-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-imperial-green text-white shadow-imperial">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] font-black uppercase tracking-[0.18em] text-patriot-red">Admin note</div>
              <div className="text-sm font-semibold text-charcoal/60">
                Review stays fast when this area stays clean and focused.
              </div>
            </div>
          </div>
          <Link to="/" className="btn-outline-gold rounded-full px-5 py-3 text-xs self-start md:self-auto">
            Back to public site
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
