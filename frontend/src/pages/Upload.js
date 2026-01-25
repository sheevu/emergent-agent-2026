import { useState } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Sidebar from '@/components/Sidebar';
import { Upload as UploadIcon, FileText, Loader2, CheckCircle } from 'lucide-react';
import { API_BASE_URL } from '@/lib/api';

const API = API_BASE_URL;

export default function Upload({ user, onLogout }) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setResult(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error('कृपया फाइल चुनें | Please select a file');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('user_id', user.user_id);

    try {
      const response = await axios.post(`${API}/scan-document`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setResult(response.data);
      toast.success('दस्तावेज़ स्कैन सफल! Document scanned successfully!');
    } catch (error) {
      toast.error('स्कैन विफल | Scan failed: ' + (error.response?.data?.detail || error.message));
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar user={user} onLogout={onLogout} />
      
      <main data-testid="upload-main" className="flex-1 overflow-y-auto p-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1
              className="text-4xl font-bold mb-2"
              style={{ fontFamily: 'Outfit, sans-serif' }}
            >
              <span className="text-gradient">Document Scanner</span>
            </h1>
            <p className="text-slate-600">
              दस्तावेज़ अपलोड करें और AI से नंबर निकालें | Upload document and extract numbers with AI
            </p>
          </div>

          <Card data-testid="upload-card" className="glass-card p-8">
            <div className="space-y-6">
              <div
                className="border-2 border-dashed border-indigo-300 rounded-2xl p-12 text-center hover:border-indigo-500 transition-colors cursor-pointer"
                onClick={() => document.getElementById('file-input').click()}
              >
                <input
                  id="file-input"
                  data-testid="file-input"
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />
                
                {file ? (
                  <div className="flex flex-col items-center">
                    <FileText className="h-16 w-16 text-indigo-600 mb-4" />
                    <p className="text-lg font-medium text-slate-700">{file.name}</p>
                    <p className="text-sm text-slate-500 mt-1">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <UploadIcon className="h-16 w-16 text-slate-400 mb-4" />
                    <p className="text-lg font-medium text-slate-700 mb-2">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-sm text-slate-500">
                      PNG, JPG, PDF up to 10MB
                    </p>
                  </div>
                )}
              </div>

              <Button
                data-testid="upload-button"
                onClick={handleUpload}
                disabled={!file || uploading}
                className="w-full h-12 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white shadow-lg shadow-indigo-500/30 rounded-full font-semibold transition-transform active:scale-95"
              >
                {uploading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Scanning...
                  </>
                ) : (
                  <>
                    <UploadIcon className="mr-2 h-5 w-5" />
                    Scan Document
                  </>
                )}
              </Button>
            </div>
          </Card>

          {result && (
            <Card data-testid="scan-result" className="glass-card p-8 mt-6 border-l-4 border-l-green-500">
              <div className="flex items-center mb-6">
                <CheckCircle className="h-8 w-8 text-green-600 mr-3" />
                <h3 className="text-2xl font-semibold" style={{ fontFamily: 'Outfit, sans-serif' }}>
                  Scan Results
                </h3>
              </div>

              <div className="space-y-4">
                {result.extracted_data?.sales && (
                  <div className="bg-green-50 p-4 rounded-xl">
                    <p className="text-sm font-medium text-green-800 mb-2">बिक्री | Sales</p>
                    <p className="text-2xl font-bold text-green-600" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                      {result.extracted_data.sales.map((amt, i) => (
                        <span key={i} className="mr-3">₹{amt}</span>
                      ))}
                    </p>
                  </div>
                )}

                {result.extracted_data?.purchase && (
                  <div className="bg-blue-50 p-4 rounded-xl">
                    <p className="text-sm font-medium text-blue-800 mb-2">खरीद | Purchase</p>
                    <p className="text-2xl font-bold text-blue-600" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                      {result.extracted_data.purchase.map((amt, i) => (
                        <span key={i} className="mr-3">₹{amt}</span>
                      ))}
                    </p>
                  </div>
                )}

                {result.extracted_data?.expense && (
                  <div className="bg-orange-50 p-4 rounded-xl">
                    <p className="text-sm font-medium text-orange-800 mb-2">खर्च | Expense</p>
                    <p className="text-2xl font-bold text-orange-600" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                      {result.extracted_data.expense.map((amt, i) => (
                        <span key={i} className="mr-3">₹{amt}</span>
                      ))}
                    </p>
                  </div>
                )}

                {result.extracted_data?.raw_text && (
                  <div className="bg-slate-50 p-4 rounded-xl">
                    <p className="text-sm font-medium text-slate-800 mb-2">Raw OCR Output</p>
                    <p className="text-sm text-slate-600 whitespace-pre-wrap">
                      {result.extracted_data.raw_text}
                    </p>
                  </div>
                )}
              </div>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
