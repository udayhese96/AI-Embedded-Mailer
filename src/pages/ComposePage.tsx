import { useNavigate, useParams } from 'react-router-dom';
import { EmailComposer } from '../components/EmailComposer';
import { EmailTemplate, EmailDraft, GmailConnection } from '../types/template';

interface ComposePageProps {
    templates: EmailTemplate[];
    selectedTemplate: EmailTemplate | null;
    gmailConnection: GmailConnection;
    onSend: (draft: EmailDraft) => void;
}

export function ComposePage({
    templates,
    selectedTemplate,
    gmailConnection,
    onSend,
}: ComposePageProps) {
    const navigate = useNavigate();
    const { templateId } = useParams<{ templateId: string }>();

    // Find template by ID from URL params, or use selected template
    const template = templateId
        ? templates.find(t => t.id === templateId) || selectedTemplate
        : selectedTemplate;

    const handleBack = () => {
        navigate('/templates');
    };

    return (
        <EmailComposer
            template={template}
            gmailConnection={gmailConnection}
            onBack={handleBack}
            onSend={onSend}
        />
    );
}
