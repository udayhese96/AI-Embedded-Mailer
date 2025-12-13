import React, { useState } from 'react';
import { Sparkles, Send, Loader2, ArrowLeft } from 'lucide-react';
import { EmailTemplate } from '../types/template';

interface AITemplateGeneratorProps {
  onGenerateTemplate: (template: EmailTemplate) => void;
  onBack: () => void;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export function AITemplateGenerator({ onGenerateTemplate, onBack }: AITemplateGeneratorProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Hi! I'm your AI email template assistant. I can help you create professional email templates for WebFudge. Tell me what kind of email you want to create, and I'll design it for you. For example:\n\n• A promotional email for a new service\n• A thank you email for clients\n• An event invitation\n• A product launch announcement\n\nWhat would you like to create?"
    }
  ]);
  const [input, setInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsGenerating(true);

    // Simulate AI processing
    setTimeout(() => {
      const aiResponse = generateAIResponse(userMessage);
      setMessages(prev => [...prev, { role: 'assistant', content: aiResponse }]);
      setIsGenerating(false);

      // Auto-generate template based on user request
      if (shouldGenerateTemplate(userMessage)) {
        setTimeout(() => {
          const template = createTemplateFromPrompt(userMessage);
          setMessages(prev => [...prev, {
            role: 'assistant',
            content: "Perfect! I've created your email template. You can preview it below and customize it further in the editor."
          }]);
          onGenerateTemplate(template);
        }, 1000);
      }
    }, 1500);
  };

  const generateAIResponse = (userInput: string): string => {
    const lowerInput = userInput.toLowerCase();
    
    if (lowerInput.includes('promotional') || lowerInput.includes('discount') || lowerInput.includes('offer')) {
      return "Great! I'll create a promotional email template for you. This will include:\n\n• Eye-catching header with WebFudge branding\n• Prominent discount/offer section\n• Clear call-to-action button\n• Professional footer\n\nLet me generate that for you now...";
    } else if (lowerInput.includes('thank') || lowerInput.includes('appreciation')) {
      return "Perfect! I'll design a thank you email that:\n\n• Shows genuine appreciation\n• Reinforces your brand relationship\n• Includes a subtle call-to-action\n• Maintains WebFudge's professional tone\n\nGenerating your template...";
    } else if (lowerInput.includes('event') || lowerInput.includes('invitation') || lowerInput.includes('invite')) {
      return "Excellent choice! I'll create an event invitation email with:\n\n• Compelling event details section\n• Date, time, and location highlights\n• RSVP button\n• WebFudge branding\n\nCreating your template now...";
    } else if (lowerInput.includes('launch') || lowerInput.includes('announcement') || lowerInput.includes('new')) {
      return "Awesome! I'll build a product/service launch email featuring:\n\n• Exciting headline\n• Product/service highlights\n• Benefits section\n• Strong call-to-action\n\nGenerating your custom template...";
    } else {
      return "I understand you want to create an email template. Could you provide more details about:\n\n• The purpose of the email (promotional, informational, etc.)\n• Target audience\n• Key message you want to convey\n• Any specific elements you'd like to include\n\nThis will help me create the perfect template for you!";
    }
  };

  const shouldGenerateTemplate = (userInput: string): boolean => {
    const keywords = ['promotional', 'discount', 'offer', 'thank', 'appreciation', 'event', 'invitation', 'launch', 'announcement'];
    return keywords.some(keyword => userInput.toLowerCase().includes(keyword));
  };

  const createTemplateFromPrompt = (prompt: string): EmailTemplate => {
    const lowerPrompt = prompt.toLowerCase();
    
    // Base template structure
    let templateName = 'AI Generated Template';
    let subject = 'Message from WebFudge';
    let category: EmailTemplate['category'] = 'custom';
    let mainContent = '';

    if (lowerPrompt.includes('promotional') || lowerPrompt.includes('discount') || lowerPrompt.includes('offer')) {
      templateName = 'AI Promotional Email';
      subject = 'Exclusive Offer from WebFudge';
      category = 'promotional';
      mainContent = `
        <h2 style="color: #333333; margin: 0 0 20px 0; font-size: 28px; text-align: center;">Special Offer Just for You!</h2>
        <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 30px; text-align: center; border-radius: 8px; margin-bottom: 30px;">
          <div style="color: #ffffff; font-size: 48px; font-weight: bold; margin-bottom: 10px;">25% OFF</div>
          <p style="color: #ffffff; margin: 0; font-size: 18px;">Limited Time Offer</p>
        </div>
        <p style="color: #666666; margin: 0 0 20px 0; font-size: 16px; line-height: 1.6;">
          Take advantage of this exclusive discount on all WebFudge services. Whether you need digital marketing, web development, or creative solutions, we're here to help your business grow.
        </p>
      `;
    } else if (lowerPrompt.includes('thank') || lowerPrompt.includes('appreciation')) {
      templateName = 'AI Thank You Email';
      subject = 'Thank You from WebFudge Team';
      category = 'follow-up';
      mainContent = `
        <h2 style="color: #333333; margin: 0 0 20px 0; font-size: 28px; text-align: center;">Thank You!</h2>
        <p style="color: #666666; margin: 0 0 20px 0; font-size: 16px; line-height: 1.6;">
          We wanted to take a moment to express our sincere gratitude for choosing WebFudge. Your trust in our services means the world to us.
        </p>
        <p style="color: #666666; margin: 0 0 20px 0; font-size: 16px; line-height: 1.6;">
          We're committed to delivering exceptional results and helping your business thrive in the digital landscape.
        </p>
      `;
    } else if (lowerPrompt.includes('event') || lowerPrompt.includes('invitation')) {
      templateName = 'AI Event Invitation';
      subject = 'You\'re Invited - WebFudge Event';
      category = 'promotional';
      mainContent = `
        <h2 style="color: #333333; margin: 0 0 20px 0; font-size: 28px; text-align: center;">You're Invited!</h2>
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 8px; margin-bottom: 30px; color: white;">
          <div style="font-size: 24px; font-weight: bold; margin-bottom: 15px;">WebFudge Digital Marketing Summit</div>
          <div style="font-size: 16px; opacity: 0.9;">📅 December 15, 2025 | ⏰ 10:00 AM - 4:00 PM</div>
        </div>
        <p style="color: #666666; margin: 0 0 20px 0; font-size: 16px; line-height: 1.6;">
          Join us for an exclusive event where we'll share the latest digital marketing trends, success strategies, and networking opportunities.
        </p>
      `;
    } else {
      mainContent = `
        <h2 style="color: #333333; margin: 0 0 20px 0; font-size: 24px;">Hello!</h2>
        <p style="color: #666666; margin: 0 0 20px 0; font-size: 16px; line-height: 1.6;">
          Thank you for your interest in WebFudge. We're excited to connect with you and explore how we can help your business achieve its digital marketing goals.
        </p>
      `;
    }

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${templateName}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #f5f5f5; padding: 40px 0;">
        <tbody>
            <tr>
                <td align="center">
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                        <tbody>
                            <tr>
                                <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; text-align: center; border-radius: 8px 8px 0 0;">
                                    <h1 style="color: #ffffff; margin: 0; font-size: 32px;">WebFudge</h1>
                                    <p style="color: #ffffff; margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Marketing Excellence</p>
                                </td>
                            </tr>
                            <tr>
                                <td style="padding: 40px;">
                                    ${mainContent}
                                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                                        <tbody>
                                            <tr>
                                                <td align="center" style="padding: 20px 0;">
                                                    <a href="https://www.webfudge.in/" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 6px; font-size: 16px; font-weight: 600;">Learn More</a>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </td>
                            </tr>
                            <tr>
                                <td style="background-color: #f8f9fa; padding: 30px; text-align: center; border-radius: 0 0 8px 8px; border-top: 1px solid #e9ecef;">
                                    <p style="color: #999999; margin: 0 0 10px 0; font-size: 14px;">
                                        © 2025 WebFudge. All rights reserved.
                                    </p>
                                    <p style="color: #999999; margin: 0; font-size: 14px;">
                                        <a href="https://www.webfudge.in/" style="color: #667eea; text-decoration: none;">Visit our website</a>
                                    </p>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </td>
            </tr>
        </tbody>
    </table>
</body>
</html>`;

    return {
      id: `ai-${Date.now()}`,
      name: templateName,
      category,
      subject,
      html,
      createdAt: new Date(),
      updatedAt: new Date(),
      isCustom: true
    };
  };

  return (
    <div className="space-y-6">
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
            <div className="flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-purple-600" />
              <h1 className="text-gray-900">AI Template Generator</h1>
            </div>
            <p className="text-sm text-gray-500">Describe your email and let AI create it for you</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col h-[calc(100vh-240px)]">
        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-4 ${
                  message.role === 'user'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                {message.role === 'assistant' && (
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-4 h-4 text-purple-600" />
                    <span className="text-sm text-purple-600">AI Assistant</span>
                  </div>
                )}
                <div className="whitespace-pre-wrap">{message.content}</div>
              </div>
            </div>
          ))}
          {isGenerating && (
            <div className="flex justify-start">
              <div className="bg-gray-100 text-gray-900 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-purple-600" />
                  <span className="text-sm text-gray-600">AI is thinking...</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="border-t border-gray-200 p-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Describe the email you want to create..."
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              disabled={isGenerating}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isGenerating}
              className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Send className="w-5 h-5" />
              Send
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            💡 Try: "Create a promotional email for 30% off", "Make a thank you email", or "Design an event invitation"
          </p>
        </div>
      </div>
    </div>
  );
}
