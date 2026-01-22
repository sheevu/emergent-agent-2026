import { useState, useEffect } from 'react';
import axios from 'axios';
import { Card } from '@/components/ui/card';
import Sidebar from '@/components/Sidebar';
import { Calendar, TrendingUp, FileText } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function Reports({ user, onLogout }) {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const response = await axios.get(`${API}/reports/${user.user_id}?limit=10`);
      setReports(response.data);
    } catch (error) {
      console.error('Error fetching reports:', error);
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
      
      <main data-testid="reports-main" className="flex-1 overflow-y-auto p-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1
              className="text-4xl font-bold mb-2"
              style={{ fontFamily: 'Outfit, sans-serif' }}
            >
              <span className="text-gradient">Daily Reports</span>
            </h1>
            <p className="text-slate-600">
              आपकी दैनिक रिपोर्ट्स | Your daily business reports
            </p>
          </div>

          {reports.length === 0 ? (
            <Card className="glass-card p-12 text-center">
              <FileText className="h-16 w-16 text-slate-400 mx-auto mb-4" />
              <p className="text-lg text-slate-600">No reports yet. Start adding transactions!</p>
            </Card>
          ) : (
            <div className="space-y-6">
              {reports.map((report, index) => (
                <Card
                  key={report.id || index}
                  data-testid={`report-card-${index}`}
                  className="glass-card p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center">
                      <Calendar className="h-6 w-6 text-indigo-600 mr-3" />
                      <div>
                        <h3 className="text-xl font-semibold" style={{ fontFamily: 'Outfit, sans-serif' }}>
                          {new Date(report.date).toLocaleDateString('en-IN', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </h3>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-slate-600 mb-1">Net Amount</p>
                      <p
                        className={`text-2xl font-bold ${
                          report.net_amount >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}
                        style={{ fontFamily: 'JetBrains Mono, monospace' }}
                      >
                        ₹{report.net_amount?.toLocaleString('en-IN')}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="bg-green-50 p-4 rounded-xl">
                      <p className="text-xs text-green-800 mb-1">बिक्री | Sales</p>
                      <p className="text-lg font-bold text-green-600" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                        ₹{report.sales_total?.toLocaleString('en-IN')}
                      </p>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-xl">
                      <p className="text-xs text-blue-800 mb-1">खरीद | Purchase</p>
                      <p className="text-lg font-bold text-blue-600" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                        ₹{report.purchase_total?.toLocaleString('en-IN')}
                      </p>
                    </div>
                    <div className="bg-orange-50 p-4 rounded-xl">
                      <p className="text-xs text-orange-800 mb-1">खर्च | Expense</p>
                      <p className="text-lg font-bold text-orange-600" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                        ₹{report.expense_total?.toLocaleString('en-IN')}
                      </p>
                    </div>
                  </div>

                  <div className="bg-indigo-50 p-4 rounded-xl mb-4">
                    <p className="text-sm font-medium text-indigo-800 mb-2">इनसाइट्स | Insights</p>
                    <p className="text-slate-700 text-sm">{report.insights}</p>
                  </div>

                  {report.action_points && report.action_points.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-slate-800 mb-2">
                        कल के लिए कार्य | Action Points
                      </p>
                      <ul className="space-y-1">
                        {report.action_points.map((point, idx) => (
                          <li key={idx} className="text-sm text-slate-600 flex items-start">
                            <TrendingUp className="h-4 w-4 text-orange-500 mr-2 mt-0.5 flex-shrink-0" />
                            <span>{point}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}