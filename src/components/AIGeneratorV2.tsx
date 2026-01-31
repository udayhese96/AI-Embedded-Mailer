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
    Image,
    Upload,
    Trash2,
    ChevronDown,
    ChevronUp,
    Link,
    RefreshCw,
    History,
    Paperclip,
} from 'lucide-react';
import { EmailTemplate, GmailConnection, Message, ChatSession, TemplateCheckpoint } from '../types/template';
import { saveChatSession, loadChatSession, clearChatSession, saveCheckpoint } from '../utils/chatStorage';
import { API_URL } from '../config/api';

interface AIGeneratorV2Props {
    onGenerateTemplate: (template: EmailTemplate) => void;
    onBack: () => void;
    gmailConnection: GmailConnection;
}



interface FileTab {
    id: string;
    name: string;
    content: string;
    isActive: boolean;
}

interface UploadedImage {
    name: string;
    url: string;
    created_at?: string;
}

export function AIGeneratorV2({ onGenerateTemplate, onBack, gmailConnection }: AIGeneratorV2Props) {
    const [sessionId] = useState(() => `session-${Date.now()}`);
    const [messages, setMessages] = useState<Message[]>([
        {
            role: 'assistant',
            content: "👋 Hi! I'm your email template assistant.\n\nDescribe the email you want to create and I'll generate production-ready HTML that works perfectly in Gmail, Outlook, and Yahoo.",
            timestamp: new Date(),
        },
    ]);
    const [input, setInput] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [activeTab, setActiveTab] = useState<'preview' | 'code' | 'send' | 'images'>('preview');
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
    const [checkpoints, setCheckpoints] = useState<TemplateCheckpoint[]>([]);
    const [showResetDialog, setShowResetDialog] = useState(false);
    const [editableHtml, setEditableHtml] = useState(''); // For inline code editing
    const [isEditingCode, setIsEditingCode] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const referenceImageInputRef = useRef<HTMLInputElement>(null);

    // Reference Images State (for attaching visual references to prompts)
    const [referenceImages, setReferenceImages] = useState<File[]>([]);

    // Image Gallery State
    const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
    const [isGalleryOpen, setIsGalleryOpen] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

    // Resizable Panel State
    const [leftPanelWidth, setLeftPanelWidth] = useState(45); // percentage
    const [isResizing, setIsResizing] = useState(false);
    const [showVersionHistory, setShowVersionHistory] = useState(false);
    const [restoreConfirm, setRestoreConfirm] = useState<TemplateCheckpoint | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Load chat session on mount
    useEffect(() => {
        const savedSession = loadChatSession();
        if (savedSession) {
            setMessages(savedSession.messages);
            setCurrentTemplate(savedSession.currentTemplate);
            setCheckpoints(savedSession.checkpoints);
            console.log('✅ Chat session restored from localStorage');
        }
    }, []);

    // Auto-save chat session (debounced)
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            const session: ChatSession = {
                id: sessionId,
                messages,
                currentTemplate,
                checkpoints,
                createdAt: new Date(),
                updatedAt: new Date(),
            };
            saveChatSession(session);
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [messages, currentTemplate, checkpoints, sessionId]);

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

    // Load uploaded images on mount
    useEffect(() => {
        fetchImages();
    }, []);

    const fetchImages = async () => {
        try {
            const response = await fetch(`${API_URL}/list-images`);
            if (response.ok) {
                const data = await response.json();
                setUploadedImages(data.images || []);
            }
        } catch (error) {
            console.error('Failed to fetch images:', error);
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch(`${API_URL}/upload-image`, {
                method: 'POST',
                body: formData,
            });

            if (response.ok) {
                const data = await response.json();
                setUploadedImages(prev => [{ name: data.filename, url: data.url }, ...prev]);
                setIsGalleryOpen(true);
            } else {
                const error = await response.json();
                alert(`Upload failed: ${error.detail}`);
            }
        } catch (error) {
            console.error('Upload error:', error);
            alert('Failed to upload image');
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleDeleteImage = async (filename: string) => {
        if (!confirm('Delete this image?')) return;

        try {
            const response = await fetch(`${API_URL}/delete-image/${filename}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                setUploadedImages(prev => prev.filter(img => img.name !== filename));
            } else {
                alert('Failed to delete image');
            }
        } catch (error) {
            console.error('Delete error:', error);
        }
    };

    const handleCopyUrl = async (url: string) => {
        await navigator.clipboard.writeText(url);
        setCopiedUrl(url);
        setTimeout(() => setCopiedUrl(null), 2000);
    };

    // Drag start handler for images - now uses URL
    const handleDragStart = (e: React.DragEvent, img: UploadedImage) => {
        e.dataTransfer.setData('text/plain', img.url);
        e.dataTransfer.setData('application/json', JSON.stringify({ name: img.name, url: img.url }));
        e.dataTransfer.effectAllowed = 'copy';
    };

    // Drop handler for textarea - inserts URL
    const handleDrop = (e: React.DragEvent<HTMLTextAreaElement>) => {
        e.preventDefault();
        const url = e.dataTransfer.getData('text/plain');
        if (url && url.startsWith('http')) {
            const textarea = e.currentTarget;
            const start = textarea.selectionStart;
            const end = textarea.selectionEnd;
            const newValue = input.slice(0, start) + url + ' ' + input.slice(end);
            setInput(newValue);
            // Trigger resize
            setTimeout(() => {
                textarea.style.height = 'auto';
                const newHeight = Math.min(textarea.scrollHeight, 140);
                textarea.style.height = `${newHeight}px`;
            }, 0);
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
    };

    // Panel resize handlers
    const handleMouseDown = (e: React.MouseEvent) => {
        e.preventDefault();
        setIsResizing(true);
    };

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!isResizing || !containerRef.current) return;
            const containerRect = containerRef.current.getBoundingClientRect();
            const newWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100;
            // Clamp between 25% and 75%
            setLeftPanelWidth(Math.min(75, Math.max(25, newWidth)));
        };

        const handleMouseUp = () => {
            setIsResizing(false);
        };

        if (isResizing) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
        }

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isResizing]);

    const handleSend = async () => {
        if (!input.trim() || isGenerating) return;

        const userMessage = input.trim();
        const imagesToSend = [...referenceImages]; // Capture before clearing
        setInput('');
        setReferenceImages([]); // Clear attached images

        // Add user message first (with image count indicator)
        const imageIndicator = imagesToSend.length > 0
            ? ` [📎 ${imagesToSend.length} image${imagesToSend.length > 1 ? 's' : ''} attached]`
            : '';
        const newUserMessage: Message = {
            role: 'user',
            content: userMessage + imageIndicator,
            timestamp: new Date()
        };
        setMessages((prev) => [...prev, newUserMessage]);
        setIsGenerating(true);

        try {
            const formData = new FormData();

            // Always send the user's prompt
            formData.append('prompt', userMessage);

            // Attach reference images for multimodal processing
            imagesToSend.forEach((img) => {
                formData.append('images', img);
            });

            // Send full conversation history (excluding the greeting and current message)
            const historyToSend = messages
                .filter((msg, idx) => idx > 0) // Skip the initial greeting
                .map(msg => ({
                    role: msg.role,
                    content: msg.content
                }));

            if (historyToSend.length > 0) {
                formData.append('history', JSON.stringify(historyToSend));
            }

            // Send current template HTML if it exists (for modifications)
            if (currentTemplate) {
                formData.append('current_html', currentTemplate.html);
            }

            const response = await fetch(`${API_URL}/generate-email`, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Failed to generate email');
            }

            const data = await response.json();

            if (data.success && data.html) {
                // Determine if this is a modification based on existing template
                const isModification = !!currentTemplate;

                // Create or update template
                const updatedTemplate: EmailTemplate = isModification && currentTemplate ? {
                    ...currentTemplate,
                    html: data.html,
                    updatedAt: new Date(),
                } : {
                    id: `ai-${Date.now()}`,
                    name: `AI Generated - ${new Date().toLocaleDateString()}`,
                    subject: data.subject || userMessage.slice(0, 100),
                    category: 'custom',
                    html: data.html,
                    isCustom: true,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                };

                setCurrentTemplate(updatedTemplate);
                onGenerateTemplate(updatedTemplate);

                // Create checkpoint for version control - store with associated messages
                const checkpoint: TemplateCheckpoint = {
                    id: `checkpoint-${Date.now()}`,
                    templateId: updatedTemplate.id,
                    version: checkpoints.filter(cp => cp.templateId === updatedTemplate.id).length + 1,
                    html: data.html,
                    userPrompt: userMessage,
                    timestamp: new Date(),
                    label: userMessage.slice(0, 50) + (userMessage.length > 50 ? '...' : ''),
                };
                setCheckpoints(prev => [...prev, checkpoint]);

                // Build response message with change summary if available
                let successMessage: string;
                if (isModification && data.changes) {
                    // Parse bullet points from changes
                    const changesList = data.changes
                        .split('•')
                        .map((c: string) => c.trim())
                        .filter((c: string) => c.length > 0);

                    if (changesList.length > 0) {
                        successMessage = `✅ **Template Updated!**\n\n**Changes made:**\n${changesList.map((c: string) => `• ${c}`).join('\n')}\n\n_Check the preview on the right._`;
                    } else {
                        successMessage = "✅ Template updated! Check the preview on the right.";
                    }
                } else if (isModification) {
                    successMessage = "✅ Template updated! Check the preview on the right to see the changes.";
                } else {
                    successMessage = "✨ **Template Created!**\n\nYour email template is ready. Check the preview on the right, or switch to **Code** view to see the HTML.\n\n_You can now ask me to make changes like:_\n• \"Change the button color to red\"\n• \"Add a footer section\"\n• \"Make the header bigger\"";
                }

                setMessages((prev) => [
                    ...prev,
                    {
                        role: 'assistant',
                        content: successMessage,
                        timestamp: new Date(),
                    },
                ]);

                // Auto-set subject if provided by AI
                if (data.subject && !subject) {
                    setSubject(data.subject);
                }
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';

            // Parse common errors for better user feedback
            let friendlyError = errorMessage;
            if (errorMessage.includes('402')) {
                friendlyError = "API credit limit reached. Please check your OpenRouter account.";
            } else if (errorMessage.includes('timeout') || errorMessage.includes('network')) {
                friendlyError = "Network error. Please check your internet connection.";
            } else if (errorMessage.includes('Failed to fetch')) {
                friendlyError = "Cannot connect to server. Is the backend running?";
            }

            setMessages((prev) => [
                ...prev,
                {
                    role: 'assistant',
                    content: `❌ **Error:** ${friendlyError}\n\n_Try again or rephrase your request._`,
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

    // Handle Ctrl+V paste for images
    const handlePaste = (e: React.ClipboardEvent) => {
        const items = e.clipboardData?.items;
        if (!items) return;

        const imageFiles: File[] = [];
        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            if (item.type.startsWith('image/')) {
                const file = item.getAsFile();
                if (file) {
                    imageFiles.push(file);
                }
            }
        }

        if (imageFiles.length > 0) {
            e.preventDefault(); // Prevent default paste behavior for images
            // Add pasted images (limit to 4 total)
            const newImages = imageFiles.slice(0, 4 - referenceImages.length);
            if (newImages.length > 0) {
                setReferenceImages(prev => [...prev, ...newImages].slice(0, 4));
            }
        }
    };

    const handleReset = () => {
        setShowResetDialog(true);
    };

    const confirmReset = () => {
        // Clear all state
        setMessages([{
            role: 'assistant',
            content: "👋 Hi! I'm your email template assistant.\n\nDescribe the email you want to create and I'll generate production-ready HTML that works perfectly in Gmail, Outlook, and Yahoo.",
            timestamp: new Date(),
        }]);
        setCurrentTemplate(null);
        setCheckpoints([]);
        setInput('');
        setFileTabs([]);
        setSubject(''); // Clear subject too

        // Clear localStorage
        clearChatSession();

        setShowResetDialog(false);
        console.log('🔄 Chat session reset');
    };

    // Restore template to a previous version
    const handleRestoreVersion = (checkpoint: TemplateCheckpoint) => {
        if (!currentTemplate) return;

        // Update template with checkpoint's HTML
        const restoredTemplate: EmailTemplate = {
            ...currentTemplate,
            html: checkpoint.html,
            updatedAt: new Date(),
        };

        setCurrentTemplate(restoredTemplate);
        onGenerateTemplate(restoredTemplate);

        // Add restore message to chat
        setMessages(prev => [
            ...prev,
            {
                role: 'assistant',
                content: `🔄 **Restored to Version ${checkpoint.version}**\n\n_Original prompt: "${checkpoint.userPrompt.slice(0, 60)}${checkpoint.userPrompt.length > 60 ? '...' : ''}"_\n\nYou can continue making changes from this point.`,
                timestamp: new Date(),
            }
        ]);

        // Close version history panel
        setShowVersionHistory(false);

        console.log(`✅ Restored to version ${checkpoint.version}`);
    };

    // Generate subject line from user prompt
    const generateSubjectFromPrompt = (prompt: string): string => {
        // Clean up the prompt
        let subject = prompt.trim();

        // Remove common action verbs and filler words
        subject = subject.replace(/^(create|generate|make|build|design|write)\s+(an?|the)?\s*/i, '');
        subject = subject.replace(/^(email|template|mail)\s+(for|about|regarding|on)?\s*/i, '');
        subject = subject.replace(/\s+(email|template|mail)$/i, '');

        // Extract key information patterns
        // Pattern: "X for Y" → "Y: X"
        const forMatch = subject.match(/^(.+?)\s+for\s+(.+)$/i);
        if (forMatch) {
            subject = `${forMatch[2]}: ${forMatch[1]}`;
        }

        // Pattern: "X about Y" → "Y - X"  
        const aboutMatch = subject.match(/^(.+?)\s+about\s+(.+)$/i);
        if (aboutMatch) {
            subject = `${aboutMatch[2]} - ${aboutMatch[1]}`;
        }

        // Remove "with" phrases for brevity (keep the main part)
        subject = subject.replace(/\s+with\s+.+$/i, (match) => {
            // Keep if it's important info like discounts
            if (/\d+%|discount|off|free/i.test(match)) {
                return match.replace(/\s+with\s+/i, ' - ');
            }
            return '';
        });

        // Capitalize important words (title case)
        subject = subject.split(' ').map((word, index) => {
            // Always capitalize first word
            if (index === 0) {
                return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
            }
            // Capitalize important words
            if (!/^(a|an|the|for|and|or|but|in|on|at|to|of|with)$/i.test(word)) {
                return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
            }
            return word.toLowerCase();
        }).join(' ');

        // Truncate if too long (max 60 chars for better mobile display)
        if (subject.length > 60) {
            subject = subject.substring(0, 57) + '...';
        }

        // Add emoji for common patterns (optional enhancement)
        if (/welcome|join|new/i.test(subject) && subject.length < 55) {
            subject = `🎉 ${subject}`;
        } else if (/sale|discount|off|promo/i.test(subject) && subject.length < 55) {
            subject = `🔥 ${subject}`;
        } else if (/event|invitation|rsvp/i.test(subject) && subject.length < 55) {
            subject = `📅 ${subject}`;
        }

        return subject || 'Your Email Subject';
    };

    const handleGenerateSubject = () => {
        if (currentTemplate) {
            // Find the first user message that created this template
            const creationCheckpoint = checkpoints.find(cp => cp.templateId === currentTemplate.id && cp.version === 1);
            if (creationCheckpoint) {
                const newSubject = generateSubjectFromPrompt(creationCheckpoint.userPrompt);
                setSubject(newSubject);
            }
        }
    };

    // Auto-resize textarea like ChatGPT
    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const value = e.target.value;
        setInput(value);

        // Auto-resize: reset then expand
        e.target.style.height = 'auto';
        const newHeight = Math.min(e.target.scrollHeight, 140);
        e.target.style.height = `${newHeight}px`;
    };

    const suggestions = [
        'Modern promo email with 30% off',
        'Welcome email for new users',
        'Event invitation with RSVP',
        'Product launch announcement',
    ];

    // Handle reference image selection (for multimodal AI)
    const handleReferenceImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;

        // Limit to 4 images max
        const newImages = files.slice(0, 4 - referenceImages.length);
        setReferenceImages(prev => [...prev, ...newImages].slice(0, 4));

        // Reset input for re-selection
        if (referenceImageInputRef.current) {
            referenceImageInputRef.current.value = '';
        }
    };

    const handleRemoveReferenceImage = (index: number) => {
        setReferenceImages(prev => prev.filter((_, i) => i !== index));
    };

    // Simple markdown renderer for chat messages
    const renderMarkdown = (text: string) => {
        // Split by lines to handle bullet points
        const lines = text.split('\n');

        return lines.map((line, lineIndex) => {
            // Parse inline formatting
            let content: React.ReactNode = line;

            // Bold: **text** or __text__
            const boldParts = line.split(/(\*\*[^*]+\*\*|__[^_]+__)/g);
            if (boldParts.length > 1) {
                content = boldParts.map((part, i) => {
                    if (part.startsWith('**') && part.endsWith('**')) {
                        return <strong key={i} style={{ fontWeight: 600 }}>{part.slice(2, -2)}</strong>;
                    }
                    if (part.startsWith('__') && part.endsWith('__')) {
                        return <strong key={i} style={{ fontWeight: 600 }}>{part.slice(2, -2)}</strong>;
                    }
                    // Handle italic within remaining text: _text_ or *text*
                    const italicParts = part.split(/(_[^_]+_|\*[^*]+\*)/g);
                    if (italicParts.length > 1) {
                        return italicParts.map((iPart, j) => {
                            if ((iPart.startsWith('_') && iPart.endsWith('_')) ||
                                (iPart.startsWith('*') && iPart.endsWith('*'))) {
                                return <em key={`${i}-${j}`} style={{ fontStyle: 'italic', color: '#a1a1aa' }}>{iPart.slice(1, -1)}</em>;
                            }
                            return iPart;
                        });
                    }
                    return part;
                });
            } else {
                // Handle italic if no bold
                const italicParts = line.split(/(_[^_]+_)/g);
                if (italicParts.length > 1) {
                    content = italicParts.map((part, i) => {
                        if (part.startsWith('_') && part.endsWith('_')) {
                            return <em key={i} style={{ fontStyle: 'italic', color: '#a1a1aa' }}>{part.slice(1, -1)}</em>;
                        }
                        return part;
                    });
                }
            }

            // Check if line is a bullet point
            const bulletMatch = line.match(/^(\s*)[•\-\*]\s+(.+)/);
            if (bulletMatch) {
                return (
                    <div key={lineIndex} style={{
                        display: 'flex',
                        gap: '8px',
                        marginLeft: bulletMatch[1].length * 4,
                        marginTop: '4px',
                    }}>
                        <span style={{ color: '#3b82f6' }}>•</span>
                        <span>{typeof content === 'string' ? bulletMatch[2] : content}</span>
                    </div>
                );
            }

            // Regular line
            return (
                <React.Fragment key={lineIndex}>
                    {content}
                    {lineIndex < lines.length - 1 && <br />}
                </React.Fragment>
            );
        });
    };

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
                    <button
                        onClick={() => setActiveTab('images')}
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
                            backgroundColor: activeTab === 'images' ? '#10b981' : 'transparent',
                            color: activeTab === 'images' ? '#ffffff' : '#a1a1aa',
                            transition: 'all 0.2s',
                        }}
                    >
                        <Image style={{ width: '14px', height: '14px' }} />
                        Images ({uploadedImages.length})
                    </button>

                    {/* Version History Button */}
                    <button
                        onClick={() => setShowVersionHistory(!showVersionHistory)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '6px 12px',
                            borderRadius: '6px',
                            fontSize: '13px',
                            fontWeight: 500,
                            border: 'none',
                            cursor: checkpoints.length > 0 ? 'pointer' : 'not-allowed',
                            backgroundColor: showVersionHistory ? '#3b82f6' : 'transparent',
                            color: showVersionHistory ? '#ffffff' : checkpoints.length > 0 ? '#a1a1aa' : '#52525b',
                            transition: 'all 0.2s',
                            opacity: checkpoints.length > 0 ? 1 : 0.5,
                        }}
                        disabled={checkpoints.length === 0}
                    >
                        <History style={{ width: '14px', height: '14px' }} />
                        History ({checkpoints.length})
                    </button>

                    {/* Divider */}
                    <div style={{
                        width: '1px',
                        height: '20px',
                        backgroundColor: '#3f3f46',
                        margin: '0 4px',
                    }} />

                    {/* Reset Button */}
                    <button
                        onClick={handleReset}
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
                            backgroundColor: 'transparent',
                            color: '#ef4444',
                            transition: 'all 0.2s',
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#3f1515'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                        <RefreshCw style={{ width: '14px', height: '14px' }} />
                        Reset
                    </button>
                </div>
            </div>

            {/* Reset Confirmation Dialog */}
            {showResetDialog && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.7)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 9999,
                }}>
                    <div style={{
                        backgroundColor: '#18181b',
                        border: '1px solid #27272a',
                        borderRadius: '12px',
                        padding: '24px',
                        maxWidth: '400px',
                        width: '90%',
                    }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            marginBottom: '16px',
                        }}>
                            <div style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '8px',
                                backgroundColor: '#3f1515',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}>
                                <RefreshCw style={{ width: '20px', height: '20px', color: '#ef4444' }} />
                            </div>
                            <h3 style={{
                                margin: 0,
                                fontSize: '18px',
                                fontWeight: 600,
                                color: '#ffffff',
                            }}>
                                Reset Chat Session?
                            </h3>
                        </div>

                        <p style={{
                            margin: '0 0 20px 0',
                            fontSize: '14px',
                            lineHeight: '1.6',
                            color: '#a1a1aa',
                        }}>
                            This will clear all messages, templates, and version history. This action cannot be undone.
                        </p>

                        <div style={{
                            display: 'flex',
                            gap: '12px',
                            justifyContent: 'flex-end',
                        }}>
                            <button
                                onClick={() => setShowResetDialog(false)}
                                style={{
                                    padding: '8px 16px',
                                    borderRadius: '6px',
                                    fontSize: '14px',
                                    fontWeight: 500,
                                    border: '1px solid #3f3f46',
                                    backgroundColor: 'transparent',
                                    color: '#a1a1aa',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#27272a'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmReset}
                                style={{
                                    padding: '8px 16px',
                                    borderRadius: '6px',
                                    fontSize: '14px',
                                    fontWeight: 500,
                                    border: 'none',
                                    backgroundColor: '#ef4444',
                                    color: '#ffffff',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#dc2626'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ef4444'}
                            >
                                Reset Chat
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Restore Confirmation Dialog */}
            {restoreConfirm && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.7)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 9999,
                }}>
                    <div style={{
                        backgroundColor: '#18181b',
                        border: '1px solid #27272a',
                        borderRadius: '12px',
                        padding: '24px',
                        maxWidth: '400px',
                        width: '90%',
                    }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            marginBottom: '16px',
                        }}>
                            <div style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '8px',
                                backgroundColor: '#1e3a5f',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}>
                                <RotateCcw style={{ width: '20px', height: '20px', color: '#3b82f6' }} />
                            </div>
                            <h3 style={{
                                margin: 0,
                                fontSize: '18px',
                                fontWeight: 600,
                                color: '#ffffff',
                            }}>
                                Restore to Version {restoreConfirm.version}?
                            </h3>
                        </div>

                        <p style={{
                            margin: '0 0 8px 0',
                            fontSize: '14px',
                            lineHeight: '1.6',
                            color: '#a1a1aa',
                        }}>
                            This will restore your template to this point:
                        </p>

                        <div style={{
                            backgroundColor: '#27272a',
                            borderRadius: '8px',
                            padding: '12px',
                            marginBottom: '20px',
                        }}>
                            <p style={{
                                margin: 0,
                                fontSize: '13px',
                                color: '#e4e4e7',
                                fontStyle: 'italic',
                            }}>
                                "{restoreConfirm.userPrompt.slice(0, 100)}{restoreConfirm.userPrompt.length > 100 ? '...' : ''}"
                            </p>
                        </div>

                        <div style={{
                            display: 'flex',
                            gap: '12px',
                            justifyContent: 'flex-end',
                        }}>
                            <button
                                onClick={() => setRestoreConfirm(null)}
                                style={{
                                    padding: '8px 16px',
                                    borderRadius: '6px',
                                    fontSize: '14px',
                                    fontWeight: 500,
                                    border: '1px solid #3f3f46',
                                    backgroundColor: 'transparent',
                                    color: '#a1a1aa',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#27272a'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    handleRestoreVersion(restoreConfirm);
                                    setRestoreConfirm(null);
                                }}
                                style={{
                                    padding: '8px 16px',
                                    borderRadius: '6px',
                                    fontSize: '14px',
                                    fontWeight: 500,
                                    border: 'none',
                                    backgroundColor: '#3b82f6',
                                    color: '#ffffff',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#3b82f6'}
                            >
                                Yes, Restore
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Version History Panel */}
            {showVersionHistory && (
                <div style={{
                    position: 'absolute',
                    top: '48px',
                    right: '0',
                    width: '320px',
                    maxHeight: 'calc(100% - 48px)',
                    backgroundColor: '#18181b',
                    borderLeft: '1px solid #27272a',
                    borderBottom: '1px solid #27272a',
                    borderRadius: '0 0 0 12px',
                    zIndex: 100,
                    display: 'flex',
                    flexDirection: 'column',
                    boxShadow: '-4px 4px 12px rgba(0, 0, 0, 0.4)',
                }}>
                    {/* Panel Header */}
                    <div style={{
                        padding: '16px',
                        borderBottom: '1px solid #27272a',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <History style={{ width: '16px', height: '16px', color: '#3b82f6' }} />
                            <span style={{ fontWeight: 600, color: '#ffffff', fontSize: '14px' }}>
                                Version History
                            </span>
                        </div>
                        <button
                            onClick={() => setShowVersionHistory(false)}
                            style={{
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                color: '#71717a',
                                padding: '4px',
                            }}
                        >
                            <X style={{ width: '16px', height: '16px' }} />
                        </button>
                    </div>

                    {/* Checkpoints List */}
                    <div style={{
                        flex: 1,
                        overflowY: 'auto',
                        padding: '8px',
                    }}>
                        {checkpoints.length === 0 ? (
                            <p style={{
                                color: '#71717a',
                                fontSize: '13px',
                                textAlign: 'center',
                                padding: '20px',
                            }}>
                                No versions yet. Generate a template to start tracking versions.
                            </p>
                        ) : (
                            [...checkpoints]
                                .sort((a, b) => b.version - a.version)
                                .map((checkpoint) => (
                                    <div
                                        key={checkpoint.id}
                                        style={{
                                            padding: '12px',
                                            borderRadius: '8px',
                                            backgroundColor: '#27272a',
                                            marginBottom: '8px',
                                            border: '1px solid #3f3f46',
                                        }}
                                    >
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            marginBottom: '6px',
                                        }}>
                                            <span style={{
                                                fontSize: '13px',
                                                fontWeight: 600,
                                                color: '#3b82f6',
                                            }}>
                                                v{checkpoint.version}
                                            </span>
                                            <span style={{
                                                fontSize: '11px',
                                                color: '#71717a',
                                            }}>
                                                {new Date(checkpoint.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>

                                        <p style={{
                                            fontSize: '12px',
                                            color: '#a1a1aa',
                                            margin: '0 0 10px 0',
                                            lineHeight: '1.4',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            display: '-webkit-box',
                                            WebkitLineClamp: 2,
                                            WebkitBoxOrient: 'vertical',
                                        }}>
                                            "{checkpoint.userPrompt}"
                                        </p>

                                        <button
                                            onClick={() => handleRestoreVersion(checkpoint)}
                                            style={{
                                                width: '100%',
                                                padding: '6px 12px',
                                                borderRadius: '6px',
                                                fontSize: '12px',
                                                fontWeight: 500,
                                                border: '1px solid #3b82f6',
                                                backgroundColor: 'transparent',
                                                color: '#3b82f6',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: '6px',
                                                transition: 'all 0.2s',
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.backgroundColor = '#3b82f6';
                                                e.currentTarget.style.color = '#ffffff';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.backgroundColor = 'transparent';
                                                e.currentTarget.style.color = '#3b82f6';
                                            }}
                                        >
                                            <RotateCcw style={{ width: '12px', height: '12px' }} />
                                            Restore this version
                                        </button>
                                    </div>
                                ))
                        )}
                    </div>
                </div>
            )}

            {/* Main Content - Two Panel Layout */}
            <div ref={containerRef} style={{ flex: 1, display: 'flex', overflow: 'hidden', position: 'relative' }}>
                {/* Left Panel - Chat */}
                <div style={{
                    width: `${leftPanelWidth}%`,
                    minWidth: '300px',
                    display: 'flex',
                    flexDirection: 'column',
                    backgroundColor: '#0a0a0b',
                    transition: isResizing ? 'none' : 'width 0.1s',
                }}>
                    {/* Messages Area */}
                    <div className="ai-chat-scrollbar" style={{
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
                                                wordBreak: 'break-word',
                                            }}>
                                                {renderMarkdown(message.content)}
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
                                    <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '8px' }}>
                                        {/* Show restore icon if this message has a checkpoint */}
                                        {(() => {
                                            const checkpoint = checkpoints.find(cp => cp.userPrompt === message.content);
                                            if (checkpoint) {
                                                return (
                                                    <button
                                                        onClick={() => setRestoreConfirm(checkpoint)}
                                                        title={`Restore to v${checkpoint.version}`}
                                                        style={{
                                                            background: 'none',
                                                            border: 'none',
                                                            cursor: 'pointer',
                                                            color: '#71717a',
                                                            padding: '6px',
                                                            borderRadius: '6px',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '4px',
                                                            fontSize: '11px',
                                                            transition: 'all 0.2s',
                                                        }}
                                                        onMouseEnter={(e) => {
                                                            e.currentTarget.style.backgroundColor = '#27272a';
                                                            e.currentTarget.style.color = '#3b82f6';
                                                        }}
                                                        onMouseLeave={(e) => {
                                                            e.currentTarget.style.backgroundColor = 'transparent';
                                                            e.currentTarget.style.color = '#71717a';
                                                        }}
                                                    >
                                                        <RotateCcw style={{ width: '14px', height: '14px' }} />
                                                        <span>v{checkpoint.version}</span>
                                                    </button>
                                                );
                                            }
                                            return null;
                                        })()}
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
                                            {renderMarkdown(message.content)}
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


                    {/* Input Area - Simple and Clean */}
                    <div style={{
                        padding: '16px 20px',
                        borderTop: '1px solid #27272a',
                        backgroundColor: '#0a0a0b',
                    }}>
                        {/* Hidden file input for reference images */}
                        <input
                            ref={referenceImageInputRef}
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleReferenceImageSelect}
                            style={{ display: 'none' }}
                        />

                        {/* Reference Image Thumbnails */}
                        {referenceImages.length > 0 && (
                            <div style={{
                                display: 'flex',
                                gap: '8px',
                                marginBottom: '12px',
                                flexWrap: 'wrap',
                            }}>
                                {referenceImages.map((img, index) => (
                                    <div
                                        key={index}
                                        style={{
                                            position: 'relative',
                                            width: '60px',
                                            height: '60px',
                                            borderRadius: '8px',
                                            overflow: 'hidden',
                                            border: '2px solid #3f3f46',
                                        }}
                                    >
                                        <img
                                            src={URL.createObjectURL(img)}
                                            alt={`Reference ${index + 1}`}
                                            style={{
                                                width: '100%',
                                                height: '100%',
                                                objectFit: 'cover',
                                            }}
                                        />
                                        <button
                                            onClick={() => handleRemoveReferenceImage(index)}
                                            style={{
                                                position: 'absolute',
                                                top: '2px',
                                                right: '2px',
                                                width: '18px',
                                                height: '18px',
                                                borderRadius: '50%',
                                                backgroundColor: '#ef4444',
                                                border: 'none',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                cursor: 'pointer',
                                            }}
                                        >
                                            <X style={{ width: '12px', height: '12px', color: '#fff' }} />
                                        </button>
                                    </div>
                                ))}
                                <span style={{
                                    fontSize: '11px',
                                    color: '#71717a',
                                    alignSelf: 'center',
                                    marginLeft: '4px',
                                }}>
                                    {referenceImages.length}/4 images
                                </span>
                            </div>
                        )}

                        <div style={{
                            display: 'flex',
                            alignItems: 'flex-end',
                            gap: '8px',
                            backgroundColor: '#18181b',
                            border: '1px solid #3f3f46',
                            borderRadius: '12px',
                            padding: '12px 16px',
                        }}>
                            {/* Attach Image Button */}
                            <button
                                onClick={() => referenceImageInputRef.current?.click()}
                                disabled={isGenerating || referenceImages.length >= 4}
                                title="Attach reference image"
                                style={{
                                    width: '36px',
                                    height: '36px',
                                    borderRadius: '8px',
                                    backgroundColor: 'transparent',
                                    border: '1px solid #3f3f46',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: referenceImages.length >= 4 ? 'not-allowed' : 'pointer',
                                    transition: 'all 0.2s',
                                    flexShrink: 0,
                                    opacity: referenceImages.length >= 4 ? 0.4 : 1,
                                }}
                                onMouseEnter={(e) => {
                                    if (referenceImages.length < 4) {
                                        e.currentTarget.style.backgroundColor = '#27272a';
                                        e.currentTarget.style.borderColor = '#7c3aed';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = 'transparent';
                                    e.currentTarget.style.borderColor = '#3f3f46';
                                }}
                            >
                                <Paperclip style={{ width: '16px', height: '16px', color: '#a1a1aa' }} />
                            </button>

                            <textarea
                                ref={inputRef}
                                value={input}
                                onChange={handleInputChange}
                                onKeyDown={handleKeyDown}
                                onPaste={handlePaste}
                                onDrop={handleDrop}
                                onDragOver={handleDragOver}
                                placeholder={referenceImages.length > 0
                                    ? "Describe the changes you want based on the attached image(s)..."
                                    : "Describe your email template..."}
                                rows={1}
                                className="ai-chat-scrollbar"
                                style={{
                                    flex: 1,
                                    backgroundColor: 'transparent',
                                    border: 'none',
                                    outline: 'none',
                                    color: '#ffffff',
                                    fontSize: '14px',
                                    lineHeight: '21px',
                                    resize: 'none',
                                    minHeight: '21px',
                                    maxHeight: '140px',
                                    overflowY: 'auto',
                                    fontFamily: 'inherit',
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
                                    flexShrink: 0,
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
                                Powered by GPT-4o-mini • Attach images for visual reference
                            </span>
                        </div>
                    </div>
                </div>

                {/* Draggable Divider */}
                <div
                    onMouseDown={handleMouseDown}
                    style={{
                        width: '6px',
                        cursor: 'col-resize',
                        backgroundColor: isResizing ? '#7c3aed' : '#27272a',
                        transition: 'background-color 0.2s',
                        flexShrink: 0,
                        position: 'relative',
                        zIndex: 10,
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#7c3aed'}
                    onMouseLeave={(e) => !isResizing && (e.currentTarget.style.backgroundColor = '#27272a')}
                >
                    <div style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: '2px',
                        height: '40px',
                        backgroundColor: '#52525b',
                        borderRadius: '2px',
                    }} />
                </div>

                {/* Right Panel - Preview/Code */}
                <div style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    backgroundColor: '#0f0f11',
                    overflow: 'hidden',
                    minWidth: '300px',
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
                    <div style={{ flex: 1, overflow: 'auto', padding: activeTab === 'preview' ? '24px' : activeTab === 'send' ? '24px' : activeTab === 'images' ? '24px' : '0' }}>
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
                            /* Code View with Inline Editing */
                            currentTemplate ? (
                                <div style={{ height: '100%', position: 'relative', display: 'flex', flexDirection: 'column' }}>
                                    {/* Action Buttons */}
                                    <div style={{
                                        position: 'absolute',
                                        top: '12px',
                                        right: '12px',
                                        display: 'flex',
                                        gap: '8px',
                                        zIndex: 10,
                                    }}>
                                        {!isEditingCode ? (
                                            <>
                                                <button
                                                    onClick={() => {
                                                        setEditableHtml(currentTemplate.html);
                                                        setIsEditingCode(true);
                                                    }}
                                                    style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        gap: '6px',
                                                        padding: '8px 12px',
                                                        height: '36px',
                                                        backgroundColor: '#7c3aed',
                                                        border: 'none',
                                                        borderRadius: '6px',
                                                        color: '#ffffff',
                                                        fontSize: '12px',
                                                        cursor: 'pointer',
                                                        fontWeight: 500,
                                                    }}
                                                >
                                                    <FileCode style={{ width: '14px', height: '14px' }} />
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={handleCopyCode}
                                                    style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        gap: '6px',
                                                        padding: '8px 12px',
                                                        height: '36px',
                                                        backgroundColor: '#27272a',
                                                        border: '1px solid #3f3f46',
                                                        borderRadius: '6px',
                                                        color: '#a1a1aa',
                                                        fontSize: '12px',
                                                        cursor: 'pointer',
                                                    }}
                                                >
                                                    {copied ? <Check style={{ width: '14px', height: '14px' }} /> : <Copy style={{ width: '14px', height: '14px' }} />}
                                                    {copied ? 'Copied!' : 'Copy'}
                                                </button>
                                            </>
                                        ) : (
                                            <>
                                                <button
                                                    onClick={() => {
                                                        // Save changes
                                                        const updated = {
                                                            ...currentTemplate,
                                                            html: editableHtml,
                                                            updatedAt: new Date(),
                                                        };
                                                        setCurrentTemplate(updated);
                                                        onGenerateTemplate(updated);
                                                        setIsEditingCode(false);
                                                    }}
                                                    style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '6px',
                                                        padding: '8px 12px',
                                                        backgroundColor: '#22c55e',
                                                        border: 'none',
                                                        borderRadius: '6px',
                                                        color: '#ffffff',
                                                        fontSize: '12px',
                                                        cursor: 'pointer',
                                                        fontWeight: 500,
                                                    }}
                                                >
                                                    <Check style={{ width: '14px', height: '14px' }} />
                                                    Save
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setIsEditingCode(false);
                                                        setEditableHtml('');
                                                    }}
                                                    style={{
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
                                                    }}
                                                >
                                                    <X style={{ width: '14px', height: '14px' }} />
                                                    Cancel
                                                </button>
                                            </>
                                        )}
                                    </div>

                                    {/* Code Display/Editor */}
                                    {isEditingCode ? (
                                        <textarea
                                            value={editableHtml}
                                            onChange={(e) => setEditableHtml(e.target.value)}
                                            className="ai-chat-scrollbar"
                                            style={{
                                                flex: 1,
                                                padding: '16px',
                                                paddingTop: '60px',
                                                backgroundColor: '#0a0a0b',
                                                border: '2px solid #7c3aed',
                                                color: '#a1a1aa',
                                                fontSize: '13px',
                                                lineHeight: '1.6',
                                                fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                                                resize: 'none',
                                                outline: 'none',
                                                whiteSpace: 'pre',
                                                overflowX: 'auto',
                                            }}
                                            spellCheck={false}
                                        />
                                    ) : (
                                        <pre style={{
                                            flex: 1,
                                            margin: 0,
                                            padding: '16px',
                                            paddingTop: '60px',
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
                                    )}
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
                        ) : activeTab === 'send' ? (
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
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                                                <label style={{ fontSize: '13px', color: '#a1a1aa' }}>
                                                    Subject *
                                                </label>
                                                {currentTemplate && (
                                                    <button
                                                        onClick={handleGenerateSubject}
                                                        style={{
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '4px',
                                                            padding: '4px 8px',
                                                            backgroundColor: 'transparent',
                                                            border: '1px solid #3f3f46',
                                                            borderRadius: '6px',
                                                            color: '#a1a1aa',
                                                            fontSize: '11px',
                                                            cursor: 'pointer',
                                                            transition: 'all 0.2s',
                                                        }}
                                                        onMouseEnter={(e) => {
                                                            e.currentTarget.style.backgroundColor = '#27272a';
                                                            e.currentTarget.style.borderColor = '#7c3aed';
                                                            e.currentTarget.style.color = '#7c3aed';
                                                        }}
                                                        onMouseLeave={(e) => {
                                                            e.currentTarget.style.backgroundColor = 'transparent';
                                                            e.currentTarget.style.borderColor = '#3f3f46';
                                                            e.currentTarget.style.color = '#a1a1aa';
                                                        }}
                                                    >
                                                        <Sparkles style={{ width: '12px', height: '12px' }} />
                                                        Generate Subject
                                                    </button>
                                                )}
                                            </div>
                                            <input
                                                type="text"
                                                value={subject}
                                                onChange={(e) => setSubject(e.target.value)}
                                                placeholder="Auto-generated from your template objective"
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

                                                    const response = await fetch(`${API_URL}/send-email`, {
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
                        ) : (
                            /* Images View */
                            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
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
                                        justifyContent: 'space-between',
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <div style={{
                                                width: '40px',
                                                height: '40px',
                                                background: 'linear-gradient(135deg, #10b981, #059669)',
                                                borderRadius: '10px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                            }}>
                                                <Image style={{ width: '20px', height: '20px', color: '#fff' }} />
                                            </div>
                                            <div>
                                                <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#ffffff', margin: 0 }}>
                                                    Image Gallery
                                                </h3>
                                                <p style={{ fontSize: '13px', color: '#71717a', margin: 0 }}>
                                                    {uploadedImages.length} images uploaded to Supabase
                                                </p>
                                            </div>
                                        </div>
                                        {/* Upload Button */}
                                        <div>
                                            <input
                                                ref={fileInputRef}
                                                type="file"
                                                accept="image/jpeg,image/png,image/gif,image/webp"
                                                onChange={handleImageUpload}
                                                style={{ display: 'none' }}
                                            />
                                            <button
                                                onClick={() => fileInputRef.current?.click()}
                                                disabled={isUploading}
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '8px',
                                                    padding: '10px 16px',
                                                    backgroundColor: '#10b981',
                                                    border: 'none',
                                                    borderRadius: '8px',
                                                    color: '#fff',
                                                    fontSize: '14px',
                                                    fontWeight: 500,
                                                    cursor: isUploading ? 'not-allowed' : 'pointer',
                                                    opacity: isUploading ? 0.7 : 1,
                                                }}
                                            >
                                                {isUploading ? (
                                                    <><Loader2 style={{ width: '16px', height: '16px', animation: 'spin 1s linear infinite' }} /> Uploading...</>
                                                ) : (
                                                    <><Upload style={{ width: '16px', height: '16px' }} /> Upload Image</>
                                                )}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Image Grid */}
                                    <div style={{ padding: '20px' }}>
                                        {uploadedImages.length > 0 ? (
                                            <div style={{
                                                display: 'grid',
                                                gridTemplateColumns: 'repeat(3, 1fr)',
                                                gap: '16px',
                                            }}>
                                                {uploadedImages.map((img) => (
                                                    <div
                                                        key={img.name}
                                                        draggable
                                                        onDragStart={(e) => handleDragStart(e, img)}
                                                        style={{
                                                            position: 'relative',
                                                            aspectRatio: '16/10',
                                                            borderRadius: '8px',
                                                            overflow: 'hidden',
                                                            border: '1px solid #27272a',
                                                            backgroundColor: '#0a0a0b',
                                                            cursor: 'grab',
                                                        }}
                                                        title="Drag to add image URL to your prompt"
                                                    >
                                                        <img
                                                            src={img.url}
                                                            alt={img.name}
                                                            draggable={false}
                                                            style={{
                                                                width: '100%',
                                                                height: '100%',
                                                                objectFit: 'cover',
                                                                pointerEvents: 'none',
                                                            }}
                                                        />
                                                        {/* Overlay Actions */}
                                                        <div style={{
                                                            position: 'absolute',
                                                            inset: 0,
                                                            background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, transparent 60%)',
                                                            opacity: 0,
                                                            transition: 'opacity 0.2s',
                                                            display: 'flex',
                                                            flexDirection: 'column',
                                                            justifyContent: 'flex-end',
                                                            padding: '12px',
                                                        }}
                                                            onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                                                            onMouseLeave={(e) => e.currentTarget.style.opacity = '0'}
                                                        >
                                                            <p style={{ fontSize: '11px', color: '#a1a1aa', margin: '0 0 8px 0', wordBreak: 'break-all' }}>
                                                                {img.name}
                                                            </p>
                                                            <div style={{ display: 'flex', gap: '6px' }}>
                                                                <button
                                                                    onClick={() => handleCopyUrl(img.url)}
                                                                    style={{
                                                                        flex: 1,
                                                                        padding: '8px',
                                                                        backgroundColor: '#3f3f46',
                                                                        border: 'none',
                                                                        borderRadius: '6px',
                                                                        color: '#fff',
                                                                        fontSize: '12px',
                                                                        cursor: 'pointer',
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        justifyContent: 'center',
                                                                        gap: '4px',
                                                                    }}
                                                                >
                                                                    {copiedUrl === img.url ? <Check style={{ width: '14px', height: '14px' }} /> : <Link style={{ width: '14px', height: '14px' }} />}
                                                                    {copiedUrl === img.url ? 'Copied!' : 'Copy URL'}
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDeleteImage(img.name)}
                                                                    style={{
                                                                        padding: '8px 12px',
                                                                        backgroundColor: '#7f1d1d',
                                                                        border: 'none',
                                                                        borderRadius: '6px',
                                                                        color: '#fff',
                                                                        cursor: 'pointer',
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        justifyContent: 'center',
                                                                    }}
                                                                >
                                                                    <Trash2 style={{ width: '14px', height: '14px' }} />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div style={{
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                padding: '60px 20px',
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
                                                    <Image style={{ width: '32px', height: '32px', color: '#52525b' }} />
                                                </div>
                                                <h3 style={{ fontSize: '16px', fontWeight: 500, color: '#e4e4e7', marginBottom: '8px' }}>
                                                    No Images Yet
                                                </h3>
                                                <p style={{ fontSize: '14px', color: '#71717a', marginBottom: '16px' }}>
                                                    Upload images to use in your email templates
                                                </p>
                                                <button
                                                    onClick={() => fileInputRef.current?.click()}
                                                    style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '8px',
                                                        padding: '10px 20px',
                                                        backgroundColor: '#10b981',
                                                        border: 'none',
                                                        borderRadius: '8px',
                                                        color: '#fff',
                                                        fontSize: '14px',
                                                        fontWeight: 500,
                                                        cursor: 'pointer',
                                                    }}
                                                >
                                                    <Upload style={{ width: '16px', height: '16px' }} />
                                                    Upload Your First Image
                                                </button>
                                            </div>
                                        )}
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
