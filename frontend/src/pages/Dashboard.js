import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Sidebar from '@/components/Sidebar';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { TrendingUp, ShoppingCart, CreditCard, Activity, Sparkles } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function Dashboard({ user, onLogout }) {
  const [report, setReport] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [reportRes, analyticsRes] = await Promise.all([
        axios.post(`${API}/generate-report/${user.user_id}`),
        axios.get(`${API}/analytics/${user.user_id}?days=7`),
      ]);
      setReport(reportRes.data);
      setAnalytics(analyticsRes.data);
    } catch (error) {
      toast.error('डेटा लोड नहीं हो सका | Failed to load data');
    } finally {
      setLoading(false);
    }
  };

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
      
      <main data-testid="dashboard-main" className="flex-1 overflow-y-auto p-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1
              className="text-4xl font-bold mb-2"
              style={{ fontFamily: 'Outfit, sans-serif' }}
            >
              <span className="text-gradient">Dashboard</span>
            </h1>
            <p className="text-slate-600">
              नमस्ते, {user.username}! आज का व्यवसाय सारांश | Today's Business Summary
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card data-testid="sales-card" className="glass-card p-6 border-l-4 border-l-green-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 mb-1">बिक्री | Sales</p>
                  <p className="text-3xl font-bold text-green-600" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                    ₹{report?.sales_total?.toLocaleString('en-IN') || '0'}
                  </p>
                </div>
                <div className="h-14 w-14 rounded-full bg-green-100 flex items-center justify-center">
                  <TrendingUp className="h-7 w-7 text-green-600" />
                </div>
              </div>
            </Card>

            <Card data-testid="purchase-card" className="glass-card p-6 border-l-4 border-l-blue-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 mb-1">खरीद | Purchase</p>
                  <p className="text-3xl font-bold text-blue-600" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                    ₹{report?.purchase_total?.toLocaleString('en-IN') || '0'}
                  </p>
                </div>
                <div className="h-14 w-14 rounded-full bg-blue-100 flex items-center justify-center">
                  <ShoppingCart className="h-7 w-7 text-blue-600" />
                </div>
              </div>
            </Card>

            <Card data-testid="expense-card" className="glass-card p-6 border-l-4 border-l-orange-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 mb-1">खर्च | Expense</p>
                  <p className="text-3xl font-bold text-orange-600" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                    ₹{report?.expense_total?.toLocaleString('en-IN') || '0'}
                  </p>
                </div>
                <div className="h-14 w-14 rounded-full bg-orange-100 flex items-center justify-center">
                  <CreditCard className="h-7 w-7 text-orange-600" />
                </div>
              </div>
            </Card>

            <Card data-testid="net-card" className="glass-card p-6 border-l-4 border-l-purple-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 mb-1">शुद्ध | Net</p>
                  <p className="text-3xl font-bold text-purple-600" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                    ₹{report?.net_amount?.toLocaleString('en-IN') || '0'}
                  </p>
                </div>
                <div className="h-14 w-14 rounded-full bg-purple-100 flex items-center justify-center">
                  <Activity className="h-7 w-7 text-purple-600" />
                </div>
              </div>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <Card data-testid="trend-chart" className="glass-card p-6">
              <h3 className="text-xl font-semibold mb-4" style={{ fontFamily: 'Outfit, sans-serif' }}>
                7 Days Trend
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={analytics?.chart_data || []}>
                  <defs>
                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#16a34a" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#16a34a" stopOpacity={0.1} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="date" stroke="#64748b" style={{ fontSize: '12px' }} />
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
                    dot={{ fill: '#16a34a', r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="purchase"
                    stroke="#3b82f6"
                    strokeWidth={3}
                    dot={{ fill: '#3b82f6', r: 4 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="expense"
                    stroke="#f97316"
                    strokeWidth={3}
                    dot={{ fill: '#f97316', r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Card>

            <Card data-testid="comparison-chart" className="glass-card p-6">
              <h3 className="text-xl font-semibold mb-4" style={{ fontFamily: 'Outfit, sans-serif' }}>
                Category Comparison
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={[
                    {
                      name: 'Today',
                      Sales: report?.sales_total || 0,
                      Purchase: report?.purchase_total || 0,
                      Expense: report?.expense_total || 0,
                    },
                  ]}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="name" stroke="#64748b" />
                  <YAxis stroke="#64748b" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      border: 'none',
                      borderRadius: '12px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    }}
                  />
                  <Legend />
                  <Bar dataKey="Sales" fill="#16a34a" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="Purchase" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="Expense" fill="#f97316" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </div>

          {/* Insights & Action Points */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card data-testid="insights-card" className="glass-card p-6 border-t-4 border-t-indigo-500">
              <div className="flex items-center mb-4">
                <Sparkles className="h-6 w-6 text-indigo-600 mr-2" />
                <h3 className="text-xl font-semibold" style={{ fontFamily: 'Outfit, sans-serif' }}>
                  AI Insights
                </h3>
              </div>
              <p className="text-slate-700 leading-relaxed">{report?.insights || 'Generating insights...'}</p>
            </Card>

            <Card data-testid="action-points-card" className="glass-card p-6 border-t-4 border-t-orange-500">
              <h3 className="text-xl font-semibold mb-4" style={{ fontFamily: 'Outfit, sans-serif' }}>
                5 Action Points for Tomorrow
              </h3>
              <ul className="space-y-3">
                {report?.action_points?.map((point, index) => (
                  <li key={index} className="flex items-start">
                    <span className="flex-shrink-0 h-7 w-7 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-sm font-bold mr-3">
                      {index + 1}
                    </span>
                    <span className="text-slate-700 pt-1">{point}</span>
                  </li>
                )) || (
                  <li className="text-slate-500">No action points available</li>
                )}
              </ul>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}