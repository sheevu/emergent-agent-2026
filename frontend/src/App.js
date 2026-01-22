import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Toaster } from '@/components/ui/sonner';
import Login from '@/pages/Login';
import Dashboard from '@/pages/Dashboard';
import Upload from '@/pages/Upload';
import ManualEntry from '@/pages/ManualEntry';
import Reports from '@/pages/Reports';
import Analytics from '@/pages/Analytics';
import VoiceFAB from '@/components/VoiceFAB';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('sudarshan_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('sudarshan_user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('sudarshan_user');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="App min-h-screen bg-slate-50">
      <BrowserRouter>
        <Routes>
          <Route
            path="/login"
            element={!user ? <Login onLogin={handleLogin} /> : <Navigate to="/dashboard" />}
          />
          <Route
            path="/dashboard"
            element={user ? <Dashboard user={user} onLogout={handleLogout} /> : <Navigate to="/login" />}
          />
          <Route
            path="/upload"
            element={user ? <Upload user={user} onLogout={handleLogout} /> : <Navigate to="/login" />}
          />
          <Route
            path="/entry"
            element={user ? <ManualEntry user={user} onLogout={handleLogout} /> : <Navigate to="/login" />}
          />
          <Route
            path="/reports"
            element={user ? <Reports user={user} onLogout={handleLogout} /> : <Navigate to="/login" />}
          />
          <Route
            path="/analytics"
            element={user ? <Analytics user={user} onLogout={handleLogout} /> : <Navigate to="/login" />}
          />
          <Route path="/" element={<Navigate to={user ? "/dashboard" : "/login"} />} />
        </Routes>
        {user && <VoiceFAB user={user} />}
      </BrowserRouter>
      <Toaster position="top-right" />
    </div>
  );
}

export default App;