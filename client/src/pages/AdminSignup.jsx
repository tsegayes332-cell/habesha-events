import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AlertCircle, ArrowLeft, KeyRound, Lock, Mail, UserPlus } from 'lucide-react';

const AdminSignup = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      navigate('/admin/dashboard');
    }
  }, [navigate]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(`${(import.meta.env.VITE_API_URL || '')}/api/admin/signup`, {
        email,
        password,
        invite_code: inviteCode,
      });
      localStorage.setItem('adminToken', response.data.token);
      navigate('/admin/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-habesha-white relative overflow-hidden">
      <Helmet>
        <title>Admin Signup - Habesha Events</title>
      </Helmet>

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(212,168,67,0.16),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(0,77,44,0.08),transparent_26%)]" />

      <div className="relative z-10 min-h-screen px-4 py-10 md:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto min-h-[calc(100vh-5rem)] grid items-center gap-10 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="hidden lg:block">
            <div className="max-w-xl">
              <div className="section-kicker">New access</div>
              <h1 className="mt-6 text-6xl font-playfair font-black leading-[0.95] text-imperial-green">
                Join the control room.
              </h1>
              <p className="mt-6 text-base leading-relaxed text-charcoal/58">
                Create an administrator account to help manage events, approve submissions, and keep the Habesha Events platform vibrant.
              </p>
            </div>
          </div>

          <div className="editorial-panel rounded-[34px] p-8 md:p-10 lg:p-12 max-w-xl w-full lg:justify-self-end">
            <Link
              to="/"
              className="inline-flex h-16 w-16 items-center justify-center rounded-[22px] bg-gold text-charcoal shadow-gold"
            >
              <UserPlus className="w-7 h-7" />
            </Link>

            <div className="mt-8">
              <div className="text-[10px] font-black uppercase tracking-[0.24em] text-patriot-red">
                Sanctuary registration
              </div>
              <h2 className="mt-3 text-4xl md:text-5xl font-playfair font-black text-imperial-green">
                Create Admin
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-charcoal/55">
                Register as a new administrator to access the sanctuary control dashboard.
              </p>
            </div>

            {error && (
              <div className="mt-8 flex items-start gap-3 rounded-[22px] border border-patriot-red/15 bg-patriot-red/6 px-4 py-4 text-patriot-red">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <p className="text-sm font-semibold">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-8 space-y-6">
              <div>
                <label className="mb-3 block text-[10px] font-black uppercase tracking-[0.2em] text-imperial-green/55">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-imperial-green/35" />
                  <input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    required
                    placeholder="your@email.com"
                    className="habesha-input w-full pl-12 py-4 text-base"
                  />
                </div>
              </div>

              <div>
                <label className="mb-3 block text-[10px] font-black uppercase tracking-[0.2em] text-imperial-green/55">
                  Admin Invite Code
                </label>
                <div className="relative">
                  <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-imperial-green/35" />
                  <input
                    type="text"
                    value={inviteCode}
                    onChange={(event) => setInviteCode(event.target.value)}
                    required
                    placeholder="Required invite code"
                    className="habesha-input w-full pl-12 py-4 text-base"
                  />
                </div>
              </div>

              <div>
                <label className="mb-3 block text-[10px] font-black uppercase tracking-[0.2em] text-imperial-green/55">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-imperial-green/35" />
                  <input
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    required
                    placeholder="Create a password"
                    className="habesha-input w-full pl-12 py-4 text-base"
                  />
                </div>
              </div>

              <div>
                <label className="mb-3 block text-[10px] font-black uppercase tracking-[0.2em] text-imperial-green/55">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-imperial-green/35" />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    required
                    placeholder="Repeat password"
                    className="habesha-input w-full pl-12 py-4 text-base"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full rounded-2xl py-4 text-base disabled:opacity-40"
              >
                {loading ? 'Creating account...' : 'Sign Up as Admin'}
              </button>
            </form>

            <div className="mt-8 pt-8 border-t border-imperial-green/10 text-center">
              <p className="text-sm text-charcoal/50">
                Already have an account?{' '}
                <Link to="/admin/login" className="font-bold text-gold hover:text-imperial-green transition-colors">
                  Log in here
                </Link>
              </p>
            </div>

            <Link
              to="/"
              className="mt-8 inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.2em] text-gold hover:text-imperial-green transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to public site</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSignup;
