import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Card } from '@/components/ui/card';
import Sidebar from '@/components/Sidebar';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { BarChart3, TrendingUp, PieChart } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function Analytics({ user, onLogout }) {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = useCallback(async () => {
    try {
      const response = await axios.get(`${API}/analytics/${user.user_id}?days=30`);
      setAnalytics(response.data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  }, [user.user_id]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  if (loading) {
    return (
      <div className="flex h-screen">
        <Sidebar user={user} onLogout={onLogout} />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar user={user} onLogout={onLogout} />
      
      <main data-testid="analytics-main" className="flex-1 overflow-y-auto p-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1
              className="text-4xl font-bold mb-2"
              style={{ fontFamily: 'Outfit, sans-serif' }}
            >
              <span className="text-gradient">Analytics</span>
            </h1>
            <p className="text-slate-600">
              पिछले 30 दिनों का विश्लेषण | Last 30 days analysis
            </p>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="glass-card p-6 border-t-4 border-t-green-500">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-slate-600">Total Sales</p>
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
              <p className="text-3xl font-bold text-green-600" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                ₹{analytics?.totals?.sales?.toLocaleString('en-IN') || '0'}
              </p>
            </Card>

            <Card className="glass-card p-6 border-t-4 border-t-blue-500">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-slate-600">Total Purchase</p>
                <BarChart3 className="h-5 w-5 text-blue-600" />
              </div>
              <p className="text-3xl font-bold text-blue-600" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                ₹{analytics?.totals?.purchase?.toLocaleString('en-IN') || '0'}
              </p>
            </Card>

            <Card className="glass-card p-6 border-t-4 border-t-orange-500">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-slate-600">Total Expense</p>
                <PieChart className="h-5 w-5 text-orange-600" />
              </div>
              <p className="text-3xl font-bold text-orange-600" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                ₹{analytics?.totals?.expense?.toLocaleString('en-IN') || '0'}
              </p>
            </Card>

            <Card className="glass-card p-6 border-t-4 border-t-purple-500">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-slate-600">Net Profit</p>
                <TrendingUp className="h-5 w-5 text-purple-600" />
              </div>
              <p
                className={`text-3xl font-bold ${
                  (analytics?.totals?.net || 0) >= 0 ? 'text-purple-600' : 'text-red-600'
                }`}
                style={{ fontFamily: 'JetBrains Mono, monospace' }}
              >
                ₹{analytics?.totals?.net?.toLocaleString('en-IN') || '0'}
              </p>
            </Card>
          </div>

          {/* Trend Chart */}
          <Card data-testid="analytics-trend-chart" className="glass-card p-6 mb-8">
            <h3 className="text-2xl font-semibold mb-6" style={{ fontFamily: 'Outfit, sans-serif' }}>
              30-Day Trend Analysis
            </h3>
            <ResponsiveContainer width="100%" height={400}>
              <AreaChart data={analytics?.chart_data || []}>
                <defs>
                  <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#16a34a" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="purchaseGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis
                  dataKey="date"
                  stroke="#64748b"
                  style={{ fontSize: '12px' }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis stroke="#64748b" style={{ fontSize: '12px' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: 'none',
                    borderRadius: '12px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  }}
                />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="sales"
                  stroke="#16a34a"
                  strokeWidth={2}
                  fill="url(#salesGradient)"
                />
                <Area
                  type="monotone"
                  dataKey="purchase"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  fill="url(#purchaseGradient)"
                />
                <Area
                  type="monotone"
                  dataKey="expense"
                  stroke="#f97316"
                  strokeWidth={2}
                  fill="url(#expenseGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </Card>

          {/* Line Chart for Detailed View */}
          <Card data-testid="analytics-line-chart" className="glass-card p-6">
            <h3 className="text-2xl font-semibold mb-6" style={{ fontFamily: 'Outfit, sans-serif' }}>
              Detailed Performance
            </h3>
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={analytics?.chart_data || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis
                  dataKey="date"
                  stroke="#64748b"
                  style={{ fontSize: '12px' }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis stroke="#64748b" style={{ fontSize: '12px' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: 'none',
                    borderRadius: '12px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="sales"
                  stroke="#16a34a"
                  strokeWidth={3}
                  dot={{ fill: '#16a34a', r: 5 }}
                  activeDot={{ r: 7 }}
                />
                <Line
                  type="monotone"
                  dataKey="purchase"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  dot={{ fill: '#3b82f6', r: 5 }}
                  activeDot={{ r: 7 }}
                />
                <Line
                  type="monotone"
                  dataKey="expense"
                  stroke="#f97316"
                  strokeWidth={3}
                  dot={{ fill: '#f97316', r: 5 }}
                  activeDot={{ r: 7 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </div>
      </main>
    </div>
  );
}
