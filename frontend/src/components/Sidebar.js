import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard,
  Upload,
  Edit3,
  FileText,
  BarChart3,
  LogOut,
  Sparkles,
} from 'lucide-react';

export default function Sidebar({ user, onLogout }) {
  const location = useLocation();

  const navItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', labelHi: 'डैशबोर्ड' },
    { path: '/upload', icon: Upload, label: 'Upload', labelHi: 'अपलोड' },
    { path: '/entry', icon: Edit3, label: 'Manual Entry', labelHi: 'डेटा एंट्री' },
    { path: '/reports', icon: FileText, label: 'Reports', labelHi: 'रिपोर्ट्स' },
    { path: '/analytics', icon: BarChart3, label: 'Analytics', labelHi: 'विश्लेषण' },
  ];

  return (
    <aside
      data-testid="sidebar"
      className="w-72 bg-white border-r border-slate-200 flex flex-col"
    >
      <div className="p-6 border-b border-slate-200">
        <div className="flex items-center mb-4">
          <div className="h-12 w-12 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center mr-3">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2
              className="text-xl font-bold"
              style={{ fontFamily: 'Outfit, sans-serif' }}
            >
              <span className="text-gradient">Sudarshan AI</span>
            </h2>
            <p className="text-xs text-slate-500">Business Portal</p>
          </div>
        </div>
        <div className="bg-slate-50 rounded-xl p-3">
          <p className="text-sm font-medium text-slate-700">{user.username}</p>
          <p className="text-xs text-slate-500">{user.email}</p>
        </div>
      </div>

      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  data-testid={`nav-${item.label.toLowerCase().replace(' ', '-')}`}
                  className={`flex items-center px-4 py-3 rounded-xl transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-lg shadow-indigo-500/30'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-indigo-600'
                  }`}
                >
                  <Icon className={`h-5 w-5 mr-3 ${isActive ? '' : 'text-slate-500'}`} />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{item.label}</p>
                    <p className={`text-xs ${isActive ? 'text-indigo-100' : 'text-slate-400'}`}>
                      {item.labelHi}
                    </p>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-4 border-t border-slate-200">
        <Button
          data-testid="logout-button"
          onClick={onLogout}
          variant="outline"
          className="w-full justify-start text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 rounded-xl"
        >
          <LogOut className="h-5 w-5 mr-3" />
          Logout
        </Button>
      </div>
    </aside>
  );
}