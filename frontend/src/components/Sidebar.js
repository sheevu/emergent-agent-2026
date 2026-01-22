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
      className="w-72 bg-white/80 backdrop-blur-xl border-r border-white/40 shadow-sm flex flex-col"
    >
      <div className="p-6 border-b border-white/60">
        <div className="flex items-center mb-5">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-indigo-600 via-indigo-500 to-pink-500 flex items-center justify-center mr-3 shadow-lg shadow-indigo-500/30">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2
              className="text-xl font-bold leading-tight"
              style={{ fontFamily: 'Outfit, sans-serif' }}
            >
              <span className="text-gradient">Sudarshan AI</span>
            </h2>
            <p className="text-xs text-slate-500">Voice Insight Hub</p>
          </div>
        </div>
        <div className="bg-white/80 rounded-2xl p-4 border border-slate-100 shadow-sm">
          <p className="text-sm font-semibold text-slate-700">{user.username}</p>
          <p className="text-xs text-slate-500">{user.email}</p>
          <div className="mt-3 inline-flex items-center rounded-full bg-indigo-50 px-3 py-1 text-[10px] font-semibold text-indigo-700">
            Live Insights Enabled
          </div>
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
                  className={`flex items-center px-4 py-3 rounded-2xl transition-colors ${
                    isActive
                      ? 'bg-gradient-to-r from-indigo-600 via-indigo-500 to-pink-500 text-white shadow-lg shadow-indigo-500/30'
                      : 'text-slate-600 hover:bg-white hover:text-indigo-600'
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

      <div className="p-4 border-t border-white/60">
        <Button
          data-testid="logout-button"
          onClick={onLogout}
          variant="outline"
          className="w-full justify-start text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 rounded-2xl"
        >
          <LogOut className="h-5 w-5 mr-3" />
          Logout
        </Button>
      </div>
    </aside>
  );
}
