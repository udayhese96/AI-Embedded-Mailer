import { useNavigate, useParams } from 'react-router-dom';
import { TemplateEditor } from '../components/TemplateEditor';
import { EmailTemplate } from '../types/template';

interface TemplateEditorPageProps {
    templates: EmailTemplate[];
    selectedTemplate: EmailTemplate | null;
    onSave: (template: EmailTemplate) => void;
}

export function TemplateEditorPage({
    templates,
    selectedTemplate,
    onSave,
}: TemplateEditorPageProps) {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();

    // Find template by ID from URL params, or use selected template
    const template = id
        ? templates.find(t => t.id === id) || selectedTemplate
        : selectedTemplate;

    const handleSave = (savedTemplate: EmailTemplate) => {
        onSave(savedTemplate);
        navigate('/templates');
    };

    const handleBack = () => {
        navigate('/templates');
    };

    return (
        <TemplateEditor
            template={template}
            onSave={handleSave}
            onBack={handleBack}
        />
    );
}
