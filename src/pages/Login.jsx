import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import ThemeToggle from '../components/ThemeToggle';
import Logo from '../assets/logo.png';

const features = [
  {
    title: 'Department workspaces',
    description: 'Sales, procurement, production, accounting, and admin teams each get a focused view.',
    icon: 'grid',
  },
  {
    title: 'Approval flow',
    description: 'Track pending work, reviews, and confirmations without hunting through scattered screens.',
    icon: 'shield-check',
  },
  {
    title: 'Financial visibility',
    description: 'See customers, suppliers, balances, and reports in a single connected system.',
    icon: 'chart',
  },
];

const highlights = [
  { label: 'Departments', value: '5 core modules' },
  { label: 'Workflow', value: 'Approval driven' },
  { label: 'Records', value: 'Audit friendly' },
];

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const getIcon = (iconName) => {
    const icons = {
      grid: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4h6v6H4V4zm10 0h6v6h-6V4zM4 14h6v6H4v-6zm10 0h6v6h-6v-6z" />
        </svg>
      ),
      'shield-check': (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3l7 4v5c0 4.418-3.134 8.49-7 9-3.866-.51-7-4.582-7-9V7l7-4z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" />
        </svg>
      ),
      chart: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 19V5m0 14h16M8 16v-5m4 5V8m4 8v-3" />
        </svg>
      ),
      mail: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8.5l9 6 9-6M5 6h14a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2z" />
        </svg>
      ),
      lock: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V8a4 4 0 10-8 0v3M5 11h14v9H5v-9z" />
        </svg>
      ),
      arrow: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h12m-5-5l5 5-5 5" />
        </svg>
      ),
    };

    return icons[iconName] || icons.grid;
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-900">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(14,165,233,0.28),_transparent_30%),radial-gradient(circle_at_top_right,_rgba(16,185,129,0.18),_transparent_26%),linear-gradient(180deg,_#020617_0%,_#0f172a_48%,_#e2e8f0_100%)]" />
      <div
        className="absolute inset-0 bg-cover bg-center opacity-[0.05] blur-[1px]"
        style={{ backgroundImage: `url(${Logo})` }}
      />

      <div className="absolute right-4 top-4 z-20 sm:right-6 sm:top-6">
        <ThemeToggle />
      </div>

      <div className="relative mx-auto flex min-h-screen max-w-7xl items-center px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid w-full gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="flex flex-col justify-between rounded-[2rem] border border-white/10 bg-white/10 p-6 text-white shadow-[0_24px_80px_rgba(15,23,42,0.35)] backdrop-blur md:p-10">
            <div>
              <div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-cyan-100">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                Milki Financial & Inventory Management System
              </div>

              <div className="mt-8 max-w-2xl">
                <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
                  A cleaner way to run your financial operations.
                </h1>
                <p className="mt-5 max-w-xl text-sm leading-7 text-slate-200 sm:text-base">
                  Milki brings sales, procurement, production, accounting, and administration into one organized workspace.
                  Use it to keep approvals visible, records consistent, and teams aligned.
                </p>
              </div>

              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                {highlights.map((item) => (
                  <div key={item.label} className="rounded-2xl border border-white/10 bg-slate-950/30 p-4">
                    <p className="text-xs uppercase tracking-[0.24em] text-slate-400">{item.label}</p>
                    <p className="mt-2 text-sm font-semibold text-white">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8 grid gap-4">
              {features.map((feature) => (
                <div
                  key={feature.title}
                  className="flex gap-4 rounded-2xl border border-white/10 bg-black/40 p-4 transition hover:bg-black/20"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-slate-900">
                    {getIcon(feature.icon)}
                  </div>
                  <div>
                    <h2 className="text-sm font-semibold text-white">{feature.title}</h2>
                    <p className="mt-1 text-sm leading-6 text-slate-300">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-3 text-xs text-slate-300">
              <span className="rounded-full border border-black/10 bg-black/70 px-3 py-1.5">Secure access</span>
              <span className="rounded-full border border-black/10 bg-black/70 px-3 py-1.5">Role-based dashboards</span>
              <span className="rounded-full border border-black/10 bg-black/70 px-3 py-1.5">Operational overview</span>
            </div>
          </section>

          <section className="flex items-center justify-center">
            <div className="w-full max-w-md rounded-[2rem] border border-slate-200/80 bg-white/90 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.16)] backdrop-blur md:p-8">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-white shadow-lg shadow-slate-950/20">
                  <img src={Logo} alt="Milki logo" className="h-9 w-9 object-contain" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">
                    Sign in
                  </p>
                  <h2 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">
                    Welcome back
                  </h2>
                </div>
              </div>

              <p className="mt-4 text-sm leading-6 text-slate-600">
                Access your workspace and continue where your team left off.
              </p>

              <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
                {error && (
                  <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                    {error}
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <label htmlFor="email" className="mb-2 block text-sm font-medium text-slate-700">
                      Email address
                    </label>
                    <div className="relative">
                      <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
                        {getIcon('mail')}
                      </span>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        required
                        className="w-full rounded-2xl border border-slate-200 bg-white px-12 py-3.5 text-slate-900 placeholder:text-slate-400 shadow-sm outline-none transition focus:border-slate-400 focus:ring-4 focus:ring-slate-200"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="password" className="mb-2 block text-sm font-medium text-slate-700">
                      Password
                    </label>
                    <div className="relative">
                      <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
                        {getIcon('lock')}
                      </span>
                      <input
                        id="password"
                        name="password"
                        type="password"
                        required
                        className="w-full rounded-2xl border border-slate-200 bg-white px-12 py-3.5 text-slate-900 placeholder:text-slate-400 shadow-sm outline-none transition focus:border-slate-400 focus:ring-4 focus:ring-slate-200"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="group inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-slate-950/15 transition hover:-translate-y-0.5 hover:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-slate-300 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
                >
                  {loading ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Signing in...
                    </>
                  ) : (
                    <>
                      Sign in
                      <span className="transition group-hover:translate-x-0.5">
                        {getIcon('arrow')}
                      </span>
                    </>
                  )}
                </button>
              </form>

              <div className="mt-6 rounded-2xl bg-slate-50 px-4 py-3">
                <p className="text-xs leading-5 text-slate-500">
                  Designed for authorized staff across the business. If you do not have access, please contact your system administrator.
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Login;
