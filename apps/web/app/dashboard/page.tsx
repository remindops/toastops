'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Settings, Key, Wand2, Activity, Save, Play, Menu, X, Code, Copy, Loader2 } from 'lucide-react';

type View = 'ai-builder' | 'byok' | 'telemetry' | 'settings';

export default function Dashboard() {
  const [activeView, setActiveView] = useState<View>('ai-builder');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Helper to get real session token
  const getSessionToken = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('toastops_token') || '';
    }
    return '';
  };

  // AI Builder State
  const [prompt, setPrompt] = useState('Make my toasts look like a retro 90s cyberpunk game');
  const [isGenerating, setIsGenerating] = useState(false);
  const [modelId, setModelId] = useState('gpt-4o');

  // BYOK State
  const [apiKey, setApiKey] = useState('');
  const [isSavingKey, setIsSavingKey] = useState(false);
  const [aiProvider, setAiProvider] = useState('OPENAI');

  // Real Data State
  const [projectId, setProjectId] = useState<string>('');
  const [analytics, setAnalytics] = useState<{ totalImpressions: number, ctr: number, recentEvents: any[] } | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      const token = getSessionToken();
      if (!token) {
        setProjectId('Token missing - Please login');
        return;
      }

      try {
        // Fetch User's Default Project
        const projRes = await fetch('/api/projects', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (projRes.ok) {
          const { project } = await projRes.json();
          setProjectId(project.id);
        } else {
          setProjectId('Error loading project');
          console.error('Failed to load project:', await projRes.text());
        }

        // Fetch Analytics
        const analyticsRes = await fetch('/api/analytics', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (analyticsRes.ok) {
          const data = await analyticsRes.json();
          setAnalytics(data);
        }
      } catch (err) {
        setProjectId('Network Error');
        console.error('Failed to load dashboard data', err);
      }
    };

    fetchDashboardData();
  }, []);

  const [previewTheme, setPreviewTheme] = useState<{ customCss: string, configJson: string } | null>(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    try {
      const res = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getSessionToken()}`
        },
        body: JSON.stringify({
          prompt,
          modelId,
          projectId: projectId || 'fallback_id'
        })
      });

      const data = await res.json();
      if (res.ok) {
        console.log("Generated theme:", data.theme);
        setPreviewTheme({
          customCss: data.theme.customCss,
          configJson: data.theme.configJson
        });
        alert(`Theme generated successfully! Custom CSS attached to your project.`);
      } else {
        alert(`Failed to generate theme: ${data.error}`);
      }
    } catch (err: any) {
      alert(`Generation error: ${err.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveKey = async () => {
    if (!apiKey.trim()) return;
    setIsSavingKey(true);
    try {
      const res = await fetch('/api/ai/integrations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getSessionToken()}`
        },
        body: JSON.stringify({
          provider: aiProvider,
          rawApiKey: apiKey
        })
      });

      const data = await res.json();
      if (res.ok) {
        alert('API Key securely saved using AES-256-GCM encryption.');
        setApiKey('');
      } else {
        alert(`Failed to save API Key: ${data.error}`);
      }
    } catch (err: any) {
      alert(`Error saving API key: ${err.message}`);
    } finally {
      setIsSavingKey(false);
    }
  };

  const navItems = [
    { id: 'ai-builder', label: 'AI Builder', icon: Wand2 },
    { id: 'byok', label: 'BYOK Settings', icon: Key },
    { id: 'telemetry', label: 'Telemetry', icon: Activity },
    { id: 'settings', label: 'Project Settings', icon: Settings },
  ] as const;

  return (
    <div className="min-h-screen bg-[#fdfbf7] font-inter flex flex-col md:flex-row">
      <div className="md:hidden flex items-center justify-between p-4 border-b-4 border-black bg-white z-20">
        <Link href="/" className="text-xl font-black tracking-tighter uppercase flex items-center gap-2">
          <span className="bg-orange-400 text-white px-2 py-1 border-2 border-black neo-shadow-sm rotate-[-2deg]">Toast</span>
          <span className="text-black">Ops</span>
        </Link>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 border-2 border-black bg-yellow-400 neo-shadow-sm"
        >
          {isMobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      <aside className={`
        fixed md:static inset-0 z-10 bg-white border-r-4 border-black flex flex-col
        transform transition-transform duration-300 ease-in-out md:transform-none
        ${isMobileMenuOpen ? 'translate-x-0 pt-20 md:pt-0' : '-translate-x-full md:translate-x-0'}
        w-full md:w-64
      `}>
        <div className="hidden md:block p-6 border-b-4 border-black">
          <Link href="/" className="text-2xl font-black tracking-tighter uppercase flex items-center gap-2">
            <span className="bg-orange-400 text-white px-2 py-1 border-2 border-black neo-shadow-sm rotate-[-2deg]">Toast</span>
            <span className="text-black">Ops</span>
          </Link>
        </div>
        <nav className="flex-1 p-4 flex flex-col gap-2 overflow-y-auto">
          {navItems.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => {
                setActiveView(id as View);
                setIsMobileMenuOpen(false);
              }}
              className={`flex items-center gap-3 w-full text-left px-4 py-3 font-bold transition-all border-2 ${activeView === id
                ? 'bg-yellow-100 border-black neo-shadow-sm'
                : 'hover:bg-gray-100 border-transparent hover:border-black'
                }`}
            >
              <Icon size={20} /> {label}
            </button>
          ))}
        </nav>
      </aside>

      <main className="flex-1 p-4 md:p-8 overflow-y-auto w-full">
        <div className="max-w-4xl mx-auto space-y-8">

          {activeView === 'ai-builder' && (
            <>
              <header className="flex flex-col md:flex-row justify-between items-start md:items-end border-b-4 border-black pb-4 mb-8 gap-4">
                <div>
                  <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tighter">AI Builder</h1>
                  <p className="text-base md:text-lg font-medium mt-2">Generate your custom toast theme using AI.</p>
                </div>
                <button className="w-full md:w-auto bg-green-400 text-black border-2 border-black px-4 py-2 font-bold uppercase neo-shadow-sm transition-all neo-shadow-sm-hover hover:bg-green-300 flex items-center justify-center gap-2">
                  <Save size={18} /> Save Theme
                </button>
              </header>

              <section className="bg-pink-100 border-4 border-black p-4 md:p-6 neo-shadow">
                <h2 className="text-xl md:text-2xl font-black uppercase mb-4 flex items-center gap-2">
                  <Wand2 /> Describe Your Toasts
                </h2>
                <textarea
                  rows={4}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="w-full border-2 border-black p-3 md:p-4 font-medium text-base md:text-lg focus:outline-none focus:ring-4 focus:ring-yellow-400 resize-none mb-4"
                />

                <div className="mb-6">
                  <label className="block font-bold uppercase mb-2">Select Model</label>
                  <select
                    value={modelId}
                    onChange={(e) => setModelId(e.target.value)}
                    className="w-full border-2 border-black p-3 font-bold bg-white focus:outline-none focus:ring-4 focus:ring-yellow-400"
                  >
                    <option disabled className="bg-gray-200">=== Direct Providers ===</option>
                    <option value="gpt-4o">OpenAI: GPT-4o</option>
                    <option value="gpt-4-turbo">OpenAI: GPT-4 Turbo</option>
                    <option value="claude-3-5-sonnet-20240620">Anthropic: Claude 3.5 Sonnet</option>
                    <option value="claude-3-opus-20240229">Anthropic: Claude 3 Opus</option>
                    <option value="gemini-1.5-pro">Google: Gemini 1.5 Pro</option>
                    <option value="gemini-1.5-flash">Google: Gemini 1.5 Flash</option>
                    <option value="grok-beta">xAI: Grok Beta</option>

                    <option disabled className="bg-gray-200">=== OpenRouter ===</option>
                    <option value="meta-llama/llama-3.1-70b-instruct">Llama 3.1 70B</option>
                    <option value="meta-llama/llama-3.1-405b-instruct">Llama 3.1 405B</option>
                    <option value="mistralai/mixtral-8x7b-instruct">Mixtral 8x7B</option>
                    <option value="anthropic/claude-3.5-sonnet">Claude 3.5 Sonnet (OpenRouter)</option>
                    <option value="openai/gpt-4o">GPT-4o (OpenRouter)</option>

                    <option disabled className="bg-gray-200">=== Free Models (OpenRouter) ===</option>
                    <option value="arcee-ai/trinity-large-preview:free">Arcee: Trinity Large (Free)</option>
                    <option value="stepfun/step-3.5-flash:free">Stepfun: Step 3.5 Flash (Free)</option>
                    <option value="z-ai/glm-4.5-air:free">Z-AI: GLM 4.5 Air (Free)</option>
                    <option value="nvidia/nemotron-3-nano-30b-a3b:free">Nvidia: Nemotron 3 Nano (Free)</option>
                    <option value="arcee-ai/trinity-mini:free">Arcee: Trinity Mini (Free)</option>
                    <option value="openai/gpt-oss-120b:free">OpenAI: GPT OSS 120B (Free)</option>
                    <option value="meta-llama/llama-3.3-70b-instruct:free">Meta: Llama 3.3 70B (Free)</option>
                    <option value="google/gemma-3-27b-it:free">Google: Gemma 3 27B (Free)</option>
                    <option value="liquid/lfm-2.5-1.2b-thinking:free">Liquid: LFM 2.5 1.2B Thinking (Free)</option>
                    <option value="qwen/qwen3-coder:free">Qwen: Qwen3 Coder (Free)</option>
                  </select>
                </div>

                <button
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="w-full bg-orange-500 text-white border-4 border-black p-3 md:p-4 text-lg md:text-xl font-black uppercase tracking-wider neo-shadow transition-all neo-shadow-hover hover:bg-orange-400 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                >
                  {isGenerating ? <><Loader2 className="animate-spin" /> Generating Array...</> : <><Wand2 /> Generate CSS Theme</>}
                </button>
              </section>

              <section className="bg-white border-4 border-black p-4 md:p-6 neo-shadow">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                  <h2 className="text-xl md:text-2xl font-black uppercase flex items-center gap-2">
                    <Play /> Live Preview
                  </h2>
                  <div className="text-xs md:text-sm font-bold bg-yellow-200 border-2 border-black px-3 py-1 rotate-2">
                    toastops.lock.json
                  </div>
                </div>

                <div className="bg-gray-900 border-2 border-black h-64 md:h-80 flex items-center justify-center relative overflow-hidden">
                  {previewTheme ? (
                    <>
                      <style dangerouslySetInnerHTML={{ __html: previewTheme.customCss }} />
                      <div className="toastops-toast" style={{ position: 'relative', zIndex: 10 }}>
                        <div className="toastops-icon">✓</div>
                        <div className="toastops-content">
                          <div className="toastops-title">Theme Generated!</div>
                          <div className="toastops-message">Your custom design is ready.</div>
                        </div>
                        <div className="toastops-progress" />
                      </div>
                    </>
                  ) : (
                    <p className="text-gray-500 font-bold uppercase tracking-widest text-sm text-center px-4">
                      Generate a theme to preview your toast here
                    </p>
                  )}
                </div>
              </section>
            </>
          )}

          {activeView === 'byok' && (
            <>
              <header className="flex flex-col md:flex-row justify-between items-start md:items-end border-b-4 border-black pb-4 mb-8 gap-4">
                <div>
                  <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tighter">BYOK Settings</h1>
                  <p className="text-base md:text-lg font-medium mt-2">Bring Your Own Key for AI Generation.</p>
                </div>
              </header>

              <section className="bg-blue-100 border-4 border-black p-4 md:p-6 neo-shadow">
                <h2 className="text-xl md:text-2xl font-black uppercase mb-4 flex items-center gap-2">
                  <Key /> API Key Configuration
                </h2>
                <p className="mb-6 font-medium text-sm md:text-base">
                  We encrypt your API key with AES-256-GCM. It&apos;s only decrypted temporarily during generation. We never store it in plaintext.
                </p>

                <div className="mb-4">
                  <label className="block font-bold uppercase mb-2">Provider</label>
                  <select
                    value={aiProvider}
                    onChange={(e) => setAiProvider(e.target.value)}
                    className="w-full border-2 border-black p-3 font-bold bg-white focus:outline-none focus:ring-4 focus:ring-yellow-400"
                  >
                    <option value="OPENAI">OpenAI</option>
                    <option value="ANTHROPIC">Anthropic</option>
                    <option value="GEMINI">Google Gemini</option>
                    <option value="GROK">xAI Grok</option>
                    <option value="OPENROUTER">OpenRouter</option>
                  </select>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <input
                    type="password"
                    placeholder="sk-..."
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="flex-1 border-2 border-black p-3 font-mono focus:outline-none focus:ring-4 focus:ring-yellow-400 w-full"
                  />
                  <button
                    onClick={handleSaveKey}
                    disabled={isSavingKey || !apiKey.trim()}
                    className="bg-black text-white border-2 border-black px-6 py-3 font-bold uppercase hover:bg-gray-800 transition-colors whitespace-nowrap w-full sm:w-auto disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isSavingKey ? <Loader2 className="animate-spin w-4 h-4" /> : 'Save Key'}
                  </button>
                </div>
              </section>
            </>
          )}

          {activeView === 'telemetry' && (
            <>
              <header className="flex flex-col md:flex-row justify-between items-start md:items-end border-b-4 border-black pb-4 mb-8 gap-4">
                <div>
                  <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tighter">Telemetry</h1>
                  <p className="text-base md:text-lg font-medium mt-2">Real-time toast performance metrics.</p>
                </div>
              </header>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="bg-green-100 border-4 border-black p-6 neo-shadow">
                  <h3 className="text-lg font-bold uppercase mb-2">Total Impressions</h3>
                  <p className="text-5xl font-black">{analytics?.totalImpressions || 0}</p>
                </div>
                <div className="bg-yellow-100 border-4 border-black p-6 neo-shadow">
                  <h3 className="text-lg font-bold uppercase mb-2">Click-Through Rate</h3>
                  <p className="text-5xl font-black">{analytics?.ctr || 0}%</p>
                </div>
              </div>

              <section className="bg-white border-4 border-black p-4 md:p-6 neo-shadow mt-8">
                <h2 className="text-xl md:text-2xl font-black uppercase mb-4 flex items-center gap-2">
                  <Activity /> Recent Events
                </h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b-4 border-black">
                        <th className="p-3 font-black uppercase">Event</th>
                        <th className="p-3 font-black uppercase">Theme ID</th>
                        <th className="p-3 font-black uppercase">Time</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analytics?.recentEvents && analytics.recentEvents.length > 0 ? (
                        analytics.recentEvents.map((evt: any) => (
                          <tr key={evt.id} className="border-b-2 border-gray-200 hover:bg-gray-50 transition-colors">
                            <td className="p-3 font-medium">
                              <span className={`px-2 py-1 border border-black text-xs font-bold rounded ${evt.eventType === 'IMPRESSION' ? 'bg-blue-200' : evt.eventType === 'CLICK' ? 'bg-green-200' : 'bg-red-200'}`}>
                                {evt.eventType}
                              </span>
                            </td>
                            <td className="p-3 font-mono text-sm">{evt.themeId.split('-')[0]}</td>
                            <td className="p-3 text-gray-600 text-sm">
                              {new Date(evt.createdAt).toLocaleString()}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={3} className="p-6 text-center text-gray-500 font-medium border-b-2 border-gray-200">
                            No telemetry events received yet. Generate a toast and trigger it to see data!
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </section>
            </>
          )}

          {activeView === 'settings' && (
            <>
              <header className="flex flex-col md:flex-row justify-between items-start md:items-end border-b-4 border-black pb-4 mb-8 gap-4">
                <div>
                  <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tighter">Project Settings</h1>
                  <p className="text-base md:text-lg font-medium mt-2">Manage your ToastOps integration.</p>
                </div>
              </header>

              <section className="bg-white border-4 border-black p-4 md:p-6 neo-shadow">
                <h2 className="text-xl md:text-2xl font-black uppercase mb-4 flex items-center gap-2">
                  <Code /> Integration Details
                </h2>

                <div className="space-y-6">
                  <div>
                    <label className="block font-bold uppercase mb-2">Project ID</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        readOnly
                        value={projectId || 'Loading...'}
                        className="flex-1 border-2 border-black p-3 font-mono bg-gray-100"
                      />
                      <button className="bg-yellow-400 border-2 border-black p-3 hover:bg-yellow-300 transition-colors">
                        <Copy size={20} />
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold uppercase mb-2">Install Package</label>
                    <div className="bg-black text-white p-4 font-mono text-sm flex justify-between items-center border-2 border-black">
                      <span>npm install @toastops/core @toastops/plugin</span>
                      <Copy size={16} className="cursor-pointer hover:text-yellow-400" />
                    </div>
                  </div>
                </div>
              </section>
            </>
          )}

        </div>
      </main>
    </div>
  );
}
