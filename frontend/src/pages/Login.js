import { useState } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { LogIn, UserPlus } from 'lucide-react';
import { API_BASE_URL } from '@/lib/api';

const API = API_BASE_URL;

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
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1767482712476-7b72663a0120?crop=entropy&cs=srgb&fm=jpg&q=85)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'brightness(0.4)',
        }}
      />

      <Card
        data-testid="login-card"
        className="relative z-10 w-full max-w-md mx-4 p-8 glass-card border-2 border-white/30 shadow-2xl"
      >
        <div className="text-center mb-8">
          <h1
            className="text-4xl font-bold mb-2"
            style={{ fontFamily: 'Outfit, sans-serif' }}
          >
            <span className="text-gradient">Sudarshan AI Portal</span>
          </h1>
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
            className="w-full h-12 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white shadow-lg shadow-indigo-500/30 rounded-full font-semibold transition-transform active:scale-95"
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

        <div className="mt-6 text-center">
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
    </div>
  );
}
