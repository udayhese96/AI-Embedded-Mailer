import React from 'react';
import { Mail, FileText, Zap, Send, TrendingUp, Users } from 'lucide-react';

interface DashboardProps {
  stats: {
    totalTemplates: number;
    customTemplates: number;
    emailsSent: number;
    openRate: number;
  };
}

export function Dashboard({ stats }: DashboardProps) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-gray-900 mb-2">Welcome to WebFudge Email Studio</h1>
        <p className="text-gray-600">Create, customize, and send professional email campaigns</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <FileText className="w-8 h-8 opacity-90" />
            <div className="bg-white/20 rounded-lg px-3 py-1">
              <span className="text-sm">Total</span>
            </div>
          </div>
          <div className="text-3xl mb-1">{stats.totalTemplates}</div>
          <div className="text-purple-100 text-sm">Email Templates</div>
        </div>

        <div className="bg-gradient-to-br from-pink-500 to-rose-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <Zap className="w-8 h-8 opacity-90" />
            <div className="bg-white/20 rounded-lg px-3 py-1">
              <span className="text-sm">Custom</span>
            </div>
          </div>
          <div className="text-3xl mb-1">{stats.customTemplates}</div>
          <div className="text-pink-100 text-sm">Custom Templates</div>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <Send className="w-8 h-8 opacity-90" />
            <div className="bg-white/20 rounded-lg px-3 py-1">
              <span className="text-sm">Sent</span>
            </div>
          </div>
          <div className="text-3xl mb-1">{stats.emailsSent}</div>
          <div className="text-blue-100 text-sm">Emails Sent</div>
        </div>

        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <TrendingUp className="w-8 h-8 opacity-90" />
            <div className="bg-white/20 rounded-lg px-3 py-1">
              <span className="text-sm">Rate</span>
            </div>
          </div>
          <div className="text-3xl mb-1">{stats.openRate}%</div>
          <div className="text-emerald-100 text-sm">Open Rate</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Mail className="w-5 h-5 text-purple-600" />
            </div>
            <div className="text-left">
              <div className="text-gray-900">New Email</div>
              <div className="text-sm text-gray-500">Compose from template</div>
            </div>
          </button>

          <button className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg hover:border-pink-500 hover:bg-pink-50 transition-colors">
            <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-pink-600" />
            </div>
            <div className="text-left">
              <div className="text-gray-900">AI Generator</div>
              <div className="text-sm text-gray-500">Create with AI</div>
            </div>
          </button>

          <button className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <div className="text-left">
              <div className="text-gray-900">Templates</div>
              <div className="text-sm text-gray-500">Browse library</div>
            </div>
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-gray-900 mb-4">Recent Activity</h2>
        <div className="space-y-4">
          <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <Send className="w-5 h-5 text-green-600" />
            </div>
            <div className="flex-1">
              <div className="text-gray-900">Welcome Email sent</div>
              <div className="text-sm text-gray-500">2 hours ago</div>
            </div>
          </div>
          <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
              <FileText className="w-5 h-5 text-purple-600" />
            </div>
            <div className="flex-1">
              <div className="text-gray-900">New template created</div>
              <div className="text-sm text-gray-500">5 hours ago</div>
            </div>
          </div>
          <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <div className="text-gray-900">Newsletter campaign sent</div>
              <div className="text-sm text-gray-500">1 day ago</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
