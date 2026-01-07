export interface EmailTemplate {
  id: string;
  name: string;
  category: 'welcome' | 'newsletter' | 'promotional' | 'follow-up' | 'custom';
  subject: string;
  html: string;
  thumbnail?: string;
  createdAt: Date;
  updatedAt: Date;
  isCustom: boolean;
}

export interface EmailDraft {
  to: string[];
  cc?: string[];
  bcc?: string[];
  subject: string;
  html: string;
  templateId?: string;
}

export interface GmailConnection {
  isConnected: boolean;
  email?: string;
  accessToken?: string;
}

export interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: Date;
}

export interface TemplateCheckpoint {
  id: string;
  templateId: string;
  version: number;
  html: string;
  userPrompt: string;
  timestamp: Date;
  label?: string;
}

export interface ChatSession {
  id: string;
  messages: Message[];
  currentTemplate: EmailTemplate | null;
  checkpoints: TemplateCheckpoint[];
  createdAt: Date;
  updatedAt: Date;
}
