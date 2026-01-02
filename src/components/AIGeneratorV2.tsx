import React, { useState, useRef, useEffect } from 'react';
import {
    Sparkles,
    Send,
    Loader2,
    ArrowLeft,
    Code,
    Eye,
    Copy,
    Check,
    RotateCcw,
    ThumbsUp,
    ThumbsDown,
    FileCode,
    Plus,
    X,
    Mail,
    User,
} from 'lucide-react';
import { EmailTemplate, GmailConnection } from '../types/template';

interface AIGeneratorV2Props {
    onGenerateTemplate: (template: EmailTemplate) => void;
    onBack: () => void;
    gmailConnection: GmailConnection;
}

interface Message {
    role: 'user' | 'assistant';
    content: string;
    timestamp?: Date;
}

interface FileTab {
    id: string;
    name: string;
    content: string;
    isActive: boolean;
}

export function AIGeneratorV2({ onGenerateTemplate, onBack, gmailConnection }: AIGeneratorV2Props) {
    const [messages, setMessages] = useState<Message[]>([
        {
            role: 'assistant',
            content: "👋 Hi! I'm your email template assistant.\n\nDescribe the email you want to create and I'll generate production-ready HTML that works perfectly in Gmail, Outlook, and Yahoo.",
            timestamp: new Date(),
        },
    ]);
    const [input, setInput] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [activeTab, setActiveTab] = useState<'preview' | 'code' | 'send'>('preview');
    const [toRecipients, setToRecipients] = useState<string[]>([]);
    const [ccRecipients, setCcRecipients] = useState<string[]>([]);
    const [bccRecipients, setBccRecipients] = useState<string[]>([]);
    const [toInput, setToInput] = useState('');
    const [ccInput, setCcInput] = useState('');
    const [bccInput, setBccInput] = useState('');
    const [subject, setSubject] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [currentTemplate, setCurrentTemplate] = useState<EmailTemplate | null>(null);
    const [copied, setCopied] = useState(false);
    const [fileTabs, setFileTabs] = useState<FileTab[]>([]);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Update file tabs when template is generated
    useEffect(() => {
        if (currentTemplate) {
            setFileTabs([
                {
                    id: 'template',
                    name: 'template.html',
                    content: currentTemplate.html,
                    isActive: true,
                },
            ]);
        }
    }, [currentTemplate]);

    const handleSend = async () => {
        if (!input.trim() || isGenerating) return;

        const userMessage = input.trim();
        setInput('');
        setMessages((prev) => [
            ...prev,
            { role: 'user', content: userMessage, timestamp: new Date() },
        ]);
        setIsGenerating(true);

        try {
            const formData = new FormData();
            formData.append('prompt', userMessage);

            const response = await fetch('http://127.0.0.1:8000/generate-email', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Failed to generate email');
            }

            const data = await response.json();

            if (data.success && data.html) {
                const newTemplate: EmailTemplate = {
                    id: `ai-${Date.now()}`,
                    name: `AI Generated - ${new Date().toLocaleDateString()}`,
                    subject: userMessage.slice(0, 100),
                    category: 'custom',
                    html: data.html,
                    isCustom: true,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                };

                setCurrentTemplate(newTemplate);
                onGenerateTemplate(newTemplate);

                setMessages((prev) => [
                    ...prev,
                    {
                        role: 'assistant',
                        content: "✨ Done! Your email template is ready.\n\nCheck the preview on the right, or switch to Code view to see the HTML.",
                        timestamp: new Date(),
                    },
                ]);
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            setMessages((prev) => [
                ...prev,
                {
                    role: 'assistant',
                    content: `❌ Oops! Something went wrong: ${errorMessage}\n\nPlease try again or check if the backend server is running.`,
                    timestamp: new Date(),
                },
            ]);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleCopyCode = async () => {
        if (!currentTemplate) return;
        await navigator.clipboard.writeText(currentTemplate.html);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const suggestions = [
        'Modern promo email with 30% off',
        'Welcome email for new users',
        'Event invitation with RSVP',
        'Product launch announcement',
    ];

    return (
        <div style={{
            height: 'calc(100vh - 100px)',
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: '#09090b',
            borderRadius: '12px',
            overflow: 'hidden',
            border: '1px solid #27272a',
        }}>
            {/* Top Header */}
            <div style={{
                height: '48px',
                backgroundColor: '#18181b',
                borderBottom: '1px solid #27272a',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 16px',
                flexShrink: 0,
            }}>
                <button
                    onClick={onBack}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        color: '#a1a1aa',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '14px',
                    }}
                >
                    <ArrowLeft style={{ width: '16px', height: '16px' }} />
                    Back
                </button>

                {/* Preview/Code Toggle */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    backgroundColor: '#27272a',
                    padding: '4px',
                    borderRadius: '8px',
                }}>
                    <button
                        onClick={() => setActiveTab('preview')}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '6px 12px',
                            borderRadius: '6px',
                            fontSize: '13px',
                            fontWeight: 500,
                            border: 'none',
                            cursor: 'pointer',
                            backgroundColor: activeTab === 'preview' ? '#ffffff' : 'transparent',
                            color: activeTab === 'preview' ? '#000000' : '#a1a1aa',
                            transition: 'all 0.2s',
                        }}
                    >
                        <Eye style={{ width: '14px', height: '14px' }} />
                        Preview
                    </button>
                    <button
                        onClick={() => setActiveTab('code')}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '6px 12px',
                            borderRadius: '6px',
                            fontSize: '13px',
                            fontWeight: 500,
                            border: 'none',
                            cursor: 'pointer',
                            backgroundColor: activeTab === 'code' ? '#ffffff' : 'transparent',
                            color: activeTab === 'code' ? '#000000' : '#a1a1aa',
                            transition: 'all 0.2s',
                        }}
                    >
                        <Code style={{ width: '14px', height: '14px' }} />
                        Code
                    </button>
                    <button
                        onClick={() => setActiveTab('send')}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '6px 12px',
                            borderRadius: '6px',
                            fontSize: '13px',
                            fontWeight: 500,
                            border: 'none',
                            cursor: currentTemplate ? 'pointer' : 'not-allowed',
                            backgroundColor: activeTab === 'send' ? '#7c3aed' : 'transparent',
                            color: activeTab === 'send' ? '#ffffff' : currentTemplate ? '#a1a1aa' : '#52525b',
                            transition: 'all 0.2s',
                            opacity: currentTemplate ? 1 : 0.5,
                        }}
                        disabled={!currentTemplate}
                    >
                        <Mail style={{ width: '14px', height: '14px' }} />
                        Send
                    </button>
                </div>
            </div>

            {/* Main Content - Two Panel Layout */}
            <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
                {/* Left Panel - Chat */}
                <div style={{
                    width: '45%',
                    minWidth: '380px',
                    display: 'flex',
                    flexDirection: 'column',
                    borderRight: '1px solid #27272a',
                    backgroundColor: '#0a0a0b',
                }}>
                    {/* Messages Area */}
                    <div style={{
                        flex: 1,
                        overflowY: 'auto',
                        padding: '20px',
                    }}>
                        {messages.map((message, index) => (
                            <div key={index} style={{ marginBottom: '20px' }}>
                                {message.role === 'assistant' ? (
                                    <div style={{ display: 'flex', gap: '12px' }}>
                                        <div style={{
                                            width: '32px',
                                            height: '32px',
                                            borderRadius: '8px',
                                            background: 'linear-gradient(135deg, #a855f7, #ec4899)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            flexShrink: 0,
                                        }}>
                                            <Sparkles style={{ width: '16px', height: '16px', color: '#fff' }} />
                                        </div>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{
                                                color: '#e4e4e7',
                                                fontSize: '14px',
                                                lineHeight: '1.6',
                                                whiteSpace: 'pre-wrap',
                                                wordBreak: 'break-word',
                                            }}>
                                                {message.content}
                                            </div>
                                            <div style={{ display: 'flex', gap: '4px', marginTop: '8px' }}>
                                                {[RotateCcw, ThumbsUp, ThumbsDown, Copy].map((Icon, i) => (
                                                    <button key={i} style={{
                                                        padding: '4px',
                                                        background: 'none',
                                                        border: 'none',
                                                        color: '#52525b',
                                                        cursor: 'pointer',
                                                    }}>
                                                        <Icon style={{ width: '14px', height: '14px' }} />
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                        <div style={{
                                            maxWidth: '80%',
                                            backgroundColor: '#7c3aed',
                                            color: '#ffffff',
                                            padding: '12px 16px',
                                            borderRadius: '16px',
                                            borderBottomRightRadius: '4px',
                                            fontSize: '14px',
                                            lineHeight: '1.5',
                                            whiteSpace: 'pre-wrap',
                                            wordBreak: 'break-word',
                                        }}>
                                            {message.content}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}

                        {/* Loading indicator */}
                        {isGenerating && (
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <div style={{
                                    width: '32px',
                                    height: '32px',
                                    borderRadius: '8px',
                                    background: 'linear-gradient(135deg, #a855f7, #ec4899)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0,
                                }}>
                                    <Sparkles style={{ width: '16px', height: '16px', color: '#fff' }} />
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <div style={{ display: 'flex', gap: '4px' }}>
                                        {[0, 1, 2].map((i) => (
                                            <div key={i} style={{
                                                width: '8px',
                                                height: '8px',
                                                borderRadius: '50%',
                                                backgroundColor: '#a855f7',
                                                animation: `pulse 1.4s ease-in-out ${i * 0.2}s infinite`,
                                            }} />
                                        ))}
                                    </div>
                                    <span style={{ color: '#71717a', fontSize: '13px' }}>Generating...</span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Suggestions */}
                    {messages.length <= 1 && !isGenerating && (
                        <div style={{
                            padding: '12px 20px',
                            borderTop: '1px solid #27272a',
                        }}>
                            <div style={{
                                display: 'flex',
                                gap: '8px',
                                flexWrap: 'wrap',
                            }}>
                                {suggestions.map((suggestion, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setInput(suggestion)}
                                        style={{
                                            padding: '8px 14px',
                                            backgroundColor: '#27272a',
                                            border: '1px solid #3f3f46',
                                            borderRadius: '20px',
                                            color: '#a1a1aa',
                                            fontSize: '13px',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s',
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.backgroundColor = '#3f3f46';
                                            e.currentTarget.style.color = '#ffffff';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.backgroundColor = '#27272a';
                                            e.currentTarget.style.color = '#a1a1aa';
                                        }}
                                    >
                                        {suggestion}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Input Area */}
                    <div style={{
                        padding: '16px 20px',
                        borderTop: '1px solid #27272a',
                        backgroundColor: '#0a0a0b',
                    }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'flex-end',
                            gap: '12px',
                            backgroundColor: '#18181b',
                            border: '1px solid #3f3f46',
                            borderRadius: '12px',
                            padding: '12px 16px',
                        }}>
                            <textarea
                                ref={inputRef}
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Describe your email template..."
                                rows={1}
                                style={{
                                    flex: 1,
                                    backgroundColor: 'transparent',
                                    border: 'none',
                                    outline: 'none',
                                    color: '#ffffff',
                                    fontSize: '14px',
                                    lineHeight: '1.5',
                                    resize: 'none',
                                    maxHeight: '120px',
                                }}
                                disabled={isGenerating}
                            />
                            <button
                                onClick={handleSend}
                                disabled={!input.trim() || isGenerating}
                                style={{
                                    width: '36px',
                                    height: '36px',
                                    borderRadius: '8px',
                                    backgroundColor: input.trim() ? '#7c3aed' : '#3f3f46',
                                    border: 'none',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: input.trim() ? 'pointer' : 'not-allowed',
                                    transition: 'background-color 0.2s',
                                }}
                            >
                                {isGenerating ? (
                                    <Loader2 style={{ width: '16px', height: '16px', color: '#fff', animation: 'spin 1s linear infinite' }} />
                                ) : (
                                    <Send style={{ width: '16px', height: '16px', color: '#fff' }} />
                                )}
                            </button>
                        </div>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'center',
                            marginTop: '8px',
                        }}>
                            <span style={{ fontSize: '11px', color: '#52525b' }}>
                                Powered by Claude 3.5 Haiku
                            </span>
                        </div>
                    </div>
                </div>

                {/* Right Panel - Preview/Code */}
                <div style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    backgroundColor: '#0f0f11',
                    overflow: 'hidden',
                }}>
                    {activeTab === 'code' && fileTabs.length > 0 && (
                        /* File Tabs */
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '2px',
                            padding: '8px 12px',
                            borderBottom: '1px solid #27272a',
                            backgroundColor: '#18181b',
                        }}>
                            {fileTabs.map((tab) => (
                                <div
                                    key={tab.id}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                        padding: '6px 12px',
                                        backgroundColor: tab.isActive ? '#27272a' : 'transparent',
                                        borderRadius: '6px',
                                        cursor: 'pointer',
                                    }}
                                >
                                    <FileCode style={{ width: '14px', height: '14px', color: '#f97316' }} />
                                    <span style={{ fontSize: '13px', color: '#e4e4e7' }}>{tab.name}</span>
                                    <X style={{ width: '12px', height: '12px', color: '#71717a', cursor: 'pointer' }} />
                                </div>
                            ))}
                            <button style={{
                                padding: '6px',
                                background: 'none',
                                border: 'none',
                                color: '#71717a',
                                cursor: 'pointer',
                            }}>
                                <Plus style={{ width: '14px', height: '14px' }} />
                            </button>
                        </div>
                    )}

                    {/* Content Area */}
                    <div style={{ flex: 1, overflow: 'auto', padding: activeTab === 'preview' ? '24px' : activeTab === 'send' ? '24px' : '0' }}>
                        {activeTab === 'preview' ? (
                            currentTemplate ? (
                                <div style={{
                                    maxWidth: '650px',
                                    margin: '0 auto',
                                    backgroundColor: '#ffffff',
                                    borderRadius: '8px',
                                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                                    overflow: 'hidden',
                                }}>
                                    <iframe
                                        srcDoc={currentTemplate.html}
                                        title="Email Preview"
                                        style={{
                                            width: '100%',
                                            height: '600px',
                                            border: 'none',
                                        }}
                                        sandbox="allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-top-navigation-by-user-activation"
                                    />
                                </div>
                            ) : (
                                <div style={{
                                    height: '100%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: '#71717a',
                                }}>
                                    <div style={{
                                        width: '64px',
                                        height: '64px',
                                        backgroundColor: '#27272a',
                                        borderRadius: '16px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        marginBottom: '16px',
                                    }}>
                                        <Eye style={{ width: '32px', height: '32px', color: '#52525b' }} />
                                    </div>
                                    <h3 style={{ fontSize: '16px', fontWeight: 500, color: '#e4e4e7', marginBottom: '8px' }}>
                                        Email Preview
                                    </h3>
                                    <p style={{ fontSize: '14px', color: '#71717a' }}>
                                        Your generated email will appear here
                                    </p>
                                </div>
                            )
                        ) : activeTab === 'code' ? (
                            /* Code View */
                            currentTemplate ? (
                                <div style={{ height: '100%', position: 'relative' }}>
                                    {/* Copy Button */}
                                    <button
                                        onClick={handleCopyCode}
                                        style={{
                                            position: 'absolute',
                                            top: '12px',
                                            right: '12px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '6px',
                                            padding: '8px 12px',
                                            backgroundColor: '#27272a',
                                            border: '1px solid #3f3f46',
                                            borderRadius: '6px',
                                            color: '#a1a1aa',
                                            fontSize: '12px',
                                            cursor: 'pointer',
                                            zIndex: 10,
                                        }}
                                    >
                                        {copied ? <Check style={{ width: '14px', height: '14px' }} /> : <Copy style={{ width: '14px', height: '14px' }} />}
                                        {copied ? 'Copied!' : 'Copy'}
                                    </button>
                                    <pre style={{
                                        height: '100%',
                                        margin: 0,
                                        padding: '16px',
                                        backgroundColor: '#0a0a0b',
                                        overflow: 'auto',
                                        fontSize: '13px',
                                        lineHeight: '1.6',
                                    }}>
                                        <code style={{
                                            color: '#a1a1aa',
                                            fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                                            whiteSpace: 'pre-wrap',
                                            wordBreak: 'break-word',
                                        }}>
                                            {currentTemplate.html}
                                        </code>
                                    </pre>
                                </div>
                            ) : (
                                <div style={{
                                    height: '100%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: '#71717a',
                                }}>
                                    <div style={{
                                        width: '64px',
                                        height: '64px',
                                        backgroundColor: '#27272a',
                                        borderRadius: '16px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        marginBottom: '16px',
                                    }}>
                                        <Code style={{ width: '32px', height: '32px', color: '#52525b' }} />
                                    </div>
                                    <h3 style={{ fontSize: '16px', fontWeight: 500, color: '#e4e4e7', marginBottom: '8px' }}>
                                        HTML Code
                                    </h3>
                                    <p style={{ fontSize: '14px', color: '#71717a' }}>
                                        Generate a template to see the code
                                    </p>
                                </div>
                            )
                        ) : (
                            /* Send Email View */
                            <div style={{ maxWidth: '600px', margin: '0 auto' }}>
                                <div style={{
                                    backgroundColor: '#18181b',
                                    borderRadius: '12px',
                                    border: '1px solid #27272a',
                                    overflow: 'hidden',
                                }}>
                                    {/* Header */}
                                    <div style={{
                                        padding: '16px 20px',
                                        borderBottom: '1px solid #27272a',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '12px',
                                    }}>
                                        <div style={{
                                            width: '40px',
                                            height: '40px',
                                            background: 'linear-gradient(135deg, #7c3aed, #ec4899)',
                                            borderRadius: '10px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                        }}>
                                            <Mail style={{ width: '20px', height: '20px', color: '#fff' }} />
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#ffffff', margin: 0 }}>
                                                Send Email
                                            </h3>
                                            <p style={{ fontSize: '13px', color: '#71717a', margin: 0 }}>
                                                {gmailConnection.isConnected
                                                    ? `Sending as ${gmailConnection.email}`
                                                    : 'Gmail not connected'}
                                            </p>
                                        </div>
                                        {/* Connection Status */}
                                        <div style={{
                                            padding: '4px 10px',
                                            borderRadius: '20px',
                                            fontSize: '12px',
                                            backgroundColor: gmailConnection.isConnected ? '#052e16' : '#450a0a',
                                            color: gmailConnection.isConnected ? '#22c55e' : '#ef4444',
                                            border: `1px solid ${gmailConnection.isConnected ? '#166534' : '#991b1b'}`,
                                        }}>
                                            {gmailConnection.isConnected ? '● Connected' : '○ Not Connected'}
                                        </div>
                                    </div>

                                    {/* Form Fields */}
                                    <div style={{ padding: '20px' }}>
                                        {/* To Field with chips */}
                                        <div style={{ marginBottom: '16px' }}>
                                            <label style={{ display: 'block', fontSize: '13px', color: '#a1a1aa', marginBottom: '6px' }}>
                                                To *
                                            </label>
                                            {/* Email Chips */}
                                            {toRecipients.length > 0 && (
                                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '8px' }}>
                                                    {toRecipients.map((email, index) => (
                                                        <div key={index} style={{
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '6px',
                                                            backgroundColor: '#7c3aed',
                                                            color: '#fff',
                                                            padding: '4px 10px',
                                                            borderRadius: '20px',
                                                            fontSize: '13px',
                                                        }}>
                                                            {email}
                                                            <X
                                                                style={{ width: '14px', height: '14px', cursor: 'pointer' }}
                                                                onClick={() => setToRecipients(toRecipients.filter((_, i) => i !== index))}
                                                            />
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                <input
                                                    type="email"
                                                    value={toInput}
                                                    onChange={(e) => setToInput(e.target.value)}
                                                    onKeyPress={(e) => {
                                                        if (e.key === 'Enter' && toInput.includes('@')) {
                                                            setToRecipients([...toRecipients, toInput]);
                                                            setToInput('');
                                                        }
                                                    }}
                                                    placeholder="recipient@example.com"
                                                    style={{
                                                        flex: 1,
                                                        padding: '10px 12px',
                                                        backgroundColor: '#0a0a0b',
                                                        border: '1px solid #27272a',
                                                        borderRadius: '8px',
                                                        color: '#ffffff',
                                                        fontSize: '14px',
                                                        outline: 'none',
                                                    }}
                                                />
                                                <button
                                                    onClick={() => {
                                                        if (toInput.includes('@')) {
                                                            setToRecipients([...toRecipients, toInput]);
                                                            setToInput('');
                                                        }
                                                    }}
                                                    style={{
                                                        padding: '10px 14px',
                                                        backgroundColor: '#7c3aed',
                                                        border: 'none',
                                                        borderRadius: '8px',
                                                        color: '#fff',
                                                        cursor: 'pointer',
                                                    }}
                                                >
                                                    <Plus style={{ width: '16px', height: '16px' }} />
                                                </button>
                                            </div>
                                        </div>

                                        {/* CC Field with chips */}
                                        <div style={{ marginBottom: '16px' }}>
                                            <label style={{ display: 'block', fontSize: '13px', color: '#a1a1aa', marginBottom: '6px' }}>
                                                CC (optional)
                                            </label>
                                            {ccRecipients.length > 0 && (
                                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '8px' }}>
                                                    {ccRecipients.map((email, index) => (
                                                        <div key={index} style={{
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '6px',
                                                            backgroundColor: '#3f3f46',
                                                            color: '#fff',
                                                            padding: '4px 10px',
                                                            borderRadius: '20px',
                                                            fontSize: '13px',
                                                        }}>
                                                            {email}
                                                            <X
                                                                style={{ width: '14px', height: '14px', cursor: 'pointer' }}
                                                                onClick={() => setCcRecipients(ccRecipients.filter((_, i) => i !== index))}
                                                            />
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                <input
                                                    type="email"
                                                    value={ccInput}
                                                    onChange={(e) => setCcInput(e.target.value)}
                                                    onKeyPress={(e) => {
                                                        if (e.key === 'Enter' && ccInput.includes('@')) {
                                                            setCcRecipients([...ccRecipients, ccInput]);
                                                            setCcInput('');
                                                        }
                                                    }}
                                                    placeholder="cc@example.com"
                                                    style={{
                                                        flex: 1,
                                                        padding: '10px 12px',
                                                        backgroundColor: '#0a0a0b',
                                                        border: '1px solid #27272a',
                                                        borderRadius: '8px',
                                                        color: '#ffffff',
                                                        fontSize: '14px',
                                                        outline: 'none',
                                                    }}
                                                />
                                                <button
                                                    onClick={() => {
                                                        if (ccInput.includes('@')) {
                                                            setCcRecipients([...ccRecipients, ccInput]);
                                                            setCcInput('');
                                                        }
                                                    }}
                                                    style={{
                                                        padding: '10px 14px',
                                                        backgroundColor: '#3f3f46',
                                                        border: 'none',
                                                        borderRadius: '8px',
                                                        color: '#fff',
                                                        cursor: 'pointer',
                                                    }}
                                                >
                                                    <Plus style={{ width: '16px', height: '16px' }} />
                                                </button>
                                            </div>
                                        </div>

                                        {/* BCC Field with chips */}
                                        <div style={{ marginBottom: '16px' }}>
                                            <label style={{ display: 'block', fontSize: '13px', color: '#a1a1aa', marginBottom: '6px' }}>
                                                BCC (optional)
                                            </label>
                                            {bccRecipients.length > 0 && (
                                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '8px' }}>
                                                    {bccRecipients.map((email, index) => (
                                                        <div key={index} style={{
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '6px',
                                                            backgroundColor: '#3f3f46',
                                                            color: '#fff',
                                                            padding: '4px 10px',
                                                            borderRadius: '20px',
                                                            fontSize: '13px',
                                                        }}>
                                                            {email}
                                                            <X
                                                                style={{ width: '14px', height: '14px', cursor: 'pointer' }}
                                                                onClick={() => setBccRecipients(bccRecipients.filter((_, i) => i !== index))}
                                                            />
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                <input
                                                    type="email"
                                                    value={bccInput}
                                                    onChange={(e) => setBccInput(e.target.value)}
                                                    onKeyPress={(e) => {
                                                        if (e.key === 'Enter' && bccInput.includes('@')) {
                                                            setBccRecipients([...bccRecipients, bccInput]);
                                                            setBccInput('');
                                                        }
                                                    }}
                                                    placeholder="bcc@example.com"
                                                    style={{
                                                        flex: 1,
                                                        padding: '10px 12px',
                                                        backgroundColor: '#0a0a0b',
                                                        border: '1px solid #27272a',
                                                        borderRadius: '8px',
                                                        color: '#ffffff',
                                                        fontSize: '14px',
                                                        outline: 'none',
                                                    }}
                                                />
                                                <button
                                                    onClick={() => {
                                                        if (bccInput.includes('@')) {
                                                            setBccRecipients([...bccRecipients, bccInput]);
                                                            setBccInput('');
                                                        }
                                                    }}
                                                    style={{
                                                        padding: '10px 14px',
                                                        backgroundColor: '#3f3f46',
                                                        border: 'none',
                                                        borderRadius: '8px',
                                                        color: '#fff',
                                                        cursor: 'pointer',
                                                    }}
                                                >
                                                    <Plus style={{ width: '16px', height: '16px' }} />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Subject Field */}
                                        <div style={{ marginBottom: '20px' }}>
                                            <label style={{ display: 'block', fontSize: '13px', color: '#a1a1aa', marginBottom: '6px' }}>
                                                Subject *
                                            </label>
                                            <input
                                                type="text"
                                                value={subject}
                                                onChange={(e) => setSubject(e.target.value)}
                                                placeholder="Email subject line"
                                                style={{
                                                    width: '100%',
                                                    padding: '10px 12px',
                                                    backgroundColor: '#0a0a0b',
                                                    border: '1px solid #27272a',
                                                    borderRadius: '8px',
                                                    color: '#ffffff',
                                                    fontSize: '14px',
                                                    outline: 'none',
                                                    boxSizing: 'border-box',
                                                }}
                                            />
                                        </div>

                                        {/* Email Content Preview */}
                                        <div style={{ marginBottom: '20px' }}>
                                            <label style={{ display: 'block', fontSize: '13px', color: '#a1a1aa', marginBottom: '6px' }}>
                                                Email Content
                                            </label>
                                            <div style={{
                                                padding: '12px',
                                                backgroundColor: '#0a0a0b',
                                                border: '1px solid #27272a',
                                                borderRadius: '8px',
                                                height: '120px',
                                                overflow: 'hidden',
                                            }}>
                                                <div style={{
                                                    backgroundColor: '#ffffff',
                                                    borderRadius: '4px',
                                                    height: '100%',
                                                    overflow: 'hidden',
                                                }}>
                                                    <iframe
                                                        srcDoc={currentTemplate?.html || ''}
                                                        title="Email Preview"
                                                        style={{
                                                            border: 'none',
                                                            transform: 'scale(0.5)',
                                                            transformOrigin: 'top left',
                                                            width: '200%',
                                                            height: '200%',
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Send Button */}
                                        <button
                                            onClick={async () => {
                                                if (toRecipients.length === 0 || !subject || !currentTemplate) {
                                                    alert('Please add at least one recipient and subject');
                                                    return;
                                                }

                                                if (!gmailConnection.isConnected || !gmailConnection.accessToken) {
                                                    alert('Please connect your Gmail account first in Settings');
                                                    return;
                                                }

                                                setIsSending(true);
                                                try {
                                                    const formData = new FormData();
                                                    formData.append('session_id', gmailConnection.accessToken);
                                                    formData.append('to', toRecipients.join(', '));
                                                    formData.append('subject', subject);
                                                    formData.append('html_body', currentTemplate.html);
                                                    if (ccRecipients.length > 0) {
                                                        formData.append('cc', ccRecipients.join(', '));
                                                    }

                                                    const response = await fetch('http://127.0.0.1:8000/send-email', {
                                                        method: 'POST',
                                                        body: formData,
                                                    });

                                                    if (response.ok) {
                                                        alert('Email sent successfully!');
                                                        setToRecipients([]);
                                                        setCcRecipients([]);
                                                        setBccRecipients([]);
                                                        setSubject('');
                                                    } else {
                                                        const data = await response.json();
                                                        alert(`Failed to send: ${data.detail || 'Unknown error'}`);
                                                    }
                                                } catch (error) {
                                                    alert(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
                                                } finally {
                                                    setIsSending(false);
                                                }
                                            }}
                                            disabled={isSending || toRecipients.length === 0 || !subject || !gmailConnection.isConnected}
                                            style={{
                                                width: '100%',
                                                padding: '12px',
                                                background: toRecipients.length > 0 && subject && gmailConnection.isConnected
                                                    ? 'linear-gradient(135deg, #7c3aed, #9333ea)'
                                                    : '#3f3f46',
                                                border: 'none',
                                                borderRadius: '8px',
                                                color: '#ffffff',
                                                fontSize: '14px',
                                                fontWeight: 500,
                                                cursor: toRecipients.length > 0 && subject && gmailConnection.isConnected ? 'pointer' : 'not-allowed',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: '8px',
                                            }}
                                        >
                                            {isSending ? (
                                                <>
                                                    <Loader2 style={{ width: '16px', height: '16px', animation: 'spin 1s linear infinite' }} />
                                                    Sending...
                                                </>
                                            ) : (
                                                <>
                                                    <Send style={{ width: '16px', height: '16px' }} />
                                                    Send Email
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* CSS for animations */}
            <style>{`
                @keyframes pulse {
                    0%, 80%, 100% { opacity: 0.3; transform: scale(0.8); }
                    40% { opacity: 1; transform: scale(1); }
                }
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
}
