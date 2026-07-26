import { Link } from 'react-router-dom';
import Logo from '../assets/logo.png';
import ThemeToggle from '../components/ThemeToggle';

const features = [
  {
    title: 'Secure Role-Based Authentication',
    description: 'Access is controlled by role so each team sees only the tools they need.',
    icon: 'shield',
  },
  {
    title: 'Financial Transaction Tracking',
    description: 'Sales, procurement, and accounting records stay connected from entry to approval.',
    icon: 'chart',
  },
  {
    title: 'Multi-Level Approval Workflow',
    description: 'Transactions move through the right review stages before they are finalized.',
    icon: 'workflow',
  },
  {
    title: 'Customer & Supplier Management',
    description: 'Maintain clean contact records for the relationships that keep operations moving.',
    icon: 'users',
  },
  {
    title: 'Production & Inventory Management',
    description: 'Monitor inventory movement and production records in one structured place.',
    icon: 'boxes',
  },
  {
    title: 'Receipt & Document Management',
    description: 'Keep supporting documents organized alongside the records they belong to.',
    icon: 'file',
  },
  {
    title: 'Real-Time Reports',
    description: 'Give managers a current view of the business without manual spreadsheet work.',
    icon: 'chart-line',
  },
  {
    title: 'Complete Audit Trail',
    description: 'Every key action is traceable for accountability and operational review.',
    icon: 'audit',
  },
];


const departments = [
  'Sales & Distribution',
  'Procurement',
  'Production',
  'Storage',
  'Accounting',
  'General Management',
  'System Administration',
];

const benefits = [
  {
    title: 'Transparency',
    description: 'Every transaction is fully traceable.',
    icon: 'eye',
  },
  {
    title: 'Accountability',
    description: 'Every action is linked to the responsible employee.',
    icon: 'badge',
  },
  {
    title: 'Accuracy',
    description: 'Automated calculations reduce manual errors.',
    icon: 'calculator',
  },
  {
    title: 'Security',
    description: 'Role-based access protects sensitive information.',
    icon: 'lock',
  },
  {
    title: 'Efficiency',
    description: 'Digital workflows replace manual paperwork.',
    icon: 'bolt',
  },
];

const Welcome = () => {
  const getIcon = (iconName, className = 'h-5 w-5') => {
    const icons = {
      shield: (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3l7 4v5c0 4.418-3.134 8.49-7 9-3.866-.51-7-4.582-7-9V7l7-4z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" />
        </svg>
      ),
      chart: (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 19V5m0 14h16M8 16v-5m4 5V8m4 8v-3" />
        </svg>
      ),
      'chart-line': (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 19h16M6 16l4-4 3 3 5-7" />
        </svg>
      ),
      workflow: (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h10v4H7V7zm0 6h10v4H7v-4z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11v2" />
        </svg>
      ),
      users: (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      boxes: (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.3 7.5L12 12l8.7-4.5M12 22V12" />
        </svg>
      ),
      file: (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 3h7l5 5v13a1 1 0 01-1 1H7a1 1 0 01-1-1V4a1 1 0 011-1z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 3v6h6" />
        </svg>
      ),
      audit: (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 11l3 3L22 4" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-3.515-7.127" />
        </svg>
      ),
      manager: (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2l2.5 5 5.5.8-4 3.9.9 5.5L12 14.7 7.1 17.2l.9-5.5-4-3.9 5.5-.8L12 2z" />
        </svg>
      ),
      check: (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12a7 7 0 1114 0 7 7 0 01-14 0z" />
        </svg>
      ),
      eye: (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14a2 2 0 100-4 2 2 0 000 4z" />
        </svg>
      ),
      badge: (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15l-3.5 2 1-4L6 10l4.1-.3L12 6l1.9 3.7L18 10l-3.5 3 1 4L12 15z" />
        </svg>
      ),
      calculator: (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 3h10a1 1 0 011 1v16a1 1 0 01-1 1H7a1 1 0 01-1-1V4a1 1 0 011-1z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h8M8 11h2m2 0h2m2 0h2M8 15h2m2 0h2m2 0h2" />
        </svg>
      ),
      lock: (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V8a4 4 0 10-8 0v3M5 11h14v9H5v-9z" />
        </svg>
      ),
      bolt: (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 2L4 14h6l-1 8 9-12h-6l1-8z" />
        </svg>
      ),
      arrow: (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h12m-5-5l5 5-5 5" />
        </svg>
      ),
      star: (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3l2.4 5.7 6.1.5-4.6 3.9 1.4 6-5.3-3.2-5.3 3.2 1.4-6L3.5 9.2l6.1-.5L12 3z" />
        </svg>
      ),
    };

    return icons[iconName] || icons.star;
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-50 text-slate-900">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(14,165,233,0.16),_transparent_30%),radial-gradient(circle_at_top_right,_rgba(16,185,129,0.14),_transparent_28%),linear-gradient(180deg,_#f8fafc_0%,_#eef2ff_100%)]" />
      <div
        className="absolute inset-0 bg-cover bg-center opacity-[0.04]"
        style={{ backgroundImage: `url(${Logo})` }}
      />

      <header className="relative">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-5 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white shadow-lg shadow-slate-900/15">
              <img src={Logo} alt="Milki logo" className="h-7 w-7 object-contain" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">
                Milki Financial & Inventory Management
              </p>
              <p className="text-sm text-slate-600">Financial Workflow & Operations Management System</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link
              to="/login"
              className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-slate-900/15 transition hover:-translate-y-0.5 hover:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-slate-300"
            >
              Login
              {getIcon('arrow', 'h-4 w-4')}
            </Link>
          </div>
        </div>
      </header>

      <main className="relative mx-auto max-w-7xl px-4 pb-16 pt-4 sm:px-6 lg:px-8">
        <section className="grid items-center gap-8 py-6 lg:grid-cols-[1.1fr_0.9fr] lg:py-10">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-white/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-sky-700 shadow-sm">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Enterprise Operations Platform
            </div>

            <h1 className="mt-6 text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
              Milki Financial & Inventory Management
            </h1>

            <p className="mt-4 text-lg font-medium text-slate-700 sm:text-xl">
              Financial Workflow & Operations Management System
            </p>

            <p className="mt-5 max-w-2xl text-base leading-8 text-slate-600">
              Milki Financial & Inventory Management is a centralized enterprise management platform designed to streamline financial workflows,
              improve operational transparency, and ensure accountability across Sales, Procurement, Production,
              Storage, Accounting, and Management through structured approval processes and real-time reporting.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                to="/login"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-slate-950/15 transition hover:-translate-y-0.5 hover:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-slate-300"
              >
                Login
                {getIcon('arrow', 'h-4 w-4')}
              </Link>
              <a
                href="#features"
                className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-6 py-3.5 text-sm font-semibold text-slate-800 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-400 hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-slate-200"
              >
                Learn More
              </a>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {[
                { label: 'Departments', value: '7 connected units' },
                { label: 'Workflow', value: 'Approval driven' },
                { label: 'Reporting', value: 'Real time visibility' },
              ].map((item) => (
                <div key={item.label} className="rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">{item.label}</p>
                  <p className="mt-2 text-sm font-semibold text-slate-900">{item.value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="rounded-[2rem] border border-slate-200/80 bg-white/90 p-6 shadow-[0_24px_70px_rgba(15,23,42,0.12)] backdrop-blur">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">
                    System Snapshot
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
                    Enterprise visibility in one place
                  </h2>
                </div>
                <div className="rounded-2xl bg-slate-950 p-3 text-white shadow-lg shadow-slate-950/15">
                  {getIcon('star')}
                </div>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {[
                  { label: 'Audit trail', value: 'Every action is recorded', icon: 'audit' },
                  { label: 'Access control', value: 'Role-based permissions', icon: 'shield' },
                  { label: 'Financial data', value: 'Tracked from entry to report', icon: 'chart' },
                  { label: 'Operations', value: 'Connected across departments', icon: 'workflow' },
                ].map((item) => (
                  <div key={item.label} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-slate-700 ring-1 ring-slate-200">
                        {getIcon(item.icon)}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{item.label}</p>
                        <p className="mt-1 text-sm text-slate-600">{item.value}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 rounded-2xl border border-slate-200 bg-gradient-to-r from-slate-900 to-slate-800 p-5 text-white">
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-300">
                  Designed for business operations
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-200">
                  Clean approval paths, accurate records, and practical reporting help teams work with confidence.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section id="about" className="py-8">
          <div className="grid gap-6 lg:grid-cols-[0.75fr_1.25fr]">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">About</p>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
                What is Milki Financial & Inventory Management?
              </h2>
            </div>
            <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <p className="text-base leading-8 text-slate-600">
                Milki Financial & Inventory Management is an internal enterprise resource planning system developed to digitize operational and
                financial workflows. The platform enables departments to record, review, approve, and monitor business
                transactions while maintaining complete financial transparency, accountability, and an auditable
                history of every operation.
              </p>
              <p className="mt-4 text-base leading-8 text-slate-600">
                The system reduces manual paperwork, improves collaboration between departments, and provides
                management with accurate real-time operational insights.
              </p>
            </div>
          </div>
        </section>

        <section id="features" className="py-8">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">Key Features</p>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
                Built for controlled enterprise work
              </h2>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {features.map((feature) => (
              <article
                key={feature.title}
                className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-md shadow-slate-950/15">
                  {getIcon(feature.icon)}
                </div>
                <h3 className="mt-4 text-base font-semibold text-slate-900">{feature.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{feature.description}</p>
              </article>
            ))}
          </div>
        </section>

        

        <section className="py-8">
          <div className="mb-6">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">Supported Departments</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
              Built for the teams that keep the business moving
            </h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {departments.map((item) => (
              <div key={item} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
                    {getIcon('users')}
                  </div>
                  <p className="text-sm font-semibold text-slate-900">{item}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="py-8">
          <div className="mb-6">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">Benefits</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
              Practical value for day-to-day operations
            </h2>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            {benefits.map((item) => (
              <article key={item.title} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-white">
                  {getIcon(item.icon)}
                </div>
                <h3 className="mt-4 text-base font-semibold text-slate-900">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{item.description}</p>
              </article>
            ))}
          </div>
        </section>
      </main>

      <footer className="relative border-t border-slate-200 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-6 text-sm text-slate-600 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div>
            <p className="font-semibold text-slate-900">Milki ERP</p>
            <p>Version 1.0</p>
          </div>
          <p>© Milki Food Processing PLC.</p>
          <p>Secure • Transparent • Accountable</p>
        </div>
      </footer>
    </div>
  );
};

export default Welcome;
