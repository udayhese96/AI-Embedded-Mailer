import React, { useState, useRef, useEffect } from 'react';
import {
    ResizablePanelGroup,
    ResizablePanel,
    ResizableHandle,
} from './ui/resizable';
import {
    Sparkles,
    Send,
    Loader2,
    ArrowLeft,
    Code,
    Eye,
    Copy,
    Check,
    FolderTree,
    PenTool,
    MessageSquare,
    Bookmark,
    RotateCcw,
    ThumbsUp,
    ThumbsDown,
    MoreHorizontal,
    ChevronRight,
} from 'lucide-react';
import { EmailTemplate } from '../types/template';

interface AIGeneratorV2Props {
    onGenerateTemplate: (template: EmailTemplate) => void;
    onBack: () => void;
}

interface Message {
    role: 'user' | 'assistant';
    content: string;
    timestamp?: Date;
}

interface FileItem {
    name: string;
    type: 'file' | 'folder';
    children?: FileItem[];
    isOpen?: boolean;
}

export function AIGeneratorV2({ onGenerateTemplate, onBack }: AIGeneratorV2Props) {
    const [messages, setMessages] = useState<Message[]>([
        {
            role: 'assistant',
            content: "👋 Ready to create your email template!\n\nJust describe what you need and I'll generate production-ready HTML that works in Gmail, Outlook, and Yahoo.",
            timestamp: new Date(),
        },
    ]);
    const [input, setInput] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [activeTab, setActiveTab] = useState<'preview' | 'code'>('preview');
    const [currentTemplate, setCurrentTemplate] = useState<EmailTemplate | null>(null);
    const [copied, setCopied] = useState(false);
    const [showSidebar, setShowSidebar] = useState(true);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // File structure for sidebar
    const [files] = useState<FileItem[]>([
        {
            name: 'email-templates',
            type: 'folder',
            isOpen: true,
            children: [
                { name: 'promotional.html', type: 'file' },
                { name: 'thank-you.html', type: 'file' },
                { name: 'event-invite.html', type: 'file' },
            ],
        },
        {
            name: 'assets',
            type: 'folder',
            children: [
                { name: 'logo.png', type: 'file' },
                { name: 'banner.jpg', type: 'file' },
            ],
        },
    ]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || isGenerating) return;

        const userMessage = input.trim();
        setInput('');
        setMessages((prev) => [
            ...prev,
            { role: 'user', content: userMessage, timestamp: new Date() },
        ]);
        setIsGenerating(true);

        // Add a "thinking" message
        setMessages((prev) => [
            ...prev,
            { role: 'assistant', content: '🎨 Generating your email template with AI...', timestamp: new Date() },
        ]);

        try {
            // Call the backend API
            const formData = new FormData();
            formData.append('prompt', userMessage);

            // Add uploaded images if any (from files state if we add image upload later)
            // For now, we'll support text-only prompts

            const response = await fetch('http://localhost:8000/generate-email', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Failed to generate email');
            }

            const data = await response.json();

            if (data.success && data.html) {
                // Create template from API response
                const template: EmailTemplate = {
                    id: `ai-${Date.now()}`,
                    name: 'AI Generated Template',
                    category: 'custom',
                    subject: 'Generated Email',
                    html: data.html,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    isCustom: true,
                };

                setCurrentTemplate(template);

                // Remove the "thinking" message and add success message
                setMessages((prev) => {
                    const filteredMessages = prev.filter(m => !m.content.includes('Generating your email template'));
                    return [
                        ...filteredMessages,
                        {
                            role: 'assistant',
                            content: '✅ Done! Your email template is ready. Check the preview on the right →',
                            timestamp: new Date(),
                        },
                    ];
                });

                onGenerateTemplate(template);
            } else {
                throw new Error('Invalid response from AI');
            }
        } catch (error) {
            console.error('AI Generation Error:', error);

            // Remove "thinking" message and show error
            setMessages((prev) => {
                const filteredMessages = prev.filter(m => !m.content.includes('Generating your email template'));
                return [
                    ...filteredMessages,
                    {
                        role: 'assistant',
                        content: `❌ Sorry, I encountered an error: ${error instanceof Error ? error.message : 'Unknown error'}.\n\nPlease make sure:\n• The backend server is running (uvicorn app:app --reload)\n• OPENROUTER_API_KEY is set in your .env file\n• You have a valid OpenRouter account with credits`,
                        timestamp: new Date(),
                    },
                ];
            });
        } finally {
            setIsGenerating(false);
        }
    };

    const generateAIResponse = (userInput: string): string => {
        const lowerInput = userInput.toLowerCase();

        if (
            lowerInput.includes('promotional') ||
            lowerInput.includes('discount') ||
            lowerInput.includes('offer')
        ) {
            return "Great! I'll create a promotional email template for you. This will include:\n\n• Eye-catching header with WebFudge branding\n• Prominent discount/offer section\n• Clear call-to-action button\n• Professional footer\n\nLet me generate that for you now...";
        } else if (
            lowerInput.includes('thank') ||
            lowerInput.includes('appreciation')
        ) {
            return "Perfect! I'll design a thank you email that:\n\n• Shows genuine appreciation\n• Reinforces your brand relationship\n• Includes a subtle call-to-action\n• Maintains WebFudge's professional tone\n\nGenerating your template...";
        } else if (
            lowerInput.includes('event') ||
            lowerInput.includes('invitation') ||
            lowerInput.includes('invite')
        ) {
            return "Excellent choice! I'll create an event invitation email with:\n\n• Compelling event details section\n• Date, time, and location highlights\n• RSVP button\n• WebFudge branding\n\nCreating your template now...";
        } else if (
            lowerInput.includes('launch') ||
            lowerInput.includes('announcement') ||
            lowerInput.includes('new')
        ) {
            return "Awesome! I'll build a product/service launch email featuring:\n\n• Exciting headline\n• Product/service highlights\n• Benefits section\n• Strong call-to-action\n\nGenerating your custom template...";
        } else {
            return "I understand you want to create an email template. Could you provide more details about:\n\n• The purpose of the email (promotional, informational, etc.)\n• Target audience\n• Key message you want to convey\n• Any specific elements you'd like to include\n\nThis will help me create the perfect template for you!";
        }
    };

    const shouldGenerateTemplate = (userInput: string): boolean => {
        const keywords = [
            'promotional',
            'discount',
            'offer',
            'thank',
            'appreciation',
            'event',
            'invitation',
            'launch',
            'announcement',
        ];
        return keywords.some((keyword) => userInput.toLowerCase().includes(keyword));
    };

    const createTemplateFromPrompt = (prompt: string): EmailTemplate => {
        const lowerPrompt = prompt.toLowerCase();

        let templateName = 'AI Generated Template';
        let subject = 'Message from WebFudge';
        let category: EmailTemplate['category'] = 'custom';
        let mainContent = '';

        if (
            lowerPrompt.includes('promotional') ||
            lowerPrompt.includes('discount') ||
            lowerPrompt.includes('offer')
        ) {
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
        } else if (
            lowerPrompt.includes('thank') ||
            lowerPrompt.includes('appreciation')
        ) {
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
        } else if (
            lowerPrompt.includes('event') ||
            lowerPrompt.includes('invitation')
        ) {
            templateName = 'AI Event Invitation';
            subject = "You're Invited - WebFudge Event";
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
            isCustom: true,
        };
    };

    const copyToClipboard = () => {
        if (currentTemplate?.html) {
            navigator.clipboard.writeText(currentTemplate.html);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const suggestions = [
        'Create a modern promotional email for a 30% holiday discount sale',
        'Design a professional thank you email for new customers',
        'Make an elegant event invitation email with RSVP button',
        'Build a product launch announcement email with features list',
    ];

    return (
        <div className="h-[calc(100vh-80px)] flex bg-[#0d0d0f]">
            {/* Left Sidebar - File Tree */}
            {showSidebar && (
                <div className="w-64 bg-[#18181b] border-r border-[#27272a] flex flex-col">
                    {/* Project Header */}
                    <div className="p-4 border-b border-[#27272a]">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                                <Sparkles className="w-4 h-4 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium text-white truncate">email-template-gen</div>
                                <div className="text-xs text-gray-400">Previewing latest version</div>
                            </div>
                        </div>
                    </div>

                    {/* File Tree */}
                    <div className="flex-1 overflow-y-auto p-2 ai-scrollbar-thin">
                        <div className="text-xs font-medium text-gray-500 px-2 py-1 mb-1">FILES</div>
                        {files.map((item, index) => (
                            <FileTreeItem key={index} item={item} depth={0} />
                        ))}
                    </div>

                    {/* Version Info */}
                    <div className="p-3 border-t border-[#27272a]">
                        <div className="flex items-center justify-between text-xs">
                            <span className="text-gray-400">AI Generated Template</span>
                            <ChevronRight className="w-3 h-3 text-gray-500" />
                        </div>
                        <div className="text-xs text-gray-500 mt-1">Previewing latest version</div>
                    </div>
                </div>
            )}

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col">
                {/* Top Header Bar */}
                <div className="h-12 bg-[#18181b] border-b border-[#27272a] flex items-center justify-between px-4">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={onBack}
                            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            <span className="text-sm">Back</span>
                        </button>
                        <div className="h-4 w-px bg-[#27272a]" />
                        <button
                            onClick={() => setShowSidebar(!showSidebar)}
                            className={`p-1.5 rounded hover:bg-[#27272a] transition-colors ${showSidebar ? 'text-white' : 'text-gray-400'
                                }`}
                        >
                            <FolderTree className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Preview/Code Toggle */}
                    <div className="flex items-center gap-1 bg-[#27272a] p-1 rounded-lg">
                        <button
                            onClick={() => setActiveTab('preview')}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-sm font-medium transition-all ${activeTab === 'preview'
                                ? 'bg-white text-black'
                                : 'text-gray-400 hover:text-white'
                                }`}
                        >
                            <Eye className="w-4 h-4" />
                            Preview
                        </button>
                        <button
                            onClick={() => setActiveTab('code')}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-sm font-medium transition-all ${activeTab === 'code'
                                ? 'bg-white text-black'
                                : 'text-gray-400 hover:text-white'
                                }`}
                        >
                            <Code className="w-4 h-4" />
                            Code
                        </button>
                    </div>

                    <div className="flex items-center gap-2">
                        {activeTab === 'code' && currentTemplate && (
                            <button
                                onClick={copyToClipboard}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#27272a] rounded-lg text-sm text-gray-300 hover:text-white transition-colors"
                            >
                                {copied ? (
                                    <>
                                        <Check className="w-4 h-4 text-green-400" />
                                        <span>Copied!</span>
                                    </>
                                ) : (
                                    <>
                                        <Copy className="w-4 h-4" />
                                        <span>Copy</span>
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                </div>

                {/* Resizable Panels */}
                <ResizablePanelGroup direction="horizontal" className="flex-1">
                    {/* Chat Panel */}
                    <ResizablePanel defaultSize={40} minSize={30}>
                        <div className="h-full flex flex-col overflow-hidden" style={{ backgroundColor: '#0d0d0f' }}>
                            {/* Chat Messages */}
                            <div
                                className="flex-1 p-4 space-y-4 ai-scrollbar"
                                style={{
                                    overflowY: 'auto',
                                    overflowX: 'hidden'
                                }}
                            >
                                {messages.map((message, index) => (
                                    <div key={index} className="animate-fadeIn">
                                        {message.role === 'assistant' ? (
                                            <div className="flex gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                                                    <Sparkles className="w-4 h-4 text-white" />
                                                </div>
                                                <div className="flex-1 min-w-0" style={{ maxWidth: '100%', overflow: 'hidden' }}>
                                                    <div
                                                        style={{
                                                            color: '#d1d5db',
                                                            fontSize: '14px',
                                                            lineHeight: '1.6',
                                                            whiteSpace: 'pre-wrap',
                                                            wordWrap: 'break-word',
                                                            wordBreak: 'break-word',
                                                            overflowWrap: 'anywhere',
                                                            maxWidth: '100%',
                                                        }}
                                                    >
                                                        {message.content}
                                                    </div>
                                                    {/* Action buttons for AI messages */}
                                                    <div className="flex items-center gap-2 mt-2">
                                                        <button className="p-1 text-gray-500 hover:text-gray-300 transition-colors">
                                                            <RotateCcw className="w-3.5 h-3.5" />
                                                        </button>
                                                        <button className="p-1 text-gray-500 hover:text-gray-300 transition-colors">
                                                            <ThumbsUp className="w-3.5 h-3.5" />
                                                        </button>
                                                        <button className="p-1 text-gray-500 hover:text-gray-300 transition-colors">
                                                            <ThumbsDown className="w-3.5 h-3.5" />
                                                        </button>
                                                        <button className="p-1 text-gray-500 hover:text-gray-300 transition-colors">
                                                            <Copy className="w-3.5 h-3.5" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex justify-end">
                                                <div
                                                    style={{
                                                        maxWidth: '85%',
                                                        backgroundColor: '#9333ea',
                                                        color: '#ffffff',
                                                        padding: '10px 16px',
                                                        borderRadius: '16px',
                                                        borderBottomRightRadius: '6px',
                                                    }}
                                                >
                                                    <div
                                                        style={{
                                                            fontSize: '14px',
                                                            lineHeight: '1.5',
                                                            whiteSpace: 'pre-wrap',
                                                            wordWrap: 'break-word',
                                                            wordBreak: 'break-word',
                                                            overflowWrap: 'anywhere',
                                                        }}
                                                    >
                                                        {message.content}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                                {isGenerating && (
                                    <div className="flex gap-3 animate-fadeIn">
                                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                                            <Sparkles className="w-4 h-4 text-white" />
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="flex gap-1">
                                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                            </div>
                                            <span className="text-sm text-gray-500">AI is thinking...</span>
                                        </div>
                                    </div>
                                )}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Suggestions */}
                            {messages.length === 1 && (
                                <div className="px-4 pb-2">
                                    <div className="flex flex-wrap gap-2">
                                        {suggestions.map((suggestion, index) => (
                                            <button
                                                key={index}
                                                onClick={() => setInput(suggestion)}
                                                className="px-3 py-1.5 bg-[#27272a] border border-[#3f3f46] rounded-full text-xs text-gray-300 hover:bg-[#3f3f46] hover:text-white transition-colors"
                                            >
                                                {suggestion}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Input Area - with explicit inline styles for dark theme */}
                            <div
                                className="p-4 border-t"
                                style={{
                                    backgroundColor: '#0d0d0f',
                                    borderTopColor: '#27272a'
                                }}
                            >
                                <div
                                    className="flex items-center gap-3 rounded-xl px-4 py-3"
                                    style={{
                                        backgroundColor: '#1f1f23',
                                        border: '1px solid #3f3f46'
                                    }}
                                >
                                    <input
                                        ref={inputRef}
                                        type="text"
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                                        placeholder="Describe your email template..."
                                        className="flex-1 text-sm focus:outline-none border-none"
                                        style={{
                                            backgroundColor: 'transparent',
                                            color: '#ffffff',
                                            caretColor: '#a855f7',
                                            WebkitTextFillColor: '#ffffff',
                                        }}
                                        disabled={isGenerating}
                                    />
                                    <button
                                        onClick={handleSend}
                                        disabled={!input.trim() || isGenerating}
                                        className="p-2.5 rounded-lg flex items-center justify-center"
                                        style={{
                                            backgroundColor: '#9333ea',
                                            color: '#ffffff'
                                        }}
                                    >
                                        {isGenerating ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <Send className="w-4 h-4" />
                                        )}
                                    </button>
                                </div>
                                <div
                                    className="flex items-center justify-between mt-2 px-1"
                                    style={{ color: '#6b7280' }}
                                >
                                    <div className="flex items-center gap-2">
                                        <button className="p-1.5 rounded" style={{ color: '#6b7280' }}>
                                            <PenTool className="w-4 h-4" />
                                        </button>
                                        <button className="p-1.5 rounded" style={{ color: '#6b7280' }}>
                                            <MessageSquare className="w-4 h-4" />
                                        </button>
                                        <button className="p-1.5 rounded" style={{ color: '#6b7280' }}>
                                            <MoreHorizontal className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <span style={{ fontSize: '12px', color: '#6b7280' }}>
                                        Powered by Claude 3.5 Haiku
                                    </span>
                                </div>
                            </div>
                        </div>
                    </ResizablePanel>

                    <ResizableHandle className="w-1 bg-[#27272a] hover:bg-purple-500 transition-colors" />

                    {/* Preview/Code Panel */}
                    <ResizablePanel defaultSize={60} minSize={40}>
                        <div className="h-full bg-[#1a1a1d] overflow-auto ai-scrollbar">
                            {activeTab === 'preview' ? (
                                <div className="h-full flex items-center justify-center p-6">
                                    {currentTemplate ? (
                                        <div className="w-full max-w-2xl bg-white rounded-lg shadow-2xl overflow-hidden">
                                            <iframe
                                                srcDoc={currentTemplate.html}
                                                title="Email Preview"
                                                className="w-full h-[600px] border-0"
                                                sandbox="allow-same-origin"
                                            />
                                        </div>
                                    ) : (
                                        <div className="text-center">
                                            <div className="w-20 h-20 bg-[#27272a] rounded-2xl flex items-center justify-center mx-auto mb-4">
                                                <Eye className="w-10 h-10 text-gray-500" />
                                            </div>
                                            <h3 className="text-lg font-medium text-white mb-2">
                                                Preview Area
                                            </h3>
                                            <p className="text-sm text-gray-400 max-w-sm">
                                                Your generated email will appear here.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="h-full p-4">
                                    {currentTemplate ? (
                                        <pre className="h-full overflow-auto p-4 bg-[#0d0d0f] rounded-lg border border-[#27272a] ai-scrollbar">
                                            <code className="text-sm text-gray-300 font-mono whitespace-pre-wrap">
                                                {currentTemplate.html}
                                            </code>
                                        </pre>
                                    ) : (
                                        <div className="h-full flex items-center justify-center">
                                            <div className="text-center">
                                                <div className="w-20 h-20 bg-[#27272a] rounded-2xl flex items-center justify-center mx-auto mb-4">
                                                    <Code className="w-10 h-10 text-gray-500" />
                                                </div>
                                                <h3 className="text-lg font-medium text-white mb-2">
                                                    HTML Code
                                                </h3>
                                                <p className="text-sm text-gray-400 max-w-sm">
                                                    Generate a template to see the HTML code here.
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </ResizablePanel>
                </ResizablePanelGroup>
            </div>
        </div>
    );
}

// File Tree Item Component
function FileTreeItem({ item, depth }: { item: FileItem; depth: number }) {
    const [isOpen, setIsOpen] = useState(item.isOpen ?? false);

    return (
        <div>
            <button
                onClick={() => item.type === 'folder' && setIsOpen(!isOpen)}
                className={`w-full flex items-center gap-2 px-2 py-1 rounded text-sm hover:bg-[#27272a] transition-colors ${item.type === 'file' ? 'text-gray-400' : 'text-gray-300'
                    }`}
                style={{ paddingLeft: `${depth * 12 + 8}px` }}
            >
                {item.type === 'folder' && (
                    <ChevronRight
                        className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-90' : ''}`}
                    />
                )}
                {item.type === 'folder' ? (
                    <FolderTree className="w-4 h-4 text-purple-400" />
                ) : (
                    <Code className="w-4 h-4 text-gray-500" />
                )}
                <span className="truncate">{item.name}</span>
            </button>
            {item.type === 'folder' && isOpen && item.children && (
                <div>
                    {item.children.map((child, index) => (
                        <FileTreeItem key={index} item={child} depth={depth + 1} />
                    ))}
                </div>
            )}
        </div>
    );
}
