import { useCallback, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import Sidebar from '@/components/Sidebar';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  Activity,
  ArrowUpRight,
  Boxes,
  ClipboardList,
  CreditCard,
  FileText,
  Mic,
  PhoneCall,
  ShoppingCart,
  Sparkles,
  TrendingUp,
  UploadCloud,
  Users,
} from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function Dashboard({ user, onLogout }) {
  const [report, setReport] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchDashboardData = useCallback(async () => {
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
  }, [user.user_id]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

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

      <main data-testid="dashboard-main" className="flex-1 overflow-y-auto p-8 relative">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-28 -right-28 h-80 w-80 rounded-full bg-indigo-200/40 blur-3xl" />
          <div className="absolute top-1/3 -left-32 h-80 w-80 rounded-full bg-pink-200/40 blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto space-y-8">
          <header className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-indigo-700 shadow-sm">
                <Mic className="h-4 w-4" />
                Live Voice Insights • OpenAI API + GPT-4o
              </div>
              <h1
                className="text-4xl font-bold mt-3"
                style={{ fontFamily: 'Outfit, sans-serif' }}
              >
                <span className="text-gradient">Dashboard</span>
              </h1>
              <p className="text-slate-600 mt-2">
                नमस्ते, {user.username}! आज का व्यवसाय सारांश | Today's Business Summary
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button
                asChild
                className="h-11 rounded-full bg-gradient-to-r from-indigo-600 via-indigo-500 to-pink-500 text-white shadow-lg shadow-indigo-500/30 transition-colors hover:from-indigo-500 hover:to-pink-600"
              >
                <Link to="/upload">
                  <UploadCloud className="mr-2 h-4 w-4" />
                  Upload Bills
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="h-11 rounded-full border-slate-200 bg-white/80 hover:bg-white"
              >
                <Link to="/entry">
                  <ClipboardList className="mr-2 h-4 w-4" />
                  Manual Entry
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="h-11 rounded-full border-slate-200 bg-white/80 hover:bg-white"
              >
                <Link to="/reports">
                  View Reports
                  <ArrowUpRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </header>

          <Card className="glass-panel p-6 lg:p-8 relative overflow-hidden">
            <div className="absolute -top-16 right-10 h-40 w-40 rounded-full bg-indigo-200/50 blur-2xl" />
            <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-2xl">
                <div className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-slate-700">
                  <Sparkles className="h-4 w-4 text-indigo-600" />
                  AI Daily Pulse
                </div>
                <h2
                  className="text-2xl font-semibold mt-4"
                  style={{ fontFamily: 'Outfit, sans-serif' }}
                >
                  Quick summary from today&apos;s transactions
                </h2>
                <p className="text-slate-600 mt-3 leading-relaxed">
                  {report?.insights || 'Generating insights...'}
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full lg:max-w-sm">
                <div className="rounded-2xl bg-white/80 p-4 border border-white/60 shadow-sm">
                  <p className="text-xs text-slate-500">Net Position</p>
                  <p
                    className="text-2xl font-bold text-indigo-600 mt-2"
                    style={{ fontFamily: 'JetBrains Mono, monospace' }}
                  >
                    ₹{report?.net_amount?.toLocaleString('en-IN') || '0'}
                  </p>
                </div>
                <div className="rounded-2xl bg-white/80 p-4 border border-white/60 shadow-sm">
                  <p className="text-xs text-slate-500">Top Action</p>
                  <p className="text-sm font-semibold text-slate-700 mt-2">
                    {report?.action_points?.[0] || 'Awaiting recommendations'}
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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

          {/* Infographics */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="glass-card p-6">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-500">Cashflow Health</p>
                  <h3 className="text-xl font-semibold text-slate-900" style={{ fontFamily: 'Outfit, sans-serif' }}>
                    साप्ताहिक स्थिरता
                  </h3>
                </div>
                <span className="text-sm font-semibold text-green-600">78%</span>
              </div>
              <Progress value={78} className="h-2 bg-green-100 [&>div]:bg-green-500" />
              <div className="mt-5 space-y-3 text-sm text-slate-600">
                <div className="flex items-center justify-between">
                  <span>कलेक्शन क्लियर</span>
                  <span className="font-semibold text-slate-800">₹{report?.sales_total?.toLocaleString('en-IN') || '0'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>खर्च अनुपात</span>
                  <span className="font-semibold text-slate-800">32%</span>
                </div>
              </div>
            </Card>

            <Card className="glass-card p-6">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-500">Voice Adoption</p>
                  <h3 className="text-xl font-semibold text-slate-900" style={{ fontFamily: 'Outfit, sans-serif' }}>
                    टीम वॉइस उपयोग
                  </h3>
                </div>
                <span className="text-sm font-semibold text-indigo-600">62%</span>
              </div>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between text-sm text-slate-600 mb-2">
                    <span>Hindi voice notes</span>
                    <span className="font-semibold text-slate-800">44%</span>
                  </div>
                  <Progress value={44} className="h-2 bg-indigo-100 [&>div]:bg-indigo-500" />
                </div>
                <div>
                  <div className="flex items-center justify-between text-sm text-slate-600 mb-2">
                    <span>English voice notes</span>
                    <span className="font-semibold text-slate-800">18%</span>
                  </div>
                  <Progress value={18} className="h-2 bg-indigo-100 [&>div]:bg-indigo-500" />
                </div>
                <div className="rounded-2xl bg-indigo-50/60 px-4 py-3 text-xs font-semibold text-indigo-700">
                  GPT-4o Voice 30 सेकंड में सारांश देता है।
                </div>
              </div>
            </Card>

            <Card className="glass-card p-6">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-500">Category Mix</p>
                  <h3 className="text-xl font-semibold text-slate-900" style={{ fontFamily: 'Outfit, sans-serif' }}>
                    आज के शीर्ष ड्राइवर्स
                  </h3>
                </div>
                <span className="text-sm font-semibold text-orange-600">5 segments</span>
              </div>
              <div className="space-y-4">
                {[
                  { label: 'Retail Sales', value: '42%', color: 'bg-orange-500' },
                  { label: 'Wholesale', value: '28%', color: 'bg-indigo-500' },
                  { label: 'Subscriptions', value: '18%', color: 'bg-green-500' },
                ].map((item) => (
                  <div key={item.label}>
                    <div className="flex items-center justify-between text-sm text-slate-600 mb-2">
                      <span>{item.label}</span>
                      <span className="font-semibold text-slate-800">{item.value}</span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div className={`h-full ${item.color}`} style={{ width: item.value }} />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* CRM, Accounting, Inventory */}
          <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-6">
            <Card className="glass-card p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-500">Basic CRM</p>
                  <h3 className="text-xl font-semibold text-slate-900" style={{ fontFamily: 'Outfit, sans-serif' }}>
                    संपर्क, फॉलो-अप और पाइपलाइन
                  </h3>
                </div>
                <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                  <PhoneCall className="h-4 w-4" />
                  Live Follow-ups
                </div>
              </div>
              <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
                <div className="space-y-4">
                  {[
                    { stage: 'नया लीड', count: 18, percent: 60, color: 'bg-indigo-500' },
                    { stage: 'डेमो/मीटिंग', count: 11, percent: 45, color: 'bg-blue-500' },
                    { stage: 'प्रपोज़ल', count: 7, percent: 35, color: 'bg-orange-500' },
                    { stage: 'जीता हुआ', count: 5, percent: 25, color: 'bg-emerald-500' },
                  ].map((item) => (
                    <div key={item.stage}>
                      <div className="flex items-center justify-between text-sm text-slate-600 mb-2">
                        <span>{item.stage}</span>
                        <span className="font-semibold text-slate-800">{item.count}</span>
                      </div>
                      <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                        <div className={`h-full ${item.color}`} style={{ width: `${item.percent}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="rounded-2xl bg-slate-50/80 border border-slate-100 p-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                    <Users className="h-4 w-4 text-indigo-600" />
                    आज के फॉलो-अप
                  </div>
                  <div className="mt-4 space-y-3 text-sm text-slate-600">
                    {[
                      { name: 'Rakesh Traders', time: '11:00 AM', note: 'कोटेशन शेयर करना है' },
                      { name: 'Shree Auto', time: '02:30 PM', note: 'पेमेंट रिमाइंडर' },
                      { name: 'Asha Retail', time: '04:15 PM', note: 'डेमो फीडबैक' },
                    ].map((item) => (
                      <div key={item.name} className="rounded-xl bg-white p-3 shadow-sm border border-slate-100">
                        <p className="font-semibold text-slate-800">{item.name}</p>
                        <p className="text-xs text-slate-500">{item.time} • {item.note}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Card>

            <div className="grid gap-6">
              <Card className="glass-card p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-500">Basic Accounting</p>
                    <h3 className="text-xl font-semibold text-slate-900" style={{ fontFamily: 'Outfit, sans-serif' }}>
                      इनवॉइस, भुगतान, खर्च
                    </h3>
                  </div>
                  <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
                    <FileText className="h-4 w-4" />
                    GST + Non-GST
                  </div>
                </div>
                <div className="space-y-4 text-sm text-slate-600">
                  <div className="flex items-center justify-between">
                    <span>कुल इनवॉइस</span>
                    <span className="font-semibold text-slate-800">₹{report?.sales_total?.toLocaleString('en-IN') || '0'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>भुगतान प्राप्त</span>
                    <span className="font-semibold text-slate-800">₹{report?.purchase_total?.toLocaleString('en-IN') || '0'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>खर्च</span>
                    <span className="font-semibold text-slate-800">₹{report?.expense_total?.toLocaleString('en-IN') || '0'}</span>
                  </div>
                </div>
                <div className="mt-5 flex flex-wrap gap-2 text-xs font-semibold">
                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-emerald-700">GST Ready</span>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-600">Non-GST Bills</span>
                </div>
              </Card>

              <Card className="glass-card p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-500">Inventory</p>
                    <h3 className="text-xl font-semibold text-slate-900" style={{ fontFamily: 'Outfit, sans-serif' }}>
                      स्टॉक इन/आउट और अलर्ट
                    </h3>
                  </div>
                  <div className="inline-flex items-center gap-2 rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-700">
                    <Boxes className="h-4 w-4" />
                    Hindi AI Voice Agent
                  </div>
                </div>
                <div className="space-y-3 text-sm text-slate-600">
                  {[
                    { item: 'LED Bulbs', qty: '120 units', status: 'Stock In' },
                    { item: 'POS Paper Roll', qty: '45 units', status: 'Low Stock' },
                    { item: 'Dry Snacks', qty: '30 units', status: 'Stock Out' },
                  ].map((row) => (
                    <div key={row.item} className="flex items-center justify-between rounded-xl bg-white p-3 shadow-sm border border-slate-100">
                      <div>
                        <p className="font-semibold text-slate-800">{row.item}</p>
                        <p className="text-xs text-slate-500">{row.qty}</p>
                      </div>
                      <span className="text-xs font-semibold text-slate-700">{row.status}</span>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>

          <Card className="glass-card p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500">Customer Pulse</p>
                <h3 className="text-xl font-semibold text-slate-900" style={{ fontFamily: 'Outfit, sans-serif' }}>
                  संतुष्टि और ट्रैफिक
                </h3>
              </div>
              <div className="text-xs text-slate-500">आज का स्नैपशॉट</div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm text-slate-600">
                  <span>ट्रैफिक स्रोत</span>
                  <span className="text-xs text-slate-500">आज</span>
                </div>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart
                    data={[
                      { name: 'Direct', value: 320 },
                      { name: 'Social', value: 460 },
                      { name: 'Search', value: 610 },
                      { name: 'Referral', value: 280 },
                    ]}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="name" stroke="#64748b" style={{ fontSize: '12px' }} />
                    <YAxis stroke="#64748b" style={{ fontSize: '12px' }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        border: 'none',
                        borderRadius: '12px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      }}
                    />
                    <Bar dataKey="value" fill="#4f46e5" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="rounded-2xl bg-slate-50/80 border border-slate-100 p-6 flex flex-col items-center justify-center">
                <div className="relative h-40 w-40">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Satisfied', value: 92 },
                          { name: 'Neutral', value: 8 },
                        ]}
                        innerRadius={55}
                        outerRadius={70}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        <Cell fill="#4f46e5" />
                        <Cell fill="#e2e8f0" />
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <p className="text-3xl font-semibold text-slate-900">92%</p>
                    <p className="text-xs text-slate-500">संतुष्टि</p>
                  </div>
                </div>
                <p className="mt-4 text-sm text-slate-600 text-center">
                  ग्राहक अनुभव स्कोर पिछले हफ्ते से +6% बेहतर है।
                </p>
              </div>
            </div>
          </Card>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card data-testid="trend-chart" className="glass-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold" style={{ fontFamily: 'Outfit, sans-serif' }}>
                  7 Days Trend
                </h3>
                <span className="text-xs text-slate-500">Updated daily</span>
              </div>
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
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold" style={{ fontFamily: 'Outfit, sans-serif' }}>
                  Category Comparison
                </h3>
                <span className="text-xs text-slate-500">Today</span>
              </div>
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-6">
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
