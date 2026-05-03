import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, FileText, Zap, ArrowRight } from 'lucide-react';
import { HeroSection } from './HeroSection';

/* ── Action card data — purple-first palette to match app theme ── */
const ACTIONS = [
  {
    label: 'Compose Email',
    sub: 'Write & send from a template',
    icon: Mail,
    iconColor: '#7c3aed',
    iconBg: '#ede9fe',
    accentBorder: '#a78bfa',
    accentBg: '#faf5ff',
    gradientTop: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
    route: '/compose',
  },
  {
    label: 'AI Generator',
    sub: 'Generate emails with AI',
    icon: Zap,
    iconColor: '#6d28d9',
    iconBg: '#f3e8ff',
    accentBorder: '#8b5cf6',
    accentBg: '#fdf4ff',
    gradientTop: 'linear-gradient(135deg, #6d28d9, #7c3aed)',
    route: '/ai-generator',
  },
  {
    label: 'Browse Templates',
    sub: 'Explore the template library',
    icon: FileText,
    iconColor: '#2563eb',
    iconBg: '#dbeafe',
    accentBorder: '#60a5fa',
    accentBg: '#eff6ff',
    gradientTop: 'linear-gradient(135deg, #4f46e5, #2563eb)',
    route: '/templates',
  },
];

function ActionCard({ action, visible }: { action: typeof ACTIONS[0]; visible: boolean }) {
  const [hovered, setHovered] = useState(false);
  const navigate = useNavigate();
  const Icon = action.icon;

  return (
    <button
      onClick={() => navigate(action.route)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        padding: '1.25rem 1.4rem',
        paddingTop: '1.45rem',           // extra top room for accent bar
        background: hovered ? action.accentBg : '#ffffff',
        border: `1.5px solid ${hovered ? action.accentBorder : '#ede9fe'}`,
        borderRadius: '1rem',
        boxShadow: hovered
          ? `0 12px 32px rgba(124,58,237,0.13)`
          : '0 2px 12px rgba(124,58,237,0.06)',
        cursor: 'pointer',
        textAlign: 'left',
        transform: hovered ? 'translateY(-4px)' : 'translateY(0)',
        opacity: visible ? 1 : 0,
        transition: 'all 0.25s ease',
        width: '100%',
        overflow: 'hidden',
      }}
    >
      {/* Top gradient accent bar */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: action.gradientTop, borderRadius: '1rem 1rem 0 0' }} />

      {/* Icon bubble */}
      <div style={{
        width: 48, height: 48,
        background: hovered ? action.iconBg : action.iconBg,
        borderRadius: 12,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
        transform: hovered ? 'scale(1.08)' : 'scale(1)',
        transition: 'transform 0.2s ease',
        boxShadow: hovered ? `0 4px 12px ${action.accentBorder}55` : '0 2px 8px rgba(124,58,237,0.1)',
      }}>
        <Icon style={{ width: 22, height: 22, color: action.iconColor }} />
      </div>

      {/* Text */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontWeight: 700, fontSize: '0.9rem', color: '#1e1b4b', margin: 0 }}>
          {action.label}
        </p>
        <p style={{ fontSize: '0.77rem', color: '#9ca3af', margin: '3px 0 0' }}>
          {action.sub}
        </p>
      </div>

      {/* Arrow */}
      <ArrowRight style={{
        width: 16, height: 16,
        color: hovered ? action.iconColor : '#d1d5db',
        flexShrink: 0,
        transform: hovered ? 'translateX(4px)' : 'translateX(0)',
        transition: 'color 0.2s, transform 0.2s',
      }} />
    </button>
  );
}

export function Dashboard() {
  const [actionsVisible, setActionsVisible] = useState([false, false, false]);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    ACTIONS.forEach((_, i) =>
      setTimeout(() => {
        setActionsVisible(prev => {
          const n = [...prev];
          n[i] = true;
          return n;
        });
      }, 220 + i * 110)
    );
  }, []);

  return (
    <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: '2rem' }}>

      {/* Subtle page-level background glow blobs */}
      <div style={{ position: 'fixed', top: 0, left: 0, width: 350, height: 350, background: 'radial-gradient(circle, rgba(167,139,250,0.14) 0%, transparent 70%)', pointerEvents: 'none', zIndex: -1 }} />
      <div style={{ position: 'fixed', bottom: 0, right: 0, width: 350, height: 350, background: 'radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%)', pointerEvents: 'none', zIndex: -1 }} />

      {/* ── Hero ── */}
      <HeroSection />

      {/* ── Quick Actions ── */}
      <section style={{ paddingBottom: '1.5rem' }}>
        {/* Section header */}
        <div style={{ marginBottom: '1rem' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1e1b4b', margin: 0 }}>
            Quick Actions
          </h2>
          <p style={{ fontSize: '0.8rem', color: '#9ca3af', margin: '3px 0 0' }}>
            Jump right into your workflow
          </p>
        </div>

        {/* Responsive grid: 1 col on mobile, 3 on desktop */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
          gap: '1.1rem',
        }}>
          {ACTIONS.map((action, i) => (
            <ActionCard key={action.label} action={action} visible={actionsVisible[i]} />
          ))}
        </div>
      </section>
    </div>
  );
}
