'use client';

import { useState } from 'react';

export default function BuilderPage() {
  const [prompt, setPrompt] = useState('');
  const [modelId, setModelId] = useState('gpt-4o-mini'); // explicit defaults
  const [projectId, setProjectId] = useState('project-123'); // Assuming mock project selection 
  const [previewStyles, setPreviewStyles] = useState<{ customCss: string; configJson: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    if (!prompt) return;
    setLoading(true);
    setError('');

    const token = localStorage.getItem('toastops_token');

    try {
      const res = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ prompt, modelId, projectId })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate specific AI styles.');
      }

      setPreviewStyles({
        customCss: data.theme.customCss,
        configJson: data.theme.configJson
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-6 grid grid-cols-1 lg:grid-cols-2 gap-12">
      {/* LEFT: Builder Form */}
      <div className="flex flex-col gap-6">
        <h1 className="text-3xl font-bold text-white mb-2">AI Toast Architect</h1>
        <p className="text-neutral-400">Instruct the KMS-backed AI exactly how to style your notifications. Changes dynamically reflect directly without implicitly locking into predetermined Tailwind classes.</p>

        {error && (
            <div className="p-4 bg-red-950/50 border border-red-900 text-red-500 rounded-xl font-medium">
                {error}
            </div>
        )}

        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-xl flex flex-col gap-5">
          <div>
            <label className="text-xs font-semibold text-neutral-400 uppercase tracking-widest mb-3 block">Target Model Boundary</label>
            <select 
              value={modelId}
              onChange={(e) => setModelId(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 text-white rounded-xl px-4 py-3 outline-none focus:border-indigo-500 transition-all font-semibold"
            >
              <option value="gpt-4o-mini">OpenAI: GPT-4o Mini (Default)</option>
              <option value="gpt-4o">OpenAI: GPT-4o</option>
              <option value="claude-3-haiku-20240307">Anthropic: Claude 3 Haiku</option>
              <option value="claude-3-sonnet-20240229">Anthropic: Claude 3 Sonnet</option>
              <option value="gemini-1.5-flash">Google: Gemini 1.5 Flash</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-neutral-400 uppercase tracking-widest mb-3 block">Prompt Instruction</label>
            <textarea 
              rows={4}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. Create a sleek dark mode toast mimicking the Vercel dashboard. Smooth neon blue border, dense padding, Inter font."
              className="w-full bg-neutral-950 border border-neutral-800 text-neutral-300 rounded-xl px-5 py-3 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
            />
          </div>

          <button 
            disabled={loading || !prompt}
            onClick={handleGenerate}
            className="w-full mt-2 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:hover:bg-indigo-600 text-white font-semibold rounded-xl transition-all shadow-lg shadow-indigo-600/20"
          >
            {loading ? 'Synthesizing Theme...' : 'Generate New Theme explicitly'}
          </button>
        </div>
      </div>

      {/* RIGHT: Live Preview Surface */}
      <div className="bg-neutral-950 border border-neutral-800 rounded-3xl p-8 relative overflow-hidden flex flex-col items-center justify-center min-h-[500px]">
        {/* We inject the dynamically generated raw CSS explicitly into a scoped tag to sandbox it for the preview */}
        {previewStyles && (
            <style dangerouslySetInnerHTML={{ __html: previewStyles.customCss }} />
        )}

        {!previewStyles ? (
            <div className="absolute inset-0 flex items-center justify-center bg-neutral-900/50 backdrop-blur-sm z-10 border border-neutral-800 m-8 rounded-2xl border-dashed">
                <p className="text-neutral-500 font-medium">Awaiting AI Generation Instructions</p>
            </div>
        ) : (
            <div className="toastops-toast p-4 w-80 shadow-2xl transition-all relative z-20" style={{ transform: 'translateY(0)' }}>
                {/* Fallback internal structure if configJson isn't complex HTML */}
                <div className="flex items-start gap-4">
                    <div className="w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-500 flex items-center justify-center flex-shrink-0 animate-pulse">
                        <div className="w-2.5 h-2.5 bg-emerald-400 rounded-full"></div>
                    </div>
                    <div className="flex flex-col gap-1">
                        <span className="font-bold tracking-tight">System Deploy</span>
                        <span className="opacity-80 text-sm">Theme architecture successfully compiled.</span>
                    </div>
                </div>
            </div>
        )}

        <div className="absolute inset-x-0 bottom-0 p-6 flex justify-center border-t border-neutral-900">
             <button className="text-xs font-semibold text-neutral-500 hover:text-white transition-colors">
                 Download generated `.toastops/theme.css`
             </button>
        </div>
      </div>
    </div>
  );
}
