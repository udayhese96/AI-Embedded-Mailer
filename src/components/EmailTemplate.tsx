import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { WelcomeEmail } from './email-templates/WelcomeEmail';
import { NewsletterEmail } from './email-templates/NewsletterEmail';
import { PromoEmail } from './email-templates/PromoEmail';
import { FollowUpEmail } from './email-templates/FollowUpEmail';

type TemplateType = 'welcome' | 'newsletter' | 'promo' | 'followup';

export function EmailTemplate() {
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateType>('welcome');
  const [copied, setCopied] = useState(false);

  const templates = {
    welcome: { component: WelcomeEmail, name: 'Welcome Email' },
    newsletter: { component: NewsletterEmail, name: 'Newsletter' },
    promo: { component: PromoEmail, name: 'Promotional Email' },
    followup: { component: FollowUpEmail, name: 'Follow-Up Email' },
  };

  const copyHTML = () => {
    const template = templates[selectedTemplate].component({});
    const htmlString = renderToString(template);
    navigator.clipboard.writeText(htmlString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const CurrentTemplate = templates[selectedTemplate].component;

  return (
    <div className="space-y-6">
      {/* Template Selector */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="mb-4">Select Template Type</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {(Object.keys(templates) as TemplateType[]).map((key) => (
            <button
              key={key}
              onClick={() => setSelectedTemplate(key)}
              className={`p-4 rounded-lg border-2 transition-all ${
                selectedTemplate === key
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-200 hover:border-blue-300'
              }`}
            >
              {templates[key].name}
            </button>
          ))}
        </div>
      </div>

      {/* Template Preview */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="bg-gray-800 text-white p-4 flex justify-between items-center">
          <h2 className="text-white">{templates[selectedTemplate].name} Preview</h2>
          <button
            onClick={copyHTML}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {copied ? <Check size={20} /> : <Copy size={20} />}
            {copied ? 'Copied!' : 'Copy HTML'}
          </button>
        </div>
        
        <div className="p-8 bg-gray-50">
          <div className="max-w-2xl mx-auto bg-white shadow-xl">
            <CurrentTemplate />
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6">
        <h3 className="mb-3">📧 How to Use These Templates</h3>
        <ul className="space-y-2 text-sm text-gray-700">
          <li>• <strong>Select a template</strong> from the options above</li>
          <li>• <strong>Customize</strong> the content by editing the template files in /components/email-templates/</li>
          <li>• <strong>Replace placeholder logo</strong> with your WebFudge logo URL</li>
          <li>• <strong>Update colors</strong> to match your brand identity</li>
          <li>• <strong>Copy HTML</strong> and paste into your email marketing platform</li>
          <li>• <strong>Test</strong> in multiple email clients before sending</li>
        </ul>
      </div>
    </div>
  );
}

// Helper function to render React component to string (simplified)
function renderToString(component: any): string {
  // In a real application, you would use ReactDOMServer.renderToStaticMarkup
  // For this demo, we'll return a note about how to get the HTML
  return `<!-- 
    To get the HTML version of this template:
    1. Open browser DevTools (F12)
    2. Inspect the email preview
    3. Right-click on the outer table element
    4. Select "Copy > Copy element"
    5. Paste into your email platform
  -->`;
}
