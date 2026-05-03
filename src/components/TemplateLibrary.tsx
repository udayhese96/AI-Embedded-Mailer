import React, { useState, useRef, useLayoutEffect } from 'react';
import { EmailTemplate } from '../types/template';
import { Eye, Code2, Check } from 'lucide-react';
import { TemplatePreviewModal } from './TemplatePreviewModal';

const PREVIEW_H = 360;
const EMAIL_W = 600;

/** Inject scrollbar-suppression into email HTML for clean thumbnail display */
function injectNoScroll(html: string): string {
  const style = '<style>html,body{overflow:hidden!important;margin:0!important;padding:0!important;}</style>';
  return html.includes('</head>')
    ? html.replace('</head>', `${style}</head>`)
    : style + html;
}

/** Scales a 600px-wide email iframe to fill the card's actual pixel width & height */
function TemplatePreview({ html, name }: { html: string; name: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.5);

  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => {
      const scaleW = el.offsetWidth / EMAIL_W;
      const scaleH = el.offsetHeight / (PREVIEW_H / scaleW * scaleW); // keep aspect
      setScale(Math.min(scaleW, scaleH));
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const iframeHeight = scale > 0 ? Math.round(PREVIEW_H / scale) : 800;

  return (
    <div
      ref={containerRef}
      style={{ height: PREVIEW_H, overflow: 'hidden', background: '#ffffff', position: 'relative' }}
    >
      <iframe
        srcDoc={injectNoScroll(html)}
        style={{
          width: EMAIL_W,
          height: iframeHeight,
          border: 0,
          display: 'block',
          background: '#ffffff',
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
          pointerEvents: 'none',
        }}
        title={`Preview of ${name}`}
        tabIndex={-1}
        scrolling="no"
        sandbox="allow-same-origin"
      />
    </div>
  );
}


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
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handlePreview = (template: EmailTemplate) => {
    setSelectedTemplate(template);
    setShowPreview(true);
  };

  const handleCopyHtml = async (template: EmailTemplate) => {
    try {
      await navigator.clipboard.writeText(template.html);
      setCopiedId(template.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      // fallback for older browsers
      const ta = document.createElement('textarea');
      ta.value = template.html;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopiedId(template.id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-gray-900 mb-2">Email Templates</h1>
          <p className="text-gray-600">Choose from our professional templates or create your own</p>
        </div>
      </div>



      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((template) => (
          <div
            key={template.id}
            className="flex flex-col bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
          >
            {/* Thumbnail / Live Preview */}
            <div className="relative flex-shrink-0" style={{ height: PREVIEW_H }}>
              <TemplatePreview html={template.html} name={template.name} />

              {/* Badges on top of preview */}
              {template.isCustom && (
                <div className="absolute top-2 right-2 bg-purple-600 text-white text-xs px-2 py-1 rounded-full shadow-sm z-10 font-medium">
                  User Template
                </div>
              )}
              {template.visibility === 'public' && (
                <div className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full shadow-sm z-10 font-medium">
                  Public
                </div>
              )}
            </div>

            {/* Divider */}
            <div className="border-t border-gray-100" />

            {/* Content — flex-col + flex-1 so it fills remaining card height */}
            <div className="flex flex-col flex-1 p-4 gap-1">

              {/* Name + Category badge */}
              <div className="flex items-center justify-between gap-2">
                <h3
                  className="text-gray-900 font-semibold text-sm leading-snug line-clamp-1 flex-1"
                  title={template.name}
                >
                  {template.name}
                </h3>
                <span className="shrink-0 text-xs bg-purple-50 text-purple-700 border border-purple-100 px-2 py-0.5 rounded-full capitalize font-medium">
                  {template.category}
                </span>
              </div>

              {/* Subject */}
              <p className="text-xs text-gray-500 line-clamp-1" title={template.subject}>
                <span className="font-semibold text-gray-600">Subject: </span>
                {template.subject}
              </p>

              {/* Description — always reserves 2-line height for alignment */}
              <p
                className="text-xs text-gray-400 line-clamp-2 leading-relaxed"
                style={{ minHeight: '2.5rem' }}
                title={template.description || ''}
              >
                {template.description || ''}
              </p>

              {/* Actions — pushed to bottom */}
              <div className="mt-auto pt-2 flex gap-2">
                <button
                  onClick={() => handlePreview(template)}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-sm border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all"
                >
                  <Eye className="w-4 h-4 text-gray-500" />
                  Preview
                </button>
                <button
                  onClick={() => handleCopyHtml(template)}
                  className={`flex items-center justify-center gap-1.5 px-4 py-2 text-sm rounded-lg transition-all font-medium shadow-sm ${
                    copiedId === template.id
                      ? 'bg-green-100 text-green-900 border border-green-300'
                      : 'bg-purple-600 text-white hover:bg-purple-700'
                  }`}
                >
                  {copiedId === template.id ? (
                    <><Check className="w-4 h-4" />Copied!</>
                  ) : (
                    <><Code2 className="w-4 h-4" />Copy HTML</>
                  )}
                </button>
              </div>
            </div>
          </div>
        ))}


      </div>

      {/* Preview Modal */}
      <TemplatePreviewModal
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        htmlContent={selectedTemplate?.html ?? ''}
        templateName={selectedTemplate?.name}
        templateSubject={selectedTemplate?.subject}
        onUse={selectedTemplate ? () => onEditTemplate(selectedTemplate) : undefined}
      />
    </div>
  );
}
