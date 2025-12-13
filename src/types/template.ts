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
