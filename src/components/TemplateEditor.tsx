import React, { useState } from 'react';
import { EmailTemplate } from '../types/template';
import { Save, Eye, Code, Monitor, Smartphone, ArrowLeft } from 'lucide-react';

interface TemplateEditorProps {
  template: EmailTemplate | null;
  onSave: (template: EmailTemplate) => void;
  onBack: () => void;
}

export function TemplateEditor({ template, onSave, onBack }: TemplateEditorProps) {
  const [editedTemplate, setEditedTemplate] = useState<EmailTemplate>(
    template || {
      id: `custom-${Date.now()}`,
      name: 'New Template',
      category: 'custom',
      subject: '',
      html: '',
      createdAt: new Date(),
      updatedAt: new Date(),
      isCustom: true
    }
  );
  const [viewMode, setViewMode] = useState<'preview' | 'code'>('preview');
  const [deviceMode, setDeviceMode] = useState<'desktop' | 'mobile'>('desktop');

  const handleSave = () => {
    onSave({
      ...editedTemplate,
      updatedAt: new Date()
    });
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
            <h1 className="text-gray-900">Template Editor</h1>
            <p className="text-sm text-gray-500">Customize your email template</p>
          </div>
        </div>
        <button
          onClick={handleSave}
          className="flex items-center gap-2 bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors"
        >
          <Save className="w-5 h-5" />
          Save Template
        </button>
      </div>

      {/* Editor Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Panel - Settings */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6">
          <div>
            <h3 className="text-gray-900 mb-4">Template Settings</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-700 mb-2">Template Name</label>
                <input
                  type="text"
                  value={editedTemplate.name}
                  onChange={(e) => setEditedTemplate({ ...editedTemplate, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Enter template name"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-2">Email Subject</label>
                <input
                  type="text"
                  value={editedTemplate.subject}
                  onChange={(e) => setEditedTemplate({ ...editedTemplate, subject: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Enter email subject"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-2">Category</label>
                <select
                  value={editedTemplate.category}
                  onChange={(e) => setEditedTemplate({ ...editedTemplate, category: e.target.value as any })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="welcome">Welcome</option>
                  <option value="newsletter">Newsletter</option>
                  <option value="promotional">Promotional</option>
                  <option value="follow-up">Follow-Up</option>
                  <option value="custom">Custom</option>
                </select>
              </div>
            </div>
          </div>

          {/* View Mode Selector */}
          <div>
            <h3 className="text-gray-900 mb-4">View Mode</h3>
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('preview')}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  viewMode === 'preview'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Eye className="w-4 h-4" />
                Preview
              </button>
              <button
                onClick={() => setViewMode('code')}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  viewMode === 'code'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Code className="w-4 h-4" />
                HTML Code
              </button>
            </div>
          </div>

          {/* HTML Code Editor (when in code mode) */}
          {viewMode === 'code' && (
            <div>
              <label className="block text-sm text-gray-700 mb-2">HTML Code</label>
              <textarea
                value={editedTemplate.html}
                onChange={(e) => setEditedTemplate({ ...editedTemplate, html: e.target.value })}
                className="w-full h-96 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono text-sm"
                placeholder="Enter HTML code here..."
              />
            </div>
          )}
        </div>

        {/* Right Panel - Preview */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="border-b border-gray-200 p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-900">Preview</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => setDeviceMode('desktop')}
                  className={`p-2 rounded-lg transition-colors ${
                    deviceMode === 'desktop'
                      ? 'bg-purple-100 text-purple-600'
                      : 'text-gray-400 hover:text-gray-600'
                  }`}
                  title="Desktop View"
                >
                  <Monitor className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setDeviceMode('mobile')}
                  className={`p-2 rounded-lg transition-colors ${
                    deviceMode === 'mobile'
                      ? 'bg-purple-100 text-purple-600'
                      : 'text-gray-400 hover:text-gray-600'
                  }`}
                  title="Mobile View"
                >
                  <Smartphone className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="text-sm text-gray-500">
              Subject: {editedTemplate.subject || 'No subject'}
            </div>
          </div>
          <div className="bg-gray-50 p-4 flex items-center justify-center min-h-[600px]">
            <div className={`bg-white ${deviceMode === 'mobile' ? 'w-[375px]' : 'w-full'} h-[600px] overflow-auto shadow-lg`}>
              {editedTemplate.html ? (
                <iframe
                  srcDoc={editedTemplate.html}
                  className="w-full h-full border-0"
                  title="Email Preview"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400">
                  No content to preview
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
