import { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { Sidebar } from './components/layout/Sidebar';
import {
  DashboardPage,
  TemplatesPage,
  TemplateEditorPage,
  AIGeneratorPage,
  ComposePage,
  SettingsPage,
} from './pages';
import { EmailTemplate, EmailDraft, GmailConnection } from './types/template';
import { preloadedTemplates } from './data/preloadedTemplates';
import CryptoJS from 'crypto-js';
import { API_URL } from './config/api';

export default function App() {
  const [templates, setTemplates] = useState<EmailTemplate[]>(preloadedTemplates);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [gmailConnection, setGmailConnection] = useState<GmailConnection>({
    isConnected: false
  });

  // AI Generator persistent state (survives navigation)
  const [aiMessages, setAiMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string; timestamp?: Date }>>([
    {
      role: 'assistant',
      content: "👋 Hi! I'm your email template assistant.\n\nDescribe the email you want to create and I'll generate production-ready HTML that works perfectly in Gmail, Outlook, and Yahoo.",
      timestamp: new Date(),
    },
  ]);
  const [aiCurrentTemplate, setAiCurrentTemplate] = useState<EmailTemplate | null>(null);

  const [stats, setStats] = useState({
    totalTemplates: preloadedTemplates.length,
    customTemplates: 0,
    emailsSent: 0,
    openRate: 0
  });

  const navigate = useNavigate();
  const location = useLocation();

  // Update stats when templates change
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
        const encryptedSession = CryptoJS.AES.encrypt(sessionId, "my_super_secret_client_key").toString();

        try {
          const response = await fetch(`${API_URL}/check-connection/${sessionId}`);
          if (response.ok) {
            const data = await response.json();

            if (data.is_connected) {
              const newConnection = {
                isConnected: true,
                email: data.email,
                accessToken: sessionId
              };
              setGmailConnection(newConnection);
              localStorage.setItem('secure_session', encryptedSession);

              // Clean URL and navigate to settings
              window.history.replaceState({}, '', '/');
              navigate('/settings');
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
            const bytes = CryptoJS.AES.decrypt(storedEncrypted, "my_super_secret_client_key");
            const decryptedSessionId = bytes.toString(CryptoJS.enc.Utf8);

            if (decryptedSessionId) {
              const response = await fetch(`${API_URL}/check-connection/${decryptedSessionId}`);
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
  }, [navigate]);

  // Template handlers
  const handleSelectTemplate = (template: EmailTemplate) => {
    setSelectedTemplate(template);
  };

  const handleEditTemplate = (template: EmailTemplate) => {
    setSelectedTemplate(template);
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
  };

  const handleGenerateTemplate = (template: EmailTemplate) => {
    // Check if template already exists (for modifications)
    const existingIndex = templates.findIndex(t => t.id === template.id);

    if (existingIndex !== -1) {
      // Update existing template
      setTemplates(prev => {
        const updated = [...prev];
        updated[existingIndex] = template;
        return updated;
      });
    } else {
      // Add new template
      setTemplates(prev => [...prev, template]);
    }

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
      if (gmailConnection.accessToken) {
        try {
          await fetch(`${API_URL}/disconnect/${gmailConnection.accessToken}`, { method: 'POST' });
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

  return (
    <Sidebar>
      <Routes>
        {/* Dashboard */}
        <Route
          path="/"
          element={<DashboardPage stats={stats} />}
        />

        {/* Templates */}
        <Route
          path="/templates"
          element={
            <TemplatesPage
              templates={templates}
              onSelectTemplate={handleSelectTemplate}
              onEditTemplate={handleEditTemplate}
              onDeleteTemplate={handleDeleteTemplate}
              onDuplicateTemplate={handleDuplicateTemplate}
            />
          }
        />

        {/* Template Editor */}
        <Route
          path="/templates/:id/edit"
          element={
            <TemplateEditorPage
              templates={templates}
              selectedTemplate={selectedTemplate}
              onSave={handleSaveTemplate}
            />
          }
        />

        {/* AI Generator */}
        <Route
          path="/ai-generator"
          element={
            <AIGeneratorPage
              onGenerateTemplate={handleGenerateTemplate}
              gmailConnection={gmailConnection}
              messages={aiMessages}
              setMessages={setAiMessages}
              currentTemplate={aiCurrentTemplate}
              setCurrentTemplate={setAiCurrentTemplate}
            />
          }
        />

        {/* Compose Email */}
        <Route
          path="/compose"
          element={
            <ComposePage
              templates={templates}
              selectedTemplate={selectedTemplate}
              gmailConnection={gmailConnection}
              onSend={handleSendEmail}
            />
          }
        />
        <Route
          path="/compose/:templateId"
          element={
            <ComposePage
              templates={templates}
              selectedTemplate={selectedTemplate}
              gmailConnection={gmailConnection}
              onSend={handleSendEmail}
            />
          }
        />

        {/* Settings */}
        <Route
          path="/settings"
          element={
            <SettingsPage
              gmailConnection={gmailConnection}
              onDisconnect={handleDisconnectGmail}
            />
          }
        />
      </Routes>
    </Sidebar>
  );
}
