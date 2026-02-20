'use client';

import { useState } from 'react';

export default function SettingsKmsPage() {
  const [provider, setProvider] = useState('OPENAI');
  const [apiKey, setApiKey] = useState('');
  const [status, setStatus] = useState({ type: '', msg: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus({ type: '', msg: '' });
    setLoading(true);

    const token = localStorage.getItem('toastops_token');

    try {
      const res = await fetch('/api/ai/integrations', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ provider, rawApiKey: apiKey })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to securely store key');
      }

      setStatus({ type: 'success', msg: `Successfully wrapped ${provider} key via AES-256-GCM Enterprise KMS.` });
      setApiKey(''); // Clear explicitly from memory
    } catch (err: any) {
      setStatus({ type: 'error', msg: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-12 px-6">
      <div className="mb-8 border-b border-neutral-800 pb-6">
        <h1 className="text-3xl font-bold text-white mb-2">Platform AI Settings</h1>
        <p className="text-neutral-400">Manage your KMS-Encrypted Bring-Your-Own-Key Integrations</p>
      </div>

      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-6 bg-neutral-800/30 border-b border-neutral-800">
          <h2 className="text-xl font-semibold text-white">Add New Integration</h2>
          <p className="text-neutral-400 text-sm mt-1">Keys are explicitly decrypted only dynamically via the native AES Node buffers.</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {status.msg && (
            <div className={`p-4 rounded-xl text-sm font-medium border ${status.type === 'success' ? 'bg-emerald-950/50 text-emerald-400 border-emerald-900' : 'bg-red-950/50 text-red-500 border-red-900'}`}>
              {status.msg}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <button 
              type="button"
              onClick={() => setProvider('OPENAI')}
              className={`p-4 border rounded-xl flex items-center justify-center font-semibold transition-all ${provider === 'OPENAI' ? 'border-indigo-500 bg-indigo-500/10 text-indigo-400' : 'border-neutral-800 text-neutral-500 hover:border-neutral-700'}`}
            >
              OpenAI
            </button>
            <button 
              type="button"
              onClick={() => setProvider('ANTHROPIC')}
              className={`p-4 border rounded-xl flex items-center justify-center font-semibold transition-all ${provider === 'ANTHROPIC' ? 'border-amber-500 bg-amber-500/10 text-amber-400' : 'border-neutral-800 text-neutral-500 hover:border-neutral-700'}`}
            >
              Anthropic
            </button>
            <button 
              type="button"
              onClick={() => setProvider('GEMINI')}
              className={`p-4 border rounded-xl flex items-center justify-center font-semibold transition-all ${provider === 'GEMINI' ? 'border-blue-500 bg-blue-500/10 text-blue-400' : 'border-neutral-800 text-neutral-500 hover:border-neutral-700'}`}
            >
              Google Gemini
            </button>
          </div>

          <div>
            <label className="text-xs font-semibold text-neutral-400 uppercase tracking-widest mb-3 block">Raw Secret API Key</label>
            <input 
              required
              type="password" 
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 text-neutral-300 rounded-xl px-5 py-3 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-mono text-sm placeholder:text-neutral-700"
              placeholder={`e.g. ${provider === 'OPENAI' ? 'sk-proj-xxxxxxxxxxxxx' : 'sk-ant-api03-xxxxxxxxxx'}`}
            />
          </div>

          <div className="pt-4 flex justify-end">
            <button 
              disabled={loading}
              type="submit" 
              className="px-6 py-3 bg-white text-black font-semibold rounded-xl hover:bg-neutral-200 disabled:opacity-50 transition-all"
            >
              {loading ? 'Encrypting...' : 'Encrypt & Store via KMS'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
