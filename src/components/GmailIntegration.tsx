import React, { useState } from 'react';
import { GmailConnection } from '../types/template';
import { Mail, CheckCircle, AlertCircle, Link2, Settings, ArrowLeft, Info } from 'lucide-react';

interface GmailIntegrationProps {
  connection: GmailConnection;
  onConnect: (email: string) => void;
  onDisconnect: () => void;
  onBack: () => void;
}

export function GmailIntegration({ connection, onConnect, onDisconnect, onBack }: GmailIntegrationProps) {
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnect = () => {
    // Redirect to Backend OAuth endpoint
    window.location.href = "http://127.0.0.1:8000/connect/google";
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
          <h1 className="text-gray-900">Gmail Integration</h1>
          <p className="text-sm text-gray-500">Connect your Gmail account to send emails</p>
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <div className="flex gap-4">
          <Info className="w-6 h-6 text-blue-600 flex-shrink-0" />
          <div>
            <h3 className="text-blue-900 mb-2">About Gmail Integration</h3>
            <p className="text-sm text-blue-800 mb-3">
              Connect your Gmail account to send professional emails directly from WebFudge Email Studio.
              Your credentials are secure and we only request necessary permissions.
            </p>
            <div className="text-sm text-blue-800 space-y-1">
              <div>✓ Send emails using your Gmail account</div>
              <div>✓ Track email delivery status</div>
              <div>✓ Maintain your professional email signature</div>
              <div>✓ OAuth 2.0 secure authentication</div>
            </div>
          </div>
        </div>
      </div>

      {/* Connection Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Current Status Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
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
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-gray-900 mb-4 flex items-center gap-2">
            <Link2 className="w-5 h-5" />
            {connection.isConnected ? 'Switch Account' : 'Connect Account'}
          </h3>

          <div className="space-y-4">
            <button
              onClick={handleConnect}
              disabled={isConnecting}
              className="w-full flex items-center justify-center gap-2 bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
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
              Allow WebFudge to send emails on your behalf using OAuth 2.0
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
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
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
