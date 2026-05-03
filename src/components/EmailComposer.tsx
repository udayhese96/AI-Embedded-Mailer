import React, { useState, useRef, useLayoutEffect } from 'react';
import { EmailTemplate, EmailDraft, GmailConnection } from '../types/template';
import { Send, Eye, Plus, X, ArrowLeft, FileText, CheckCircle } from 'lucide-react';
import { API_URL } from '../config/api';
import { TemplatePreviewModal } from './TemplatePreviewModal';

/* ─── Scaled iframe thumbnail — mirrors TemplateLibrary approach ─── */
const EMAIL_W = 600;
const PREVIEW_H = 480;

function ScaledPreview({ html }: { html: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.45);

  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => setScale(el.offsetWidth / EMAIL_W);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const iframeH = scale > 0 ? Math.round(PREVIEW_H / scale) : 1000;

  return (
    <div
      ref={containerRef}
      style={{ height: PREVIEW_H, overflow: 'hidden', background: '#fff', position: 'relative' }}
    >
      <iframe
        srcDoc={html}
        style={{
          width: EMAIL_W,
          height: iframeH,
          border: 0,
          display: 'block',
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
          pointerEvents: 'none',
        }}
        title="Quick Preview"
        tabIndex={-1}
        scrolling="no"
        sandbox="allow-same-origin"
      />
    </div>
  );
}

interface EmailComposerProps {
  template: EmailTemplate | null;
  gmailConnection: GmailConnection;
  onBack: () => void;
  onSend: (draft: EmailDraft) => void;
}

export function EmailComposer({ template, gmailConnection, onBack, onSend }: EmailComposerProps) {
  const [draft, setDraft] = useState<EmailDraft>({
    to: [],
    cc: [],
    bcc: [],
    subject: template?.subject || '',
    html: template?.html || '',
    templateId: template?.id,
  });
  const [toInput, setToInput] = useState('');
  const [ccInput, setCcInput] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const addEmail = (email: string, field: 'to' | 'cc' | 'bcc') => {
    if (email && email.includes('@')) {
      setDraft(prev => ({ ...prev, [field]: [...(prev[field] || []), email] }));
      if (field === 'to') setToInput('');
      if (field === 'cc') setCcInput('');
    }
  };

  const removeEmail = (email: string, field: 'to' | 'cc' | 'bcc') => {
    setDraft(prev => ({ ...prev, [field]: (prev[field] || []).filter(e => e !== email) }));
  };

  const handleSend = async () => {
    if (draft.to.length === 0) { alert('Please add at least one recipient'); return; }
    if (!draft.subject) { alert('Please add a subject'); return; }
    if (!gmailConnection.isConnected) { alert('Please connect your Gmail account first'); return; }

    try {
      const formData = new FormData();
      formData.append('session_id', gmailConnection.accessToken!);
      formData.append('to', draft.to.join(', '));
      formData.append('subject', draft.subject);
      formData.append('html_body', draft.html || '');
      if (draft.cc && draft.cc.length > 0) formData.append('cc', draft.cc.join(', '));

      const response = await fetch(`${API_URL}/send-email`, { method: 'POST', body: formData });
      if (!response.ok) throw new Error('Failed to send email');

      onSend(draft);
      setShowSuccess(true);
      setTimeout(() => { setShowSuccess(false); onBack(); }, 2000);
    } catch (error) {
      console.error('Error sending email:', error);
      alert('Failed to send email. Please try again.');
    }
  };

  return (
    <div className="space-y-6">

      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>
          <div>
            <h1 className="text-gray-900">Compose Email</h1>
            <p className="text-sm text-gray-500">
              {template ? `Using: ${template.name}` : 'Create new email'}
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowPreview(true)}
            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0.65rem 1.4rem', background: '#fff', border: '1.5px solid #c4b5fd', color: '#7c3aed', borderRadius: '0.7rem', fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer', transition: 'all 0.2s' }}
          >
            <Eye className="w-5 h-5" />
            Preview
          </button>
          <button
            onClick={handleSend}
            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0.65rem 1.4rem', background: 'linear-gradient(135deg, #7c3aed, #2563eb)', color: '#fff', border: 'none', borderRadius: '0.7rem', fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer', boxShadow: '0 4px 14px rgba(124,58,237,0.35)', transition: 'all 0.2s' }}
          >
            <Send className="w-5 h-5" />
            Send Email
          </button>
        </div>
      </div>

      {/* ── Gmail status banners ── */}
      {!gmailConnection.isConnected && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="text-yellow-600">⚠️</div>
            <div className="flex-1">
              <div className="text-yellow-900">Gmail Not Connected</div>
              <div className="text-sm text-yellow-700">Please connect your Gmail account to send emails</div>
            </div>
            <button className="text-sm text-yellow-700 hover:text-yellow-900 underline">Connect Now</button>
          </div>
        </div>
      )}

      {gmailConnection.isConnected && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <div className="flex-1">
              <div className="text-green-900">Gmail Connected</div>
              <div className="text-sm text-green-700">Sending as: {gmailConnection.email}</div>
            </div>
          </div>
        </div>
      )}

      {/* ── Two-column layout ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left: form */}
        <div className="lg:col-span-2 space-y-6" style={{ background: '#fff', borderRadius: '1rem', border: '1.5px solid #ede9fe', boxShadow: '0 2px 12px rgba(124,58,237,0.07)', padding: '1.5rem' }}>

          {/* To */}
          <div>
            <label className="block text-sm text-gray-700 mb-2">To</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {draft.to.map((email, i) => (
                <div key={i} className="flex items-center gap-2 bg-purple-100 text-purple-700 px-3 py-1 rounded-full">
                  <span className="text-sm">{email}</span>
                  <button onClick={() => removeEmail(email, 'to')} className="hover:text-purple-900">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="email"
                value={toInput}
                onChange={e => setToInput(e.target.value)}
                onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), addEmail(toInput, 'to'))}
                placeholder="recipient@example.com"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <button
                onClick={() => addEmail(toInput, 'to')}
                style={{ padding: '0.5rem 0.85rem', background: 'linear-gradient(135deg, #7c3aed, #4f46e5)', color: '#fff', border: 'none', borderRadius: '0.6rem', cursor: 'pointer' }}
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* CC */}
          <div>
            <label className="block text-sm text-gray-700 mb-2">CC (Optional)</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {draft.cc && draft.cc.map((email, i) => (
                <div key={i} className="flex items-center gap-2 bg-gray-100 text-gray-700 px-3 py-1 rounded-full">
                  <span className="text-sm">{email}</span>
                  <button onClick={() => removeEmail(email, 'cc')} className="hover:text-gray-900">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="email"
                value={ccInput}
                onChange={e => setCcInput(e.target.value)}
                onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), addEmail(ccInput, 'cc'))}
                placeholder="cc@example.com"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <button
                onClick={() => addEmail(ccInput, 'cc')}
                style={{ padding: '0.5rem 0.85rem', background: 'linear-gradient(135deg, #7c3aed, #4f46e5)', color: '#fff', border: 'none', borderRadius: '0.6rem', cursor: 'pointer' }}
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Subject */}
          <div>
            <label className="block text-sm text-gray-700 mb-2">Subject</label>
            <input
              type="text"
              value={draft.subject}
              onChange={e => setDraft({ ...draft, subject: e.target.value })}
              placeholder="Enter email subject"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          {/* HTML content */}
          <div>
            <label className="block text-sm text-gray-700 mb-2">Email Content (HTML)</label>
            <textarea
              value={draft.html}
              onChange={e => setDraft({ ...draft, html: e.target.value })}
              placeholder="Enter HTML content or use a template"
              className="w-full h-64 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono text-sm"
            />
          </div>
        </div>

        {/* Right: Quick Preview (properly scaled) */}
        <div style={{ background: '#fff', borderRadius: '1rem', border: '1.5px solid #ede9fe', boxShadow: '0 2px 12px rgba(124,58,237,0.07)', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <h3 className="text-gray-900 flex items-center gap-2 flex-shrink-0">
            <FileText className="w-5 h-5" />
            Quick Preview
          </h3>

          {/* Scaled iframe wrapper */}
          <div style={{ flex: 1, border: '1.5px solid #ede9fe', borderRadius: '0.6rem', overflow: 'hidden', background: '#faf5ff' }}>
            {draft.html ? (
              <ScaledPreview html={draft.html} />
            ) : (
              <div className="flex flex-col items-center justify-center h-[480px] text-gray-400 gap-2">
                <FileText className="w-10 h-10 opacity-30" />
                <span className="text-sm">No content to preview</span>
              </div>
            )}
          </div>

          {/* Open full-screen preview */}
          <button
            onClick={() => setShowPreview(true)}
            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '0.55rem', background: '#faf5ff', border: '1.5px solid #c4b5fd', color: '#7c3aed', borderRadius: '0.6rem', fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer', transition: 'all 0.2s' }}
          >
            <Eye className="w-4 h-4" />
            Open Full Preview
          </button>
        </div>
      </div>

      {/* Full-screen Preview Modal */}
      <TemplatePreviewModal
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        htmlContent={draft.html || ''}
        templateName="Email Preview"
        templateSubject={draft.subject}
      />

      {/* Success Modal */}
      {showSuccess && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 max-w-md text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-gray-900 mb-2">Email Sent Successfully!</h2>
            <p className="text-gray-600">Your email has been sent to {draft.to.length} recipient(s)</p>
          </div>
        </div>
      )}
    </div>
  );
}
