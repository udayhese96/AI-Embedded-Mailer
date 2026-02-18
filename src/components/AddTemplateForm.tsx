
import React, { useState } from 'react';
import { Save, X, BookTemplate } from 'lucide-react';
import { API_URL } from '../config/api';

interface AddTemplateFormProps {
    onCancel: () => void;
    onSuccess: () => void;
}

export function AddTemplateForm({ onCancel, onSuccess }: AddTemplateFormProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        subject: '',
        description: '',
        templateCode: '',
        category: 'general',
        visibility: 'public'
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        setSuccess(null);

        try {
            const data = new FormData();
            data.append('subject', formData.subject);
            data.append('description', formData.description);
            data.append('template_code', formData.templateCode);
            data.append('category', formData.category);
            data.append('visibility', formData.visibility);

            const response = await fetch(`${API_URL}/save-template`, {
                method: 'POST',
                body: data,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Failed to save template');
            }

            setSuccess('Template saved successfully!');
            setTimeout(() => {
                onSuccess();
            }, 1500);

            // Clear form
            setFormData({
                subject: '',
                description: '',
                templateCode: '',
                category: 'general',
                visibility: 'public'
            });

        } catch (err: any) {
            setError(err.message || 'An unexpected error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-gray-900 flex items-center gap-2 text-lg font-medium">
                    <BookTemplate className="w-5 h-5 text-purple-600" />
                    Add New Template
                </h3>
                <button
                    onClick={onCancel}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>

            {error && (
                <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm border border-red-200">
                    {error}
                </div>
            )}

            {success && (
                <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-lg text-sm border border-green-200">
                    {success}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Subject Line
                    </label>
                    <input
                        type="text"
                        name="subject"
                        required
                        value={formData.subject}
                        onChange={handleChange}
                        placeholder="e.g., Welcome to our service"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description
                    </label>
                    <textarea
                        name="description"
                        required
                        value={formData.description}
                        onChange={handleChange}
                        placeholder="Describe what this template is for (used for AI search)"
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Category
                        </label>
                        <select
                            name="category"
                            value={formData.category}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                        >
                            <option value="general">General</option>
                            <option value="marketing">Marketing</option>
                            <option value="newsletter">Newsletter</option>
                            <option value="onboarding">Onboarding</option>
                            <option value="sales">Sales</option>
                            <option value="support">Support</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Visibility
                        </label>
                        <select
                            name="visibility"
                            value={formData.visibility}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                        >
                            <option value="public">Public (Everyone)</option>
                            <option value="private">Private (Only Me)</option>
                        </select>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        HTML Code
                    </label>
                    <textarea
                        name="templateCode"
                        required
                        value={formData.templateCode}
                        onChange={handleChange}
                        placeholder="Paste your HTML code here..."
                        rows={8}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all font-mono text-sm"
                    />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="flex items-center gap-2 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save className="w-4 h-4" />
                                Save Template
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
