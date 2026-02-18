import React, { useState } from 'react';
import { EmailTemplate } from '../types/template';
import { Eye, Edit, Copy, Trash2, Plus } from 'lucide-react';

interface TemplateLibraryProps {
  templates: EmailTemplate[];
  onSelectTemplate: (template: EmailTemplate) => void;
  onEditTemplate: (template: EmailTemplate) => void;
  onDeleteTemplate: (templateId: string) => void;
  onDuplicateTemplate: (template: EmailTemplate) => void;
}

export function TemplateLibrary({
  templates,
  onSelectTemplate,
  onEditTemplate,
  onDeleteTemplate,
  onDuplicateTemplate
}: TemplateLibraryProps) {
  const [filter, setFilter] = useState<string>('all');
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const filteredTemplates = templates.filter(t => {
    if (filter === 'all') return true;
    if (filter === 'custom') return t.isCustom;
    return t.category === filter;
  });

  const handlePreview = (template: EmailTemplate) => {
    setSelectedTemplate(template);
    setShowPreview(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-gray-900 mb-2">Email Templates</h1>
          <p className="text-gray-600">Choose from our professional templates or create your own</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-gray-200 overflow-x-auto">
        {['all', 'general', 'marketing', 'business', 'personal', 'newsletter', 'promotional', 'onboarding'].map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-4 py-2 border-b-2 transition-colors whitespace-nowrap capitalize ${filter === cat
              ? 'border-purple-600 text-purple-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
          >
            {cat.replace('-', ' ')}
          </button>
        ))}
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map((template) => (
          <div key={template.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
            {/* Thumbnail / Live Preview */}
            <div className="relative h-64 bg-gray-100 overflow-hidden group-hover:shadow-inner transition-all">
              <div className="w-[400%] h-[400%] origin-top-left transform scale-[0.25]">
                <iframe
                  srcDoc={template.html}
                  className="w-full h-full border-0 pointer-events-none bg-white"
                  title={`Preview of ${template.name}`}
                  tabIndex={-1}
                  sandbox="allow-same-origin"
                />
              </div>

              {/* Overlay to catch clicks and show actions on hover/focus could be added here if needed, 
                  but the pointer-events-none on iframe handles the interaction blocking. 
                  We add a transparent div just to be sure clicks go to the card if needed. */}
              <div className="absolute inset-0 bg-transparent" />

              {template.isCustom && (
                <div className="absolute top-2 right-2 bg-purple-600 text-white text-xs px-2 py-1 rounded shadow-sm">
                  User Template
                </div>
              )}
              {template.visibility === 'public' && (
                <div className="absolute top-2 left-2 bg-green-600 text-white text-xs px-2 py-1 rounded shadow-sm">
                  Public
                </div>
              )}
            </div>

            {/* Content */}
            <div className="p-4">
              <div className="flex justify-between items-start mb-1">
                <h3 className="text-gray-900 font-semibold truncate flex-1" title={template.name}>{template.name}</h3>
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full capitalize ml-2">
                  {template.category}
                </span>
              </div>
              <p className="text-sm text-gray-500 mb-2 line-clamp-1" title={template.subject}>
                <span className="font-medium">Subject:</span> {template.subject}
              </p>
              {template.description && (
                <p className="text-xs text-gray-400 mb-4 line-clamp-2" title={template.description}>
                  {template.description}
                </p>
              )}

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => handlePreview(template)}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Eye className="w-4 h-4" />
                  <span className="text-sm">Preview</span>
                </button>
                <button
                  onClick={() => onEditTemplate(template)}
                  className="flex items-center justify-center gap-2 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <Edit className="w-4 h-4" />
                  <span className="text-sm">Use</span>
                </button>
                <button
                  onClick={() => onDuplicateTemplate(template)}
                  className="flex items-center justify-center px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  title="Duplicate"
                >
                  <Copy className="w-4 h-4" />
                </button>
                {template.isCustom && (
                  <button
                    onClick={() => onDeleteTemplate(template.id)}
                    className="flex items-center justify-center px-3 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}

        {/* Create New Template Card */}
        <div className="bg-white rounded-xl shadow-sm border-2 border-dashed border-gray-300 overflow-hidden hover:border-purple-500 hover:bg-purple-50 transition-all cursor-pointer">
          <div className="flex flex-col items-center justify-center h-full p-8">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
              <Plus className="w-8 h-8 text-purple-600" />
            </div>
            <h3 className="text-gray-900 mb-2">Create New Template</h3>
            <p className="text-sm text-gray-500 text-center">Start from scratch or use AI</p>
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      {showPreview && selectedTemplate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowPreview(false)}>
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h2 className="text-gray-900">{selectedTemplate.name}</h2>
                <p className="text-sm text-gray-500">{selectedTemplate.subject}</p>
              </div>
              <button
                onClick={() => setShowPreview(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            <div className="overflow-auto max-h-[calc(90vh-140px)]">
              <iframe
                srcDoc={selectedTemplate.html}
                className="w-full h-[600px] border-0"
                title="Email Preview"
              />
            </div>
            <div className="flex gap-3 p-6 border-t border-gray-200">
              <button
                onClick={() => {
                  onEditTemplate(selectedTemplate);
                  setShowPreview(false);
                }}
                className="flex-1 bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors"
              >
                Use This Template
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
    </div>
  );
}
