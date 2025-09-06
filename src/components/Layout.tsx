import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Home,
  Users,
  UserPlus,
  Wrench,
  FileText,
  Settings,
  LogOut,
  AlertCircle,
} from 'lucide-react';
import { supabase } from '../lib/supabase';

const navigation = [
  { name: 'Dashboard', href: '/', icon: Home },
  { name: 'Call Follow Up', href: '/leads', icon: UserPlus },
  { name: 'Service Tracker', href: '/services', icon: Wrench },
  { name: 'Customer Requirement', href: '/requirements', icon: FileText },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const isMockMode = import.meta.env.VITE_DATA_SOURCE === 'mock' || !import.meta.env.VITE_DATA_SOURCE;

  async function handleSignOut() {
    await supabase.auth.signOut();
    localStorage.clear();
    sessionStorage.clear();
    navigate('/signin', { replace: true });
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mock Data Banner */}
      {isMockMode && (
        <div className="bg-yellow-50 border-b border-yellow-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center py-2">
              <AlertCircle className="h-4 w-4 text-yellow-600 mr-2" />
              <p className="text-sm text-yellow-800">
                Mock data mode – nothing is saved to cloud.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg">
        <div className="flex h-16 items-center justify-center border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-900">RS Car Accessories</h1>
        </div>
        <nav className="mt-8 px-4">
          <ul className="space-y-2">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <li key={item.name}>
                  <Link
                    to={item.href}
                    className={`flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <item.icon className="mr-3 h-5 w-5" />
                    {item.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        <div className="absolute bottom-4 left-4 right-4">
          <button 
            onClick={handleSignOut}
            className="flex w-full items-center rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
          >
            <LogOut className="mr-3 h-5 w-5" />
            Sign Out
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="pl-64">
        <main className="py-8">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}


