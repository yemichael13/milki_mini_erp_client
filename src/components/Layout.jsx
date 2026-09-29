import { Link, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuth, normalizeRole } from '../contexts/AuthContext';
import ThemeToggle from './ThemeToggle';
import Logo from '../assets/logo.png';
import { FaUser } from "react-icons/fa";

const Layout = ({ children }) => {
  const { user } = useAuth();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  const canAccess = (roles) => {
    if (!user) return false;
    const role = normalizeRole(user.role);
    return roles.includes(role) || roles.includes(user.role);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex min-h-16 items-center justify-between gap-3">
            <div className="flex">
              <div className="shrink-0 flex items-center mr-4">
               
                <h1 className="text-xl font-bold text-gray-900 md:block hidden">Milki Financial System</h1>
                <h1 className='text-sm font-semibold text-gray-900 md:hidden mr-4'>Milki<br />Financial<br />System</h1>
              </div>
              <div className="hidden lg:ml-6 lg:flex lg:space-x-6">
                <Link
                  to="/dashboard"
                  className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  Dashboard
                </Link>
                {/* Customers shown to sales, accountant, general manager */}
                {canAccess(['sales', 'accountant', 'general_manager']) && (
                  <Link
                    to="/customers"
                    className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                  >
                    Customers
                  </Link>
                )}
                {/* Suppliers shown to procurement, accountant, general manager */}
                {canAccess(['procurement', 'general_manager', 'accountant']) && (
                  <Link
                    to="/suppliers"
                    className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                  >
                    Suppliers
                  </Link>
                )}
                {/* Transactions - all department officers, accountant, general manager */}
                {canAccess(['sales', 'procurement', 'production', 'accountant', 'general_manager']) && (
                  <Link
                    to="/transactions"
                    className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                  >
                    Transactions
                  </Link>
                )}
                {canAccess(['production_recorder', 'production_approver', 'general_manager', 'accountant']) && (
                  <Link
                    to="/production-inventory"
                    className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                  >
                    Production Inventory
                  </Link>
                )}
                {/* Reports only for general manager */}
                {canAccess(['general_manager', 'accountant']) && (
                  <Link
                    to="/reports"
                    className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                  >
                    Reports
                  </Link>
                )}
                {canAccess(['system_admin']) && (
                  <Link
                    to="/users"
                    className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                  >
                    Users
                  </Link>
                )}
              </div>
            </div>
            <div className="ml-auto flex items-center gap-2 sm:ml-4 sm:gap-3">
              
              <span className="hidden text-sm text-gray-700 xl:inline">
                {user?.full_name} ({user?.role})
              </span>
              <Link to="/profile" aria-label="Open profile" className="flex gap-2 rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
              <FaUser />
                <span className="hidden sm:inline">Profile</span>
              </Link>
              <ThemeToggle className="" />
              <button type="button" aria-label="Toggle navigation menu" aria-expanded={mobileOpen} onClick={() => setMobileOpen((open) => !open)} className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-slate-300 text-slate-700 transition hover:bg-slate-50 lg:hidden">
                <span className="sr-only">Menu</span>
                <span className="relative block h-5 w-5"><span className={`absolute left-0 top-1 block h-0.5 w-5 bg-current transition-transform duration-200 ${mobileOpen ? 'translate-y-2 rotate-45' : ''}`} /><span className={`absolute left-0 top-2.5 block h-0.5 w-5 bg-current transition-opacity duration-200 ${mobileOpen ? 'opacity-0' : ''}`} /><span className={`absolute left-0 top-4 block h-0.5 w-5 bg-current transition-transform duration-200 ${mobileOpen ? '-translate-y-1.5 -rotate-45' : ''}`} /></span>
              </button>
            </div>
          </div>
          <div className={`overflow-hidden transition-[max-height,opacity] duration-300 ease-in-out lg:hidden ${mobileOpen ? 'max-h-[32rem] opacity-100' : 'pointer-events-none max-h-0 opacity-0'}`}>
            <div className="space-y-1 border-t border-slate-200 py-3">
              <Link onClick={() => setMobileOpen(false)} to="/dashboard" className="block rounded-lg px-3 py-3 text-sm font-medium text-slate-700 hover:bg-slate-100">Dashboard</Link>
              {canAccess(['sales', 'accountant', 'general_manager']) && <Link onClick={() => setMobileOpen(false)} to="/customers" className="block rounded-lg px-3 py-3 text-sm font-medium text-slate-700 hover:bg-slate-100">Customers</Link>}
              {canAccess(['procurement', 'general_manager', 'accountant']) && <Link onClick={() => setMobileOpen(false)} to="/suppliers" className="block rounded-lg px-3 py-3 text-sm font-medium text-slate-700 hover:bg-slate-100">Suppliers</Link>}
              {canAccess(['sales', 'procurement', 'production', 'accountant', 'general_manager']) && <Link onClick={() => setMobileOpen(false)} to="/transactions" className="block rounded-lg px-3 py-3 text-sm font-medium text-slate-700 hover:bg-slate-100">Transactions</Link>}
              {canAccess(['production_recorder', 'production_approver', 'general_manager', 'accountant']) && <Link onClick={() => setMobileOpen(false)} to="/production-inventory" className="block rounded-lg px-3 py-3 text-sm font-medium text-slate-700 hover:bg-slate-100">Production Inventory</Link>}
              {canAccess(['general_manager', 'accountant']) && <Link onClick={() => setMobileOpen(false)} to="/reports" className="block rounded-lg px-3 py-3 text-sm font-medium text-slate-700 hover:bg-slate-100">Reports</Link>}
              {canAccess(['system_admin']) && <Link onClick={() => setMobileOpen(false)} to="/users" className="block rounded-lg px-3 py-3 text-sm font-medium text-slate-700 hover:bg-slate-100">Users</Link>}
              <Link onClick={() => setMobileOpen(false)} to="/profile" className="block rounded-lg px-3 py-3 text-sm font-medium text-slate-700 hover:bg-slate-100">Profile and account settings</Link>
            </div>
          </div>
        </div>
      </nav>
      <main className="mx-auto max-w-7xl overflow-x-clip px-4 py-5 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
};

export default Layout;
