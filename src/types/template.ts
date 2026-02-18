export interface EmailTemplate {
  id: string;
  name: string; // specialized/mapped from subject or separate field? Backend has subject. Let's map subject->name for now or add subject to this interface
  category: string;
  subject: string;
  description?: string;
  html: string; // mapped from template_code
  thumbnail?: string;
  createdAt: Date;
  updatedAt?: Date;
  isCustom?: boolean; // kept for compatibility, default true for DB templates
  visibility?: 'public' | 'private';
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
