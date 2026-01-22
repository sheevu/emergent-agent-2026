import { useState } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { BarChart3, LogIn, Mic, ShieldCheck, Sparkles, UserPlus } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function Login({ onLogin }) {
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isRegister) {
        await axios.post(`${API}/auth/register`, formData);
        toast.success('पंजीकरण सफल! Registration successful!');
        setIsRegister(false);
      } else {
        const response = await axios.post(`${API}/auth/login`, {
          email: formData.email,
          password: formData.password,
        });
        toast.success('स्वागत है! Welcome!');
        onLogin(response.data);
      }
    } catch (error) {
      toast.error(error.response?.data?.detail || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-indigo-200/50 blur-3xl" />
        <div className="absolute top-1/3 -left-32 h-96 w-96 rounded-full bg-pink-200/50 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 h-64 w-64 rounded-full bg-orange-200/40 blur-3xl" />
      </div>

      <div className="relative z-10 grid min-h-screen lg:grid-cols-[1.1fr_0.9fr]">
        <section className="hidden lg:flex flex-col justify-between p-12">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 text-xs font-semibold text-indigo-700 shadow-sm">
              <Sparkles className="h-4 w-4" />
              Powered by OpenAI API + GPT-4o Voice
            </div>
            <h1
              className="mt-6 text-5xl font-semibold leading-tight text-slate-900"
              style={{ fontFamily: 'Outfit, sans-serif' }}
            >
              Your business cockpit for faster, smarter decisions.
            </h1>
            <p className="mt-4 text-lg text-slate-600">
              सब कुछ एक जगह | Upload invoices, speak updates, and monitor daily cashflow with AI-powered summaries.
            </p>
          </div>

          <div className="grid gap-4">
            {[
              {
                icon: Mic,
                title: 'Voice-first inputs',
                detail: 'Speak in Hindi or English. We transcribe and categorize instantly.',
              },
              {
                icon: BarChart3,
                title: 'Instant trend tracking',
                detail: 'Daily charts highlight profit, expenses, and cash health.',
              },
              {
                icon: ShieldCheck,
                title: 'Secure by design',
                detail: 'Encrypted reports and role-based access for your team.',
              },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="glass-panel p-5 flex items-start gap-4">
                  <span className="h-10 w-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    <Icon className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-base font-semibold text-slate-900">{item.title}</p>
                    <p className="text-sm text-slate-600">{item.detail}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="flex items-center justify-center px-6 py-12 lg:px-12">
          <Card
            data-testid="login-card"
            className="w-full max-w-md p-8 glass-panel surface-border"
          >
            <div className="text-left mb-8">
              <div className="flex items-center gap-3 mb-4">
                <span className="h-12 w-12 rounded-2xl bg-gradient-to-br from-indigo-600 via-indigo-500 to-pink-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
                  <Sparkles className="h-6 w-6" />
                </span>
                <div>
                  <h1
                    className="text-3xl font-bold"
                    style={{ fontFamily: 'Outfit, sans-serif' }}
                  >
                    Sudarshan AI Portal
                  </h1>
                  <p className="text-sm text-slate-500">Voice Insight Hub for growing businesses</p>
                </div>
              </div>
              <p className="text-slate-600 text-sm">
                आपका व्यवसाय सहायक | Your Business Assistant
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {isRegister && (
                <div>
                  <Label htmlFor="username" className="text-sm font-medium text-slate-700">
                    Username
                  </Label>
                  <Input
                    id="username"
                    data-testid="username-input"
                    type="text"
                    placeholder="Enter your name"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    required={isRegister}
                    className="mt-1 h-12 bg-slate-50 border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 rounded-xl"
                  />
                </div>
              )}

              <div>
                <Label htmlFor="email" className="text-sm font-medium text-slate-700">
                  Email
                </Label>
                <Input
                  id="email"
                  data-testid="email-input"
                  type="email"
                  placeholder="your@email.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="mt-1 h-12 bg-slate-50 border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 rounded-xl"
                />
              </div>

              <div>
                <Label htmlFor="password" className="text-sm font-medium text-slate-700">
                  Password
                </Label>
                <Input
                  id="password"
                  data-testid="password-input"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  className="mt-1 h-12 bg-slate-50 border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 rounded-xl"
                />
              </div>

              <Button
                data-testid="login-submit-button"
                type="submit"
                disabled={loading}
                className="w-full h-12 rounded-full bg-gradient-to-r from-indigo-600 via-indigo-500 to-pink-500 text-white shadow-lg shadow-indigo-500/30 font-semibold transition-colors hover:from-indigo-500 hover:to-pink-600"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                ) : isRegister ? (
                  <>
                    <UserPlus className="mr-2 h-5 w-5" />
                    Register
                  </>
                ) : (
                  <>
                    <LogIn className="mr-2 h-5 w-5" />
                    Login
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6">
              <button
                data-testid="toggle-register-button"
                type="button"
                onClick={() => setIsRegister(!isRegister)}
                className="text-indigo-600 hover:text-indigo-800 text-sm font-medium transition-colors"
              >
                {isRegister
                  ? 'Already have an account? Login'
                  : "Don't have an account? Register"}
              </button>
            </div>
          </Card>
        </section>
      </div>
    </div>
  );
}
