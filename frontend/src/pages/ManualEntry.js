import { useState } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Sidebar from '@/components/Sidebar';
import { Save, Plus } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function ManualEntry({ user, onLogout }) {
  const [formData, setFormData] = useState({
    category: 'sales',
    amount: '',
    description: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = new FormData();
      data.append('user_id', user.user_id);
      data.append('category', formData.category);
      data.append('amount', formData.amount);
      data.append('description', formData.description);

      await axios.post(`${API}/transactions?user_id=${user.user_id}`, {
        category: formData.category,
        amount: parseFloat(formData.amount),
        description: formData.description,
      });

      toast.success('डेटा सेव हो गया! Entry saved successfully!');
      setFormData({ category: 'sales', amount: '', description: '' });
    } catch (error) {
      toast.error('एरर | Error: ' + (error.response?.data?.detail || error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar user={user} onLogout={onLogout} />
      
      <main data-testid="manual-entry-main" className="flex-1 overflow-y-auto p-8">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <h1
              className="text-4xl font-bold mb-2"
              style={{ fontFamily: 'Outfit, sans-serif' }}
            >
              <span className="text-gradient">Manual Entry</span>
            </h1>
            <p className="text-slate-600">
              अपने लेन-देन का डेटा दर्ज करें | Enter your transaction data manually
            </p>
          </div>

          <Card data-testid="entry-form" className="glass-card p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="category" className="text-sm font-medium text-slate-700">
                  Category | श्रेणी
                </Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger
                    data-testid="category-select"
                    className="mt-1 h-12 bg-slate-50 border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 rounded-xl"
                  >
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sales">बिक्री | Sales</SelectItem>
                    <SelectItem value="purchase">खरीद | Purchase</SelectItem>
                    <SelectItem value="expense">खर्च | Expense</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="amount" className="text-sm font-medium text-slate-700">
                  Amount (₹) | राशि
                </Label>
                <Input
                  id="amount"
                  data-testid="amount-input"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  required
                  className="mt-1 h-12 bg-slate-50 border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 rounded-xl"
                  style={{ fontFamily: 'JetBrains Mono, monospace' }}
                />
              </div>

              <div>
                <Label htmlFor="description" className="text-sm font-medium text-slate-700">
                  Description | विवरण
                </Label>
                <Input
                  id="description"
                  data-testid="description-input"
                  type="text"
                  placeholder="Optional description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="mt-1 h-12 bg-slate-50 border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 rounded-xl"
                />
              </div>

              <Button
                data-testid="save-entry-button"
                type="submit"
                disabled={loading}
                className="w-full h-12 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white shadow-lg shadow-indigo-500/30 rounded-full font-semibold transition-transform active:scale-95"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                ) : (
                  <>
                    <Save className="mr-2 h-5 w-5" />
                    Save Entry
                  </>
                )}
              </Button>
            </form>
          </Card>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="glass-card p-6 border-l-4 border-l-green-500">
              <p className="text-sm text-slate-600 mb-1">बिक्री</p>
              <p className="text-2xl font-bold text-green-600">Sales</p>
            </Card>
            <Card className="glass-card p-6 border-l-4 border-l-blue-500">
              <p className="text-sm text-slate-600 mb-1">खरीद</p>
              <p className="text-2xl font-bold text-blue-600">Purchase</p>
            </Card>
            <Card className="glass-card p-6 border-l-4 border-l-orange-500">
              <p className="text-sm text-slate-600 mb-1">खर्च</p>
              <p className="text-2xl font-bold text-orange-600">Expense</p>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}