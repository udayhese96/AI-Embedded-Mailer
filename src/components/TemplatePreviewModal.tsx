import React, { useEffect, useRef, useCallback, useState } from 'react';
import { X, Code2, Check, Mail } from 'lucide-react';

interface TemplatePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  htmlContent: string;
  templateName?: string;
  templateSubject?: string;
  onUse?: () => void;
}

export function TemplatePreviewModal({
  isOpen,
  onClose,
  htmlContent,
  templateName = 'Email Preview',
  templateSubject,
  onUse,
}: TemplatePreviewModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  const [closeHovered, setCloseHovered] = useState(false);
  const [copyHovered, setCopyHovered] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(htmlContent);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = htmlContent;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  /* ── Lock body scroll when open ── */
  useEffect(() => {
    if (isOpen) {
      const scrollY = window.scrollY;
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      return () => {
        document.body.style.overflow = '';
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        window.scrollTo(0, scrollY);
      };
    }
  }, [isOpen]);

  /* ── ESC to close ── */
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  /* ── Click-outside to close ── */
  const handleOverlayClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.target === overlayRef.current) onClose();
    },
    [onClose],
  );

  if (!isOpen) return null;

  return (
    /* ── Overlay ── */
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 50,
        background: 'rgba(30, 27, 75, 0.65)',  /* deep indigo tint */
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        animation: 'fadeIn 200ms ease-out',
      }}
      role="dialog"
      aria-modal="true"
      aria-label="Email Preview"
    >
      {/* ── Modal container ── */}
      <div
        style={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          background: '#ffffff',
          borderRadius: '1.25rem',
          /* Purple-themed border matching template cards */
          border: '2px solid #7c3aed',
          /* Layered purple shadow */
          boxShadow: '0 0 0 1px rgba(124,58,237,0.15), 0 32px 80px -8px rgba(79,46,209,0.45)',
          width: '100%',
          maxWidth: '52rem',
          maxHeight: '92vh',
          overflow: 'hidden',
          animation: 'scaleIn 220ms cubic-bezier(0.16,1,0.3,1)',
        }}
      >
        {/* ── Gradient header ── */}
        <div
          style={{
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            padding: '0.9rem 1.25rem',
            background: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 55%, #2563eb 100%)',
            borderBottom: '1px solid rgba(255,255,255,0.15)',
          }}
        >
          {/* Left — icon + title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0 }}>
            <div style={{
              flexShrink: 0,
              width: 36, height: 36,
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Mail style={{ width: 16, height: 16, color: '#fff' }} />
            </div>
            <div style={{ minWidth: 0 }}>
              <h2 style={{
                color: '#fff',
                fontWeight: 700,
                fontSize: '0.95rem',
                lineHeight: 1.3,
                margin: 0,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}>
                {templateName}
              </h2>
              {templateSubject && (
                <p style={{
                  color: 'rgba(221,214,254,0.85)',
                  fontSize: '0.72rem',
                  margin: '2px 0 0',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}>
                  {templateSubject}
                </p>
              )}
            </div>
          </div>

          {/* Close button */}
          <button
            onClick={onClose}
            onMouseEnter={() => setCloseHovered(true)}
            onMouseLeave={() => setCloseHovered(false)}
            aria-label="Close preview"
            style={{
              flexShrink: 0,
              width: 32, height: 32,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              borderRadius: '50%',
              background: closeHovered ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.15)',
              border: '1px solid rgba(255,255,255,0.25)',
              color: '#fff',
              cursor: 'pointer',
              transition: 'background 0.2s',
            }}
          >
            <X style={{ width: 16, height: 16 }} />
          </button>
        </div>

        {/* 3-px gradient accent line below header */}
        <div style={{ height: 3, background: 'linear-gradient(90deg, #7c3aed, #4f46e5, #2563eb)', flexShrink: 0 }} />

        {/* ── Email iframe ── */}
        <div style={{ flex: 1, overflow: 'hidden', minHeight: 0 }}>
          <iframe
            srcDoc={htmlContent}
            title="Email Preview"
            style={{
              width: '100%',
              height: 'clamp(380px, 65vh, 740px)',
              border: 0,
              display: 'block',
            }}
            scrolling="yes"
            sandbox="allow-same-origin"
          />
        </div>

        {/* ── Footer ── */}
        <div style={{
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          padding: '0.85rem 1.25rem',
          borderTop: '1px solid #ede9fe',
          background: 'linear-gradient(135deg, #faf5ff 0%, #eff6ff 100%)',
        }}>
          {/* Copy HTML — gradient button */}
          <button
            onClick={handleCopy}
            onMouseEnter={() => setCopyHovered(true)}
            onMouseLeave={() => setCopyHovered(false)}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.45rem',
              padding: '0.55rem 1.25rem',
              borderRadius: '0.75rem',
              border: 'none',
              cursor: 'pointer',
              fontSize: '0.85rem',
              fontWeight: 600,
              transition: 'all 0.2s',
              transform: copyHovered ? 'scale(1.03)' : 'scale(1)',
              ...(copied
                ? { background: '#dcfce7', color: '#14532d', border: '1px solid #86efac' }
                : {
                    background: 'linear-gradient(135deg, #7c3aed, #2563eb)',
                    color: '#fff',
                    boxShadow: copyHovered
                      ? '0 8px 20px rgba(124,58,237,0.45)'
                      : '0 4px 12px rgba(124,58,237,0.3)',
                  }
              ),
            }}
          >
            {copied ? (
              <><Check style={{ width: 15, height: 15 }} /><span>Copied!</span></>
            ) : (
              <><Code2 style={{ width: 15, height: 15 }} /><span>Copy HTML</span></>
            )}
          </button>

          {/* Close — secondary outline button */}
          <button
            onClick={onClose}
            style={{
              display: 'flex', alignItems: 'center',
              padding: '0.55rem 1.25rem',
              borderRadius: '0.75rem',
              border: '1.5px solid #c4b5fd',
              background: '#fff',
              color: '#6d28d9',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.background = '#f5f3ff';
              (e.currentTarget as HTMLButtonElement).style.borderColor = '#7c3aed';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.background = '#fff';
              (e.currentTarget as HTMLButtonElement).style.borderColor = '#c4b5fd';
            }}
          >
            Close
          </button>

          {/* ESC hint */}
          <span style={{ marginLeft: 'auto', fontSize: '0.7rem', color: '#a78bfa', letterSpacing: '0.03em' }}>
            Press <kbd style={{ background: '#ede9fe', border: '1px solid #c4b5fd', borderRadius: 4, padding: '1px 5px', fontFamily: 'monospace', color: '#6d28d9' }}>ESC</kbd> to close
          </span>
        </div>
      </div>
    </div>
  );
}
