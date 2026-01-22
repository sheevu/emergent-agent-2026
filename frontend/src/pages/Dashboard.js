import { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
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
  const [selectedVariant, setSelectedVariant] = useState('aurora');
  const [autoInsights, setAutoInsights] = useState(true);
  const [riskScore, setRiskScore] = useState([72]);
  const [voiceNote, setVoiceNote] = useState('');
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);

  const voiceSupported =
    typeof window !== 'undefined' &&
    ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window);
  const speechSynthesisSupported =
    typeof window !== 'undefined' && 'speechSynthesis' in window;

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

  const handleStartListening = () => {
    if (!voiceSupported) {
      toast.error('Voice capture not supported in this browser.');
      return;
    }
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!recognitionRef.current) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.lang = 'en-IN';
      recognitionRef.current.interimResults = true;
      recognitionRef.current.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map((result) => result[0]?.transcript)
          .join(' ');
        setVoiceNote(transcript);
      };
      recognitionRef.current.onerror = () => {
        toast.error('Voice capture failed. Please try again.');
        setIsListening(false);
      };
      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
    recognitionRef.current.start();
    setIsListening(true);
    toast.info('Listening for your command...');
  };

  const handleStopListening = () => {
    recognitionRef.current?.stop();
    setIsListening(false);
  };

  const handleSpeakInsights = () => {
    if (!speechSynthesisSupported) {
      toast.error('Speech playback not supported in this browser.');
      return;
    }
    const insightText =
      report?.insights ||
      'Your sales momentum looks stable today. Focus on top-selling items for higher margins.';
    const utterance = new SpeechSynthesisUtterance(insightText);
    utterance.lang = 'en-IN';
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
    toast.success('Playing AI insights.');
  };

  const uiVariants = [
    {
      id: 'aurora',
      name: 'Aurora Flow',
      description: 'Cool neon gradients with luminous highlights.',
      className: 'gradient-aurora',
    },
    {
      id: 'sunset',
      name: 'Sunset Pulse',
      description: 'Warm gradients designed for energetic dashboards.',
      className: 'gradient-sunset',
    },
    {
      id: 'ocean',
      name: 'Ocean Wave',
      description: 'Calming blues with vibrant teal accents.',
      className: 'gradient-ocean',
    },
  ];

  const salesTotal = report?.sales_total || 0;
  const purchaseTotal = report?.purchase_total || 0;
  const expenseTotal = report?.expense_total || 0;
  const totalFlow = salesTotal + purchaseTotal + expenseTotal || 1;
  const salesShare = Math.round((salesTotal / totalFlow) * 100);
  const purchaseShare = Math.round((purchaseTotal / totalFlow) * 100);
  const expenseShare = 100 - salesShare - purchaseShare;
  const weeklySparkline = (analytics?.chart_data || []).slice(-7);

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

          <section className="mb-10">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-semibold" style={{ fontFamily: 'Outfit, sans-serif' }}>
                  Modern UI Variants
                </h2>
                <p className="text-slate-600">
                  Choose a gradient-first layout for your Vercel-ready experience.
                </p>
              </div>
              <div className="text-sm text-slate-500">
                Selected: <span className="font-semibold text-slate-800">{selectedVariant}</span>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {uiVariants.map((variant) => (
                <Card
                  key={variant.id}
                  className={`relative overflow-hidden p-6 text-white ${variant.className} ${
                    selectedVariant === variant.id ? 'ring-4 ring-white/60' : ''
                  }`}
                >
                  <div className="absolute inset-0 bg-black/10" />
                  <div className="relative z-10">
                    <h3 className="text-xl font-semibold mb-2">{variant.name}</h3>
                    <p className="text-sm text-white/80 mb-5">{variant.description}</p>
                    <Button
                      type="button"
                      onClick={() => setSelectedVariant(variant.id)}
                      className="bg-white/90 text-slate-900 hover:bg-white rounded-full"
                    >
                      {selectedVariant === variant.id ? 'Active Style' : 'Activate Style'}
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </section>

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

          <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
            <Card className="glass-card p-6 border-t-4 border-t-indigo-500">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xl font-semibold" style={{ fontFamily: 'Outfit, sans-serif' }}>
                    Voice Command Center
                  </h3>
                  <p className="text-sm text-slate-600">Capture commands or listen to insights.</p>
                </div>
                <span className="text-xs uppercase tracking-wide text-indigo-600 font-semibold">
                  Voice Enabled
                </span>
              </div>
              <div className="space-y-4">
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-sm text-slate-500 mb-2">Live transcript</p>
                  <p className="text-slate-900 font-medium min-h-[56px]">
                    {voiceNote || 'Start speaking to see your command appear here.'}
                  </p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Button
                    type="button"
                    onClick={isListening ? handleStopListening : handleStartListening}
                    className="rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white"
                  >
                    {isListening ? 'Stop Listening' : 'Start Listening'}
                  </Button>
                  <Button type="button" variant="outline" className="rounded-full" onClick={handleSpeakInsights}>
                    Play AI Insights
                  </Button>
                </div>
                {!voiceSupported && (
                  <p className="text-xs text-amber-600">
                    Voice capture works best in Chrome desktop.
                  </p>
                )}
              </div>
            </Card>

            <Card className="glass-card p-6 border-t-4 border-t-emerald-500">
              <h3 className="text-xl font-semibold mb-2" style={{ fontFamily: 'Outfit, sans-serif' }}>
                Smart Automation
              </h3>
              <p className="text-sm text-slate-600 mb-6">
                Toggle automatic insights and tune risk thresholds.
              </p>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm font-medium text-slate-700">Auto Insights</p>
                  <p className="text-xs text-slate-500">Daily briefing at 7:00 AM</p>
                </div>
                <Switch checked={autoInsights} onCheckedChange={setAutoInsights} />
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-medium text-slate-700">Risk Score Alert</p>
                  <span className="text-sm font-semibold text-emerald-600">
                    {riskScore[0]}%
                  </span>
                </div>
                <Slider value={riskScore} onValueChange={setRiskScore} max={100} step={1} />
              </div>
              <Button type="button" className="mt-5 w-full rounded-full" variant="secondary">
                Update Automation
              </Button>
            </Card>

            <Card className="glass-card p-6 border-t-4 border-t-orange-500">
              <h3 className="text-xl font-semibold mb-2" style={{ fontFamily: 'Outfit, sans-serif' }}>
                Interactive Widgets
              </h3>
              <p className="text-sm text-slate-600 mb-6">
                Engage with quick actions, live goals, and pulse checks.
              </p>
              <div className="space-y-4">
                <div className="rounded-2xl bg-gradient-to-r from-orange-100 to-pink-100 p-4">
                  <p className="text-sm text-slate-600">Today's Goal</p>
                  <div className="flex items-center justify-between">
                    <p className="text-2xl font-bold text-slate-800">₹48,000</p>
                    <span className="text-sm font-semibold text-orange-600">82% complete</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Button type="button" className="rounded-full bg-slate-900 text-white">
                    Run Forecast
                  </Button>
                  <Button type="button" variant="outline" className="rounded-full">
                    Share Snapshot
                  </Button>
                </div>
                <p className="text-xs text-slate-500">
                  These widgets pair with voice commands like "Run forecast" or "Share snapshot".
                </p>
              </div>
            </Card>
          </section>

          <section className="mb-10">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-semibold" style={{ fontFamily: 'Outfit, sans-serif' }}>
                  Infographics & Visuals
                </h2>
                <p className="text-slate-600">
                  Quick-glance visuals for sales mix, momentum, and expense health.
                </p>
              </div>
              <Button type="button" variant="outline" className="rounded-full">
                Export Visuals
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="glass-card p-6">
                <h3 className="text-lg font-semibold mb-4">Revenue Mix</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-green-600 font-medium">Sales</span>
                    <span className="text-slate-700 font-semibold">{salesShare}%</span>
                  </div>
                  <div className="h-3 rounded-full bg-slate-100 overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-green-400 to-green-600" style={{ width: `${salesShare}%` }} />
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-blue-600 font-medium">Purchase</span>
                    <span className="text-slate-700 font-semibold">{purchaseShare}%</span>
                  </div>
                  <div className="h-3 rounded-full bg-slate-100 overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-blue-400 to-blue-600" style={{ width: `${purchaseShare}%` }} />
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-orange-600 font-medium">Expense</span>
                    <span className="text-slate-700 font-semibold">{expenseShare}%</span>
                  </div>
                  <div className="h-3 rounded-full bg-slate-100 overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-orange-400 to-orange-600" style={{ width: `${expenseShare}%` }} />
                  </div>
                </div>
              </Card>

              <Card className="glass-card p-6">
                <h3 className="text-lg font-semibold mb-4">Weekly Momentum</h3>
                <ResponsiveContainer width="100%" height={160}>
                  <LineChart data={weeklySparkline}>
                    <defs>
                      <linearGradient id="sparklineSales" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#4f46e5" stopOpacity={0.9} />
                        <stop offset="100%" stopColor="#ec4899" stopOpacity={0.9} />
                      </linearGradient>
                    </defs>
                    <Line
                      type="monotone"
                      dataKey="sales"
                      stroke="url(#sparklineSales)"
                      strokeWidth={3}
                      dot={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="expense"
                      stroke="#f97316"
                      strokeWidth={2}
                      dot={false}
                      strokeDasharray="4 4"
                    />
                  </LineChart>
                </ResponsiveContainer>
                <div className="flex items-center justify-between text-xs text-slate-500 mt-2">
                  <span>Last 7 days</span>
                  <span>Sales vs Expense</span>
                </div>
              </Card>

              <Card className="glass-card p-6">
                <h3 className="text-lg font-semibold mb-4">Expense Health</h3>
                <div className="flex items-center gap-6">
                  <div
                    className="h-28 w-28 rounded-full flex items-center justify-center"
                    style={{
                      background: `conic-gradient(#f97316 ${Math.min(expenseShare, 100)}%, #e2e8f0 0%)`,
                    }}
                  >
                    <div className="h-20 w-20 rounded-full bg-white flex items-center justify-center shadow-inner">
                      <span className="text-xl font-bold text-orange-600">{expenseShare}%</span>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm text-slate-600">
                    <p>
                      Avg daily expense is{' '}
                      <span className="font-semibold text-slate-900">
                        ₹{Math.round(expenseTotal / 7).toLocaleString('en-IN')}
                      </span>
                    </p>
                    <p>
                      Target spend{' '}
                      <span className="font-semibold text-slate-900">
                        ₹{Math.round(expenseTotal * 1.1).toLocaleString('en-IN')}
                      </span>
                    </p>
                    <Button type="button" className="rounded-full mt-2">
                      Optimize Spend
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          </section>

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
