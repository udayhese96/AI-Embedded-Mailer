import React, { useState } from 'react';
import { EmailTemplate, EmailDraft, GmailConnection } from '../types/template';
import { Send, Eye, X, Plus, ArrowLeft, FileText, CheckCircle } from 'lucide-react';
import { API_URL } from '../config/api';

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
    templateId: template?.id
  });
  const [toInput, setToInput] = useState('');
  const [ccInput, setCcInput] = useState('');
  const [bccInput, setBccInput] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const addEmail = (email: string, field: 'to' | 'cc' | 'bcc') => {
    if (email && email.includes('@')) {
      setDraft(prev => ({
        ...prev,
        [field]: [...(prev[field] || []), email]
      }));
      if (field === 'to') setToInput('');
      if (field === 'cc') setCcInput('');
      if (field === 'bcc') setBccInput('');
    }
  };

  const removeEmail = (email: string, field: 'to' | 'cc' | 'bcc') => {
    setDraft(prev => ({
      ...prev,
      [field]: (prev[field] || []).filter(e => e !== email)
    }));
  };

  const handleSend = async () => {
    if (draft.to.length === 0) {
      alert('Please add at least one recipient');
      return;
    }
    if (!draft.subject) {
      alert('Please add a subject');
      return;
    }
    if (!gmailConnection.isConnected) {
      alert('Please connect your Gmail account first');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('session_id', gmailConnection.accessToken!);
      formData.append('to', draft.to.join(', '));
      formData.append('subject', draft.subject);
      formData.append('html_body', draft.html || '');
      if (draft.cc && draft.cc.length > 0) {
        formData.append('cc', draft.cc.join(', '));
      }

      const response = await fetch(`${API_URL}/send-email`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to send email');
      }

      const result = await response.json();
      onSend(draft);
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        onBack();
      }, 2000);

    } catch (error) {
      console.error('Error sending email:', error);
      alert('Failed to send email. Please try again.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
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
            className="flex items-center gap-2 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Eye className="w-5 h-5" />
            Preview
          </button>
          <button
            onClick={handleSend}
            className="flex items-center gap-2 bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Send className="w-5 h-5" />
            Send Email
          </button>
        </div>
      </div>

      {/* Gmail Connection Status */}
      {!gmailConnection.isConnected && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="text-yellow-600">⚠️</div>
            <div className="flex-1">
              <div className="text-yellow-900">Gmail Not Connected</div>
              <div className="text-sm text-yellow-700">Please connect your Gmail account to send emails</div>
            </div>
            <button className="text-sm text-yellow-700 hover:text-yellow-900 underline">
              Connect Now
            </button>
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

      {/* Composer Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6">
          {/* To Field */}
          <div>
            <label className="block text-sm text-gray-700 mb-2">To</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {draft.to.map((email, index) => (
                <div key={index} className="flex items-center gap-2 bg-purple-100 text-purple-700 px-3 py-1 rounded-full">
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
                onChange={(e) => setToInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addEmail(toInput, 'to'))}
                placeholder="recipient@example.com"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <button
                onClick={() => addEmail(toInput, 'to')}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* CC Field */}
          <div>
            <label className="block text-sm text-gray-700 mb-2">CC (Optional)</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {draft.cc && draft.cc.map((email, index) => (
                <div key={index} className="flex items-center gap-2 bg-gray-100 text-gray-700 px-3 py-1 rounded-full">
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
                onChange={(e) => setCcInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addEmail(ccInput, 'cc'))}
                placeholder="cc@example.com"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <button
                onClick={() => addEmail(ccInput, 'cc')}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Subject Field */}
          <div>
            <label className="block text-sm text-gray-700 mb-2">Subject</label>
            <input
              type="text"
              value={draft.subject}
              onChange={(e) => setDraft({ ...draft, subject: e.target.value })}
              placeholder="Enter email subject"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          {/* Email Content */}
          <div>
            <label className="block text-sm text-gray-700 mb-2">Email Content (HTML)</label>
            <textarea
              value={draft.html}
              onChange={(e) => setDraft({ ...draft, html: e.target.value })}
              placeholder="Enter HTML content or use a template"
              className="w-full h-64 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono text-sm"
            />
          </div>
        </div>

        {/* Quick Preview Sidebar */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <h3 className="text-gray-900 mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Quick Preview
          </h3>
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            {draft.html ? (
              <iframe
                srcDoc={draft.html}
                className="w-full h-96 border-0"
                title="Quick Preview"
              />
            ) : (
              <div className="flex items-center justify-center h-96 text-gray-400">
                No content to preview
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Full Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowPreview(false)}>
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h2 className="text-gray-900">Email Preview</h2>
                <p className="text-sm text-gray-500">To: {draft.to.join(', ')}</p>
                <p className="text-sm text-gray-500">Subject: {draft.subject}</p>
              </div>
              <button
                onClick={() => setShowPreview(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="overflow-auto max-h-[calc(90vh-140px)]">
              <iframe
                srcDoc={draft.html}
                className="w-full h-[600px] border-0"
                title="Email Preview"
              />
            </div>
            <div className="flex gap-3 p-6 border-t border-gray-200">
              <button
                onClick={handleSend}
                className="flex-1 bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
              >
                <Send className="w-5 h-5" />
                Send Email
              </button>
              <button
                onClick={() => setShowPreview(false)}
                className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

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
