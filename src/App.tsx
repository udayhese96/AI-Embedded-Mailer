import React, { useState, useEffect } from 'react';
import { Dashboard } from './components/Dashboard';
import { TemplateLibrary } from './components/TemplateLibrary';
import { TemplateEditor } from './components/TemplateEditor';
import { AITemplateGenerator } from './components/AITemplateGenerator';
import { EmailComposer } from './components/EmailComposer';
import { GmailIntegration } from './components/GmailIntegration';
import { EmailTemplate, EmailDraft, GmailConnection } from './types/template';
import { preloadedTemplates } from './data/preloadedTemplates';
import {
  LayoutDashboard,
  FileText,
  Sparkles,
  Mail,
  Settings,
  Menu,
  X
} from 'lucide-react';
import CryptoJS from 'crypto-js';

type View = 'dashboard' | 'templates' | 'editor' | 'ai-generator' | 'composer' | 'settings';

export default function App() {
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [templates, setTemplates] = useState<EmailTemplate[]>(preloadedTemplates);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [gmailConnection, setGmailConnection] = useState<GmailConnection>({
    isConnected: false
  });
  const [stats, setStats] = useState({
    totalTemplates: preloadedTemplates.length,
    customTemplates: 0,
    emailsSent: 0,
    openRate: 0
  });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const customCount = templates.filter(t => t.isCustom).length;
    setStats(prev => ({
      ...prev,
      totalTemplates: templates.length,
      customTemplates: customCount
    }));
  }, [templates]);

  // Handle OAuth Redirect and Persistence
  useEffect(() => {
    const checkConnection = async () => {
      const params = new URLSearchParams(window.location.search);
      const connected = params.get('connected');
      const sessionId = params.get('session_id');

      if (connected === 'true' && sessionId) {
        // Came from OAuth redirect
        // 1. Encrypt the Session ID for secure storage
        const encryptedSession = CryptoJS.AES.encrypt(sessionId, "my_super_secret_client_key").toString();

        // 2. Fetch email from backend to display in UI
        try {
          const response = await fetch(`http://127.0.0.1:8000/check-connection/${sessionId}`);
          if (response.ok) {
            const data = await response.json();

            if (data.is_connected) {
              const newConnection = {
                isConnected: true,
                email: data.email,
                accessToken: sessionId // Store Session ID for later use
              };
              setGmailConnection(newConnection);
              localStorage.setItem('secure_session', encryptedSession);

              // Clean URL
              window.history.replaceState({}, '', '/');
              setCurrentView('settings');
            }
          }
        } catch (e) {
          console.error("Verification failed", e);
        }

      } else {
        // Check local storage on load
        const storedEncrypted = localStorage.getItem('secure_session');
        if (storedEncrypted) {
          try {
            // 1. Decrypt Session ID
            const bytes = CryptoJS.AES.decrypt(storedEncrypted, "my_super_secret_client_key");
            const decryptedSessionId = bytes.toString(CryptoJS.enc.Utf8);

            if (decryptedSessionId) {
              // 2. Verify with backend
              const response = await fetch(`http://127.0.0.1:8000/check-connection/${decryptedSessionId}`);
              if (response.ok) {
                const data = await response.json();
                if (data.is_connected) {
                  setGmailConnection({
                    isConnected: true,
                    email: data.email,
                    accessToken: decryptedSessionId
                  });
                } else {
                  localStorage.removeItem('secure_session');
                }
              }
            }
          } catch (e) {
            console.error("Failed to decrypt or verify session", e);
            localStorage.removeItem('secure_session');
          }
        }
      }
    };

    checkConnection();
  }, []);

  const handleSelectTemplate = (template: EmailTemplate) => {
    setSelectedTemplate(template);
    setCurrentView('composer');
  };

  const handleEditTemplate = (template: EmailTemplate) => {
    setSelectedTemplate(template);
    setCurrentView('editor');
  };

  const handleDeleteTemplate = (templateId: string) => {
    if (confirm('Are you sure you want to delete this template?')) {
      setTemplates(prev => prev.filter(t => t.id !== templateId));
    }
  };

  const handleDuplicateTemplate = (template: EmailTemplate) => {
    const duplicated: EmailTemplate = {
      ...template,
      id: `custom-${Date.now()}`,
      name: `${template.name} (Copy)`,
      isCustom: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    setTemplates(prev => [...prev, duplicated]);
  };

  const handleSaveTemplate = (template: EmailTemplate) => {
    const existingIndex = templates.findIndex(t => t.id === template.id);
    if (existingIndex !== -1) {
      setTemplates(prev => {
        const updated = [...prev];
        updated[existingIndex] = template;
        return updated;
      });
    } else {
      setTemplates(prev => [...prev, template]);
    }
    setCurrentView('templates');
  };

  const handleGenerateTemplate = (template: EmailTemplate) => {
    setTemplates(prev => [...prev, template]);
    setSelectedTemplate(template);
  };

  const handleSendEmail = (draft: EmailDraft) => {
    console.log('Sending email:', draft);
    setStats(prev => ({
      ...prev,
      emailsSent: prev.emailsSent + draft.to.length,
      openRate: Math.min(95, prev.openRate + Math.random() * 5)
    }));
  };

  const handleDisconnectGmail = async () => {
    if (confirm('Are you sure you want to disconnect your Gmail account?')) {
      // Call backend to invalidate session
      if (gmailConnection.accessToken) {
        try {
          await fetch(`http://127.0.0.1:8000/disconnect/${gmailConnection.accessToken}`, { method: 'POST' });
        } catch (e) {
          console.error("Failed to disconnect from backend", e);
        }
      }

      setGmailConnection({
        isConnected: false
      });
      localStorage.removeItem('secure_session');
    }
  };

  const menuItems = [
    { id: 'dashboard' as View, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'templates' as View, label: 'Templates', icon: FileText },
    { id: 'ai-generator' as View, label: 'AI Generator', icon: Sparkles },
    { id: 'composer' as View, label: 'Compose Email', icon: Mail },
    { id: 'settings' as View, label: 'Gmail Settings', icon: Settings },
  ];

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard stats={stats} />;
      case 'templates':
        return (
          <TemplateLibrary
            templates={templates}
            onSelectTemplate={handleSelectTemplate}
            onEditTemplate={handleEditTemplate}
            onDeleteTemplate={handleDeleteTemplate}
            onDuplicateTemplate={handleDuplicateTemplate}
          />
        );
      case 'editor':
        return (
          <TemplateEditor
            template={selectedTemplate}
            onSave={handleSaveTemplate}
            onBack={() => setCurrentView('templates')}
          />
        );
      case 'ai-generator':
        return (
          <AITemplateGenerator
            onGenerateTemplate={handleGenerateTemplate}
            onBack={() => setCurrentView('templates')}
          />
        );
      case 'composer':
        return (
          <EmailComposer
            template={selectedTemplate}
            gmailConnection={gmailConnection}
            onBack={() => setCurrentView('templates')}
            onSend={handleSendEmail}
          />
        );
      case 'settings':
        return (
          <GmailIntegration
            connection={gmailConnection}
            onDisconnect={handleDisconnectGmail}
            onBack={() => setCurrentView('dashboard')}
            onConnect={() => { }} // No-op, button handles redirect directly
          />
        );
      default:
        return <Dashboard stats={stats} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-lg"
      >
        {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Sidebar */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-40
        w-64 bg-white border-r border-gray-200 
        transform transition-transform duration-200 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="h-full flex flex-col">
          {/* Logo */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
                <Mail className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-gray-900">WebFudge</h1>
                <p className="text-xs text-gray-500">Email Studio</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentView(item.id);
                  setIsSidebarOpen(false);
                }}
                className={`
                  w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
                  ${currentView === item.id
                    ? 'bg-purple-50 text-purple-700'
                    : 'text-gray-700 hover:bg-gray-50'
                  }
                `}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </button>
            ))}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200">
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-4">
              <h3 className="text-sm text-gray-900 mb-2">Need Help?</h3>
              <p className="text-xs text-gray-600 mb-3">
                Visit our website for support and resources
              </p>
              <a
                href="https://www.webfudge.in/"
                target="_blank"
                rel="noopener noreferrer"
                className="block text-center text-xs bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
              >
                Visit WebFudge.in
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-6 lg:p-8 max-w-7xl mx-auto">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}
