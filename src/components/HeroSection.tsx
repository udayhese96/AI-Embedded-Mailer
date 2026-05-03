import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Settings, Sparkles, ArrowRight, Zap, ShieldCheck, Send, CheckCircle } from 'lucide-react';

export function HeroSection() {
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 60);
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener('resize', handleResize);
    return () => { clearTimeout(t); window.removeEventListener('resize', handleResize); };
  }, []);

  return (
    <div
      style={{
        background: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 45%, #2563eb 100%)',
        borderRadius: '1.25rem',
        overflow: 'hidden',
        position: 'relative',
        boxShadow: '0 25px 60px -10px rgba(109, 40, 217, 0.4)',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(16px)',
        transition: 'opacity 600ms ease, transform 600ms ease',
      }}
    >
      {/* Glow blobs */}
      <div style={{ position: 'absolute', top: -80, right: -80, width: 360, height: 360, background: 'radial-gradient(circle, rgba(96,165,250,0.3) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: -60, left: -60, width: 280, height: 280, background: 'radial-gradient(circle, rgba(167,139,250,0.35) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', top: '50%', right: '30%', width: 200, height: 200, background: 'radial-gradient(circle, rgba(236,72,153,0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />

      {/* Noise texture overlay */}
      <div style={{
        position: 'absolute', inset: 0, opacity: 0.05, pointerEvents: 'none',
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='white' fill-opacity='1'%3E%3Ccircle cx='3' cy='3' r='1.5'/%3E%3Ccircle cx='23' cy='23' r='1.5'/%3E%3Ccircle cx='13' cy='33' r='1.5'/%3E%3Ccircle cx='33' cy='13' r='1.5'/%3E%3C/g%3E%3C/svg%3E")`,
      }} />

      {/* Content grid */}
      <div style={{ position: 'relative', display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '2rem', alignItems: 'center', padding: isMobile ? '2.5rem 1.5rem' : '4.5rem 3.5rem' }}>

        {/* LEFT */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

          {/* AI Badge */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.25)', borderRadius: '9999px', padding: '0.4rem 1rem', width: 'fit-content' }}>
            <Sparkles style={{ width: 14, height: 14, color: '#fde047' }} />
            <span style={{ color: 'rgba(255,255,255,0.95)', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.02em' }}>AI Powered Email Studio</span>
          </div>

          {/* Headline */}
          <div>
            <h1 style={{ fontSize: isMobile ? '1.9rem' : '2.8rem', fontWeight: 800, color: '#fff', lineHeight: 1.15, letterSpacing: '-0.02em', margin: 0, textShadow: '0 2px 20px rgba(0,0,0,0.2)' }}>
              Create, Personalize<br />
              <span style={{ color: '#fde047' }}>&amp; Send Emails</span><br />
              with Gmail — Instantly
            </h1>
          </div>

          {/* Sub-heading */}
          <p style={{ color: 'rgba(221,214,254,0.9)', fontSize: '1rem', lineHeight: 1.7, maxWidth: '26rem', margin: 0 }}>
            Build beautiful HTML emails, connect your Gmail securely with OAuth 2.0,
            and send campaigns in seconds using AI-powered templates.
          </p>

          {/* Feature badges */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem' }}>
            {[
              { icon: <Zap style={{ width: 13, height: 13, color: '#fde047' }} />, label: 'AI Generated' },
              { icon: <ShieldCheck style={{ width: 13, height: 13, color: '#86efac' }} />, label: 'OAuth 2.0 Secure' },
              { icon: <Send style={{ width: 13, height: 13, color: '#93c5fd' }} />, label: 'Send via Gmail' },
            ].map(({ icon, label }) => (
              <span key={label} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(4px)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '9999px', padding: '0.35rem 0.85rem', color: 'rgba(255,255,255,0.9)', fontSize: '0.72rem', fontWeight: 500 }}>
                {icon}{label}
              </span>
            ))}
          </div>

          {/* CTA Buttons */}
          <div style={{ display: 'flex', gap: '0.75rem', paddingTop: '0.25rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => navigate('/compose')}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#fff', color: '#7c3aed', fontWeight: 700, fontSize: '0.875rem', padding: '0.85rem 1.75rem', borderRadius: '0.875rem', border: 'none', cursor: 'pointer', boxShadow: '0 8px 24px rgba(0,0,0,0.2)', transition: 'transform 0.2s, box-shadow 0.2s' }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.04)'; (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 12px 32px rgba(0,0,0,0.28)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)'; (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 8px 24px rgba(0,0,0,0.2)'; }}
            >
              <Mail style={{ width: 16, height: 16 }} />
              Start Creating Email
              <ArrowRight style={{ width: 16, height: 16 }} />
            </button>

            <button
              onClick={() => navigate('/settings')}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.12)', color: '#fff', fontWeight: 600, fontSize: '0.875rem', padding: '0.85rem 1.75rem', borderRadius: '0.875rem', border: '2px solid rgba(255,255,255,0.5)', cursor: 'pointer', backdropFilter: 'blur(8px)', transition: 'transform 0.2s, background 0.2s' }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.04)'; (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.22)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)'; (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.12)'; }}
            >
              <Settings style={{ width: 16, height: 16 }} />
              Connect Gmail
            </button>
          </div>

          {/* Trust line */}
          <p style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'rgba(255,255,255,0.45)', fontSize: '0.75rem', margin: 0 }}>
            <CheckCircle style={{ width: 13, height: 13, color: '#4ade80' }} />
            No credit card required · 100% free to use
          </p>
        </div>

        {/* RIGHT — email mockup (hidden on mobile) */}
        <div style={{ display: isMobile ? 'none' : 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ position: 'relative', width: '100%', maxWidth: 320 }}>

            {/* Glow behind card */}
            <div style={{ position: 'absolute', inset: 16, background: 'rgba(255,255,255,0.18)', borderRadius: '1.5rem', filter: 'blur(20px)' }} />

            {/* Main email mockup card */}
            <div style={{ position: 'relative', background: '#fff', borderRadius: '1.25rem', boxShadow: '0 32px 80px -8px rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.25)', overflow: 'hidden', transform: 'rotate(1.5deg)', transition: 'transform 0.5s ease' }}
              onMouseEnter={e => ((e.currentTarget as HTMLDivElement).style.transform = 'rotate(0deg)')}
              onMouseLeave={e => ((e.currentTarget as HTMLDivElement).style.transform = 'rotate(1.5deg)')}
            >
              {/* Titlebar */}
              <div style={{ background: 'linear-gradient(90deg, #7c3aed, #4f46e5)', padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ display: 'flex', gap: 5 }}>
                  <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#f87171' }} />
                  <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#facc15' }} />
                  <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#4ade80' }} />
                </div>
                <div style={{ flex: 1, height: 14, background: 'rgba(255,255,255,0.25)', borderRadius: 6, marginLeft: 8 }} />
                <Mail style={{ width: 14, height: 14, color: 'rgba(255,255,255,0.7)' }} />
              </div>

              {/* Email content */}
              <div style={{ padding: '1.25rem', background: '#f8f8fc', display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                {/* Banner */}
                <div style={{ width: '100%', height: 70, background: 'linear-gradient(90deg, #7c3aed, #2563eb)', borderRadius: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(124,58,237,0.35)' }}>
                  <span style={{ color: '#fff', fontWeight: 700, fontSize: '0.875rem', letterSpacing: '0.03em' }}>Mailcraft AI</span>
                  <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.65rem', marginTop: 2 }}>Marketing Excellence</span>
                </div>

                {/* Skeleton text */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                  <div style={{ height: 11, background: '#1e1b4b', borderRadius: 5, width: '60%' }} />
                  <div style={{ height: 9, background: '#e2e8f0', borderRadius: 5, width: '100%' }} />
                  <div style={{ height: 9, background: '#e2e8f0', borderRadius: 5, width: '85%' }} />
                  <div style={{ height: 9, background: '#e2e8f0', borderRadius: 5, width: '70%' }} />
                </div>

                {/* CTA button */}
                <div style={{ height: 34, background: 'linear-gradient(90deg, #7c3aed, #2563eb)', borderRadius: 8, width: 110, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(79,70,229,0.4)' }}>
                  <span style={{ color: '#fff', fontSize: '0.7rem', fontWeight: 600 }}>Get Started</span>
                </div>

                {/* Footer skeletons */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: 8 }}>
                  {[36, 36, 36].map((w, i) => (
                    <div key={i} style={{ height: 7, background: '#e2e8f0', borderRadius: 4, width: w }} />
                  ))}
                </div>
              </div>
            </div>

            {/* Floating chip — Sent */}
            <div style={{ position: 'absolute', bottom: -18, left: -20, background: '#fff', borderRadius: 12, boxShadow: '0 8px 24px rgba(0,0,0,0.15)', padding: '0.45rem 0.75rem', display: 'flex', alignItems: 'center', gap: 8, border: '1px solid #f0f0f0', animation: 'float 3s ease-in-out infinite' }}>
              <span style={{ width: 24, height: 24, borderRadius: '50%', background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Send style={{ width: 11, height: 11, color: '#16a34a' }} />
              </span>
              <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#374151' }}>Email Sent ✓</span>
            </div>

            {/* Floating chip — OAuth */}
            <div style={{ position: 'absolute', top: -18, right: -20, background: '#fff', borderRadius: 12, boxShadow: '0 8px 24px rgba(0,0,0,0.15)', padding: '0.45rem 0.75rem', display: 'flex', alignItems: 'center', gap: 8, border: '1px solid #f0f0f0', animation: 'float 3s ease-in-out 0.8s infinite' }}>
              <span style={{ width: 24, height: 24, borderRadius: '50%', background: '#ede9fe', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ShieldCheck style={{ width: 11, height: 11, color: '#7c3aed' }} />
              </span>
              <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#374151' }}>OAuth 2.0</span>
            </div>

            {/* Floating chip — AI */}
            <div style={{ position: 'absolute', top: '40%', right: -28, background: '#fde047', borderRadius: 10, boxShadow: '0 6px 18px rgba(250,204,21,0.4)', padding: '0.35rem 0.65rem', display: 'flex', alignItems: 'center', gap: 5, animation: 'float 3s ease-in-out 1.5s infinite' }}>
              <Sparkles style={{ width: 11, height: 11, color: '#713f12' }} />
              <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#713f12' }}>AI Ready</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
