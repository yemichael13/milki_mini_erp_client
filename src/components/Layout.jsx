import { Link, useNavigate } from 'react-router-dom';
import { useAuth, normalizeRole } from '../contexts/AuthContext';
import Logo from '../assets/logo.png';

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const canAccess = (roles) => {
    if (!user) return false;
    const role = normalizeRole(user.role);
    return roles.includes(role) || roles.includes(user.role);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="shrink-0 flex items-center">
               
                <h1 className="text-xl font-bold text-gray-900 md:block hidden">Milki Financial System</h1>
                <h1 className='text-sm font-semibold text-gray-900 md:hidden mr-4'>Milki<br />Financial<br />System</h1>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
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
            <div className="flex items-center">
              <span className="text-sm text-gray-700 mr-4">
                {user?.full_name} ({user?.role})
              </span>
              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-800 text-white px-4 py-2 rounded-md text-sm font-medium cursor-pointer"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
};

export default Layout;
