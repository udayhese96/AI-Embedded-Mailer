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
    /* Overlay */
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className={[
        'fixed inset-0 z-50',
        'bg-blue-950/60 backdrop-blur-sm',
        'flex items-center justify-center',
        'px-2 py-4 sm:px-4',
        /* entrance animation */
        'animate-[fadeIn_200ms_ease-out]',
      ].join(' ')}
      role="dialog"
      aria-modal="true"
      aria-label="Email Preview"
    >
      {/* Modal container */}
      <div
        className={[
          'relative flex flex-col',
          'bg-white rounded-2xl',
          /* dark popup border for clear visual separation */
          'border-2 border-gray-900',
          /* layered shadow: tight dark ring + wide soft glow */
          'shadow-[0_0_0_1px_rgba(0,0,0,0.85),0_24px_60px_-8px_rgba(0,0,0,0.6)]',
          'w-full max-w-4xl',
          'max-h-[95vh] sm:max-h-[90vh]',
          'overflow-hidden',
          /* entrance animation */
          'animate-[scaleIn_220ms_cubic-bezier(0.16,1,0.3,1)]',
        ].join(' ')}
      >
        {/* ── Sticky header ── */}
        <div className="sticky top-0 z-10 flex items-center justify-between gap-3 px-5 py-4 bg-white border-b border-gray-100 flex-shrink-0">
          {/* Left — icon + title */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex-shrink-0 w-9 h-9 rounded-full bg-purple-100 flex items-center justify-center">
              <Mail className="w-4 h-4 text-purple-600" />
            </div>
            <div className="min-w-0">
              <h2 className="text-gray-900 font-semibold text-base leading-snug truncate">
                {templateName}
              </h2>
              {templateSubject && (
                <p className="text-xs text-gray-400 truncate mt-0.5">
                  {templateSubject}
                </p>
              )}
            </div>
          </div>

          {/* Right — close button */}
          <button
            onClick={onClose}
            className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-red-100 text-gray-500 hover:text-red-500 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500"
            aria-label="Close preview"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ── Email iframe ── */}
        <div className="flex-1 overflow-hidden" style={{ minHeight: 0 }}>
          <iframe
            srcDoc={htmlContent}
            title="Email Preview"
            className="w-full border-0 block"
            style={{ height: 'clamp(400px, 70vh, 780px)' }}
            scrolling="yes"
            sandbox="allow-same-origin"
          />
        </div>

        {/* ── Footer ── */}
        <div className="flex-shrink-0 flex items-center gap-2 px-5 py-3 border-t border-gray-100 bg-gray-50/70">
          <button
            onClick={handleCopy}
            className={`flex items-center gap-2 text-sm font-medium px-5 py-2 rounded-xl transition-all duration-200 shadow-sm focus:outline-none focus-visible:ring-2 ${
              copied
                ? 'bg-green-100 text-green-900 border border-green-300 focus-visible:ring-green-400'
                : 'bg-purple-600 hover:bg-purple-700 active:scale-[0.98] text-white focus-visible:ring-purple-400'
            }`}
          >
            {copied ? (
              <><Check className="w-4 h-4" /><span>Copied!</span></>
            ) : (
              <><Code2 className="w-4 h-4" /><span>Copy HTML</span></>
            )}
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50 rounded-xl transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
