import React, { useState } from 'react';
import { GmailConnection } from '../types/template';
import { Mail, CheckCircle, AlertCircle, Link2, Settings, ArrowLeft, Info, Plus } from 'lucide-react';
import { API_URL } from '../config/api';
import { AddTemplateForm } from './AddTemplateForm';

interface GmailIntegrationProps {
  connection: GmailConnection;
  onConnect: (email: string) => void;
  onDisconnect: () => void;
  onBack: () => void;
}

export function GmailIntegration({ connection, onConnect, onDisconnect, onBack }: GmailIntegrationProps) {
  const [isConnecting, setIsConnecting] = useState(false);
  const [showTemplateForm, setShowTemplateForm] = useState(false);

  const handleConnect = () => {
    // Redirect to Backend OAuth endpoint
    window.location.href = `${API_URL}/connect/google`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>
        <div>
          <h1 className="text-gray-900">Gmail Integration & Settings</h1>
          <p className="text-sm text-gray-500">Manage connections and templates</p>
        </div>
      </div>

      {/* Info Banner */}
      <div style={{ background: 'linear-gradient(135deg, #faf5ff 0%, #eff6ff 100%)', border: '1.5px solid #c4b5fd', borderRadius: '1rem', padding: '1.5rem' }}>
        <div className="flex gap-4">
          <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#ede9fe', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Info style={{ width: 18, height: 18, color: '#7c3aed' }} />
          </div>
          <div>
            <h3 style={{ color: '#4c1d95', marginBottom: 8 }}>About Gmail Integration</h3>
            <p className="text-sm" style={{ color: '#5b21b6', marginBottom: 12 }}>
              Connect your Gmail account to send professional emails directly from Mailcraft AI Email Studio.
              Your credentials are secure and we only request necessary permissions.
            </p>
            <div className="text-sm space-y-1" style={{ color: '#6d28d9' }}>
              <div>✓ Send emails using your Gmail account</div>
              <div>✓ Track email delivery status</div>
              <div>✓ Maintain your professional email signature</div>
              <div>✓ OAuth 2.0 secure authentication</div>
            </div>
          </div>
        </div>
      </div>

      {/* Template Management Section */}
      {showTemplateForm ? (
        <AddTemplateForm
          onCancel={() => setShowTemplateForm(false)}
          onSuccess={() => setShowTemplateForm(false)}
        />
      ) : (
        <div style={{ background: '#fff', borderRadius: '1rem', border: '1.5px solid #ede9fe', boxShadow: '0 2px 12px rgba(124,58,237,0.07)', padding: '1.5rem', display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
          <div>
            <h3 style={{ color: '#1e1b4b', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Settings style={{ width: 18, height: 18, color: '#7c3aed' }} />
              Template Management
            </h3>
            <p className="text-sm" style={{ color: '#9ca3af' }}>Add new email templates to the system database</p>
          </div>
          <button
            onClick={() => setShowTemplateForm(true)}
            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0.55rem 1.1rem', background: 'linear-gradient(135deg, #7c3aed, #2563eb)', color: '#fff', border: 'none', borderRadius: '0.7rem', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', boxShadow: '0 4px 12px rgba(124,58,237,0.3)' }}
          >
            <Plus style={{ width: 16, height: 16 }} />
            Add New Template
          </button>
        </div>
      )}

      {/* Connection Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Current Status Card */}
        <div style={{ background: '#fff', borderRadius: '1rem', border: '1.5px solid #ede9fe', boxShadow: '0 2px 12px rgba(124,58,237,0.07)', padding: '1.5rem' }}>
          <h3 className="text-gray-900 mb-4 flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Connection Status
          </h3>

          {connection.isConnected ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
                <div className="flex-1">
                  <div className="text-green-900">Connected</div>
                  <div className="text-sm text-green-700">{connection.email}</div>
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t border-gray-200">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Status:</span>
                  <span className="text-green-600">Active</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Account Type:</span>
                  <span className="text-gray-900">Gmail</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Permissions:</span>
                  <span className="text-gray-900">Send Email</span>
                </div>
              </div>

              <button
                onClick={onDisconnect}
                className="w-full mt-4 px-4 py-3 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
              >
                Disconnect Gmail
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <AlertCircle className="w-6 h-6 text-yellow-600" />
                <div className="flex-1">
                  <div className="text-yellow-900">Not Connected</div>
                  <div className="text-sm text-yellow-700">Connect your Gmail to start sending</div>
                </div>
              </div>

              <p className="text-sm text-gray-600">
                You need to connect a Gmail account to send emails from this platform.
              </p>
            </div>
          )}
        </div>

        {/* Connect New Account Card */}
        <div style={{ background: '#fff', borderRadius: '1rem', border: '1.5px solid #ede9fe', boxShadow: '0 2px 12px rgba(124,58,237,0.07)', padding: '1.5rem' }}>
          <h3 className="text-gray-900 mb-4 flex items-center gap-2">
            <Link2 className="w-5 h-5" />
            {connection.isConnected ? 'Switch Account' : 'Connect Account'}
          </h3>

          <div className="space-y-4">
            <button
              onClick={handleConnect}
              disabled={isConnecting}
              style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: 'linear-gradient(135deg, #7c3aed, #2563eb)', color: '#fff', padding: '0.85rem 1.5rem', borderRadius: '0.75rem', border: 'none', fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer', boxShadow: '0 6px 18px rgba(124,58,237,0.35)', transition: 'opacity 0.2s' }}
            >
              {isConnecting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <Mail className="w-5 h-5" />
                  Connect Gmail Account
                </>
              )}
            </button>

            <div className="text-xs text-gray-500 space-y-2 pt-4 border-t border-gray-200">
              <p className="flex items-start gap-2">
                <span className="text-gray-400">🔒</span>
                <span>In production, this initiates Google OAuth 2.0 authentication flow.</span>
              </p>
              <p className="flex items-start gap-2">
                <span className="text-gray-400">ℹ️</span>
                <span>We only request permissions to send emails on your behalf. We never store your password.</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div style={{ background: '#fff', borderRadius: '1rem', border: '1.5px solid #ede9fe', boxShadow: '0 2px 12px rgba(124,58,237,0.07)', padding: '1.5rem' }}>
        <h3 className="text-gray-900 mb-4">How Gmail Integration Works</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-purple-600">1</span>
            </div>
            <h4 className="text-gray-900 mb-2">Authenticate</h4>
            <p className="text-sm text-gray-600">
              Click "Connect Gmail Account" and sign in with your Google account
            </p>
          </div>

          <div className="text-center p-4">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-purple-600">2</span>
            </div>
            <h4 className="text-gray-900 mb-2">Grant Permission</h4>
            <p className="text-sm text-gray-600">
              Allow Mailcraft AI to send emails on your behalf using OAuth 2.0
            </p>
          </div>

          <div className="text-center p-4">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-purple-600">3</span>
            </div>
            <h4 className="text-gray-900 mb-2">Start Sending</h4>
            <p className="text-sm text-gray-600">
              Create and send professional emails using your connected Gmail account
            </p>
          </div>
        </div>
      </div>

      {/* Technical Requirements (Demo Note) */}
      <div style={{ background: 'linear-gradient(135deg, #faf5ff, #eff6ff)', border: '1.5px solid #ede9fe', borderRadius: '1rem', padding: '1.5rem' }}>
        <h3 className="text-gray-900 mb-3">Technical Implementation Note</h3>
        <p className="text-sm text-gray-600 mb-3">
          This is a frontend demo. In a production environment, Gmail integration would require:
        </p>
        <ul className="text-sm text-gray-600 space-y-2">
          <li className="flex items-start gap-2">
            <span className="text-purple-600">•</span>
            <span>Backend server to handle OAuth 2.0 authentication flow</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-purple-600">•</span>
            <span>Google Cloud Project with Gmail API enabled</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-purple-600">•</span>
            <span>Secure storage of OAuth tokens (recommended: Supabase or similar)</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-purple-600">•</span>
            <span>Server-side email sending using Gmail API or SMTP</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
