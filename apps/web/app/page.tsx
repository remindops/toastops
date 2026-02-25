'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
const Scene = dynamic(() => import('@/components/Scene'), { ssr: false });
import { ArrowRight, Code, Zap, Shield, Activity } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

export default function LandingPage() {
  const containerRef = useRef<HTMLDivElement>(null);

  const FEATURES = [
    {
      title: 'The Developer Dashboard',
      icon: <Shield className="w-10 h-10 md:w-12 md:h-12 mb-4 md:mb-6" strokeWidth={2.5} />,
      color: 'bg-blue-100',
      description: 'Your Next.js control center. Securely create an account using raw PBKDF2 cryptography.',
      content: (
        <>
          <span className="text-orange-500">BYOK (Bring Your Own Key):</span> We encrypt your OpenAI, Anthropic, or Gemini keys with AES-256-GCM.
          <br /><br />
          <span className="text-blue-500">AI Builder:</span> Say &quot;Make my toasts look like a retro 90s cyberpunk game&quot; and we generate the exact CSS.
        </>
      )
    },
    {
      title: 'Build-Time Plugins',
      icon: <Zap className="w-10 h-10 md:w-12 md:h-12 mb-4 md:mb-6" strokeWidth={2.5} />,
      color: 'bg-green-100',
      description: 'Install via NPM and configure your Vite or Next.js bundler. When you run npm run build, it downloads your AI-generated CSS dynamically.',
      content: (
        <><span className="text-green-600">The Lockfile:</span> Caches CSS locally in <code className="bg-gray-200 px-1">toastops.lock.json</code>. If our backend goes down, your production deployments never fail!</>
      )
    },
    {
      title: 'Core Client Library',
      icon: <Code className="w-10 h-10 md:w-12 md:h-12 mb-4 md:mb-6" strokeWidth={2.5} />,
      color: 'bg-pink-100',
      description: 'The actual notification engine. No React Context lag! We built a Pure TypeScript Observer Pattern.',
      content: (
        <>Run <code className="bg-black text-white px-2 py-1 rounded">toast(&#123; title: &quot;Saved!&quot; &#125;)</code> and it pushes to a raw memory array. The single <code className="bg-gray-200 px-1">&lt;Toaster /&gt;</code> component handles it all natively.</>
      )
    },
    {
      title: 'Telemetry Loop',
      icon: <Activity className="w-10 h-10 md:w-12 md:h-12 mb-4 md:mb-6" strokeWidth={2.5} />,
      color: 'bg-yellow-100',
      description: 'When an end-user clicks a toast, the core client sends a silent ping back to log an &quot;impression&quot; or &quot;click&quot; event.',
      content: (
        <>Look at your dashboard and see exactly how your AI-generated theme is performing in real-time.</>
      )
    }
  ];

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
    });

    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);

    const cards = gsap.utils.toArray('.feature-card');
    cards.forEach((card: any) => {
      gsap.fromTo(
        card,
        { opacity: 0, y: 100, rotation: Math.random() * 10 - 5 },
        {
          opacity: 1,
          y: 0,
          rotation: Math.random() * 6 - 3,
          duration: 1.2,
          ease: 'back.out(1.5)',
          scrollTrigger: {
            trigger: card,
            start: 'top 85%',
            toggleActions: 'play none none reverse',
          },
        }
      );
    });

    return () => {
      lenis.destroy();
      gsap.ticker.remove((time) => lenis.raf(time * 1000));
      ScrollTrigger.getAll().forEach(t => t.kill());
    };
  }, []);

  return (
    <main ref={containerRef} className="relative min-h-screen overflow-hidden font-inter">
      <Scene />

      <nav className="fixed top-0 left-0 right-0 z-50 p-4 md:p-6 flex justify-between items-center max-w-7xl mx-auto">
        <div className="text-xl md:text-3xl font-black tracking-tighter uppercase flex items-center gap-1 md:gap-2">
          <span className="bg-orange-400 text-white px-2 py-1 border-2 border-black neo-shadow-sm rotate-[-2deg]">Toast</span>
          <span className="text-black">Ops</span>
        </div>
        <Link
          href="/dashboard"
          className="bg-white border-2 border-black px-4 py-2 md:px-6 md:py-2 text-sm md:text-base font-bold uppercase tracking-wide neo-shadow transition-all neo-shadow-hover hover:bg-yellow-100"
        >
          Dashboard
        </Link>
      </nav>

      <section className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 pt-24 md:pt-20 text-center">
        <div className="max-w-4xl mx-auto">
          <div className="inline-block mb-6 px-3 py-1.5 md:px-4 md:py-2 bg-yellow-200 border-2 border-black rounded-full font-bold text-xs md:text-sm uppercase tracking-widest neo-shadow-sm rotate-2">
            Open Source & Developer First
          </div>
          <h1 className="text-5xl md:text-8xl font-black uppercase leading-[0.9] tracking-tighter mb-6 md:mb-8 text-black drop-shadow-[2px_2px_0px_rgba(0,0,0,1)] md:drop-shadow-[4px_4px_0px_rgba(0,0,0,1)]">
            NOTIFICATIONS WITH <span className="block md:inline text-orange-500 font-caveat text-6xl md:text-9xl lowercase tracking-normal drop-shadow-[1px_1px_0px_rgba(0,0,0,1)] md:drop-shadow-[2px_2px_0px_rgba(0,0,0,1)] mt-2 md:mt-0">Personality</span>
          </h1>
          <p className="text-lg md:text-2xl font-medium max-w-2xl mx-auto mb-8 md:mb-12 bg-white/80 backdrop-blur-sm p-4 border-2 border-black neo-shadow-sm -rotate-1">
            Build custom, AI-generated toasts for your company site. No React Context lag. Pure TypeScript Observer Pattern.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 md:gap-6 justify-center items-center w-full sm:w-auto">
            <Link
              href="/dashboard"
              className="w-full sm:w-auto flex justify-center items-center gap-3 bg-orange-500 text-white border-4 border-black px-6 py-3 md:px-8 md:py-4 text-lg md:text-xl font-black uppercase tracking-wider neo-shadow transition-all neo-shadow-hover hover:bg-orange-400"
            >
              Start Building <ArrowRight className="group-hover:translate-x-1 transition-transform" strokeWidth={3} />
            </Link>
            <a
              href="https://github.com/remindops/toastops"
              target="_blank"
              rel="noreferrer"
              className="w-full sm:w-auto flex justify-center items-center gap-3 bg-white text-black border-4 border-black px-6 py-3 md:px-8 md:py-4 text-lg md:text-xl font-black uppercase tracking-wider neo-shadow transition-all neo-shadow-hover hover:bg-gray-100"
            >
              <Code strokeWidth={3} /> GitHub
            </a>
          </div>
        </div>
      </section>

      <section className="relative z-10 py-20 md:py-32 px-4 max-w-7xl mx-auto">
        <div className="text-center mb-16 md:mb-20">
          <h2 className="text-4xl md:text-7xl font-black uppercase tracking-tighter mb-6 drop-shadow-[2px_2px_0px_rgba(0,0,0,1)] md:drop-shadow-[3px_3px_0px_rgba(0,0,0,1)]">
            How It <span className="text-yellow-400 font-caveat text-5xl md:text-8xl lowercase tracking-normal drop-shadow-[1px_1px_0px_rgba(0,0,0,1)] md:drop-shadow-[2px_2px_0px_rgba(0,0,0,1)]">Works</span>
          </h2>
          <p className="text-lg md:text-xl font-bold max-w-2xl mx-auto bg-white border-2 border-black p-4 neo-shadow-sm rotate-1">
            A complete platform to control your notifications end-to-end.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
          {FEATURES.map((feature, idx) => (
            <div key={idx} className={`feature-card ${feature.color} border-4 border-black p-6 md:p-8 neo-shadow relative will-change-transform`}>
              <div className="absolute -top-5 -left-5 md:-top-6 md:-left-6 w-10 h-10 md:w-12 md:h-12 bg-yellow-400 border-4 border-black rounded-full flex items-center justify-center font-black text-lg md:text-xl neo-shadow-sm">{idx + 1}</div>
              {feature.icon}
              <h3 className="text-2xl md:text-3xl font-black uppercase mb-3 md:mb-4">{feature.title}</h3>
              <p className="text-base md:text-lg font-medium mb-4">{feature.description}</p>
              <div className="bg-white border-2 border-black p-3 md:p-4 text-sm font-bold">
                {feature.content}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="relative z-10 bg-orange-500 border-t-8 border-black overflow-hidden">
        <div className="bg-black text-white py-4 border-b-8 border-black flex overflow-hidden whitespace-nowrap">
          <div className="animate-marquee flex gap-8 items-center text-2xl font-black uppercase tracking-widest w-max">
            {Array(20).fill('NOTIFICATIONS WITH PERSONALITY • ').map((text, i) => (
              <span key={i}>{text}</span>
            ))}
          </div>
        </div>

        <div className="py-24 md:py-40 px-4 text-center relative">
          <div className="absolute top-10 left-10 md:left-20 w-24 h-24 bg-yellow-300 border-4 border-black rounded-full neo-shadow animate-bounce" style={{ animationDuration: '3s' }} />
          <div className="absolute bottom-20 right-10 md:right-20 w-32 h-32 bg-blue-300 border-4 border-black rotate-12 neo-shadow animate-pulse" style={{ animationDuration: '4s' }} />
          <div className="absolute top-20 right-1/4 w-16 h-16 bg-pink-300 border-4 border-black rotate-45 neo-shadow" />
          <div className="absolute bottom-32 left-1/4 w-20 h-20 bg-green-300 border-4 border-black rounded-full neo-shadow" />

          <h2 className="text-6xl md:text-9xl font-black uppercase tracking-tighter mb-8 text-black drop-shadow-[4px_4px_0px_rgba(255,255,255,1)] relative z-10 leading-none">
            Ready to <br className="md:hidden" />
            <span className="text-white font-caveat text-8xl md:text-[12rem] lowercase tracking-normal drop-shadow-[4px_4px_0px_rgba(0,0,0,1)]">toast?</span>
          </h2>

          <p className="text-xl md:text-3xl font-bold mb-12 max-w-2xl mx-auto text-black bg-white p-6 border-4 border-black neo-shadow rotate-[-1deg] relative z-10">
            Join the revolution of developer-first, AI-generated notifications.
          </p>

          <Link
            href="/dashboard"
            className="group relative inline-flex items-center justify-center gap-4 bg-yellow-400 text-black border-4 border-black px-10 py-6 md:px-16 md:py-8 text-2xl md:text-4xl font-black uppercase tracking-wider neo-shadow transition-all hover:translate-x-2 hover:translate-y-2 hover:shadow-none hover:bg-yellow-300 z-10"
          >
            <span>Start Building Now</span>
            <ArrowRight className="w-8 h-8 md:w-12 md:h-12 group-hover:translate-x-4 transition-transform" strokeWidth={4} />
          </Link>
        </div>

        <div className="bg-black text-white py-4 border-t-8 border-black flex overflow-hidden whitespace-nowrap">
          <div className="animate-marquee-reverse flex gap-8 items-center text-2xl font-black uppercase tracking-widest w-max">
            {Array(20).fill('NO REACT CONTEXT LAG • ').map((text, i) => (
              <span key={i}>{text}</span>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
