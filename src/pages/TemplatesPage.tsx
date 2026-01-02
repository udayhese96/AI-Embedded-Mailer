import { useNavigate } from 'react-router-dom';
import { TemplateLibrary } from '../components/TemplateLibrary';
import { EmailTemplate } from '../types/template';

interface TemplatesPageProps {
    templates: EmailTemplate[];
    onSelectTemplate: (template: EmailTemplate) => void;
    onEditTemplate: (template: EmailTemplate) => void;
    onDeleteTemplate: (templateId: string) => void;
    onDuplicateTemplate: (template: EmailTemplate) => void;
}

export function TemplatesPage({
    templates,
    onSelectTemplate,
    onEditTemplate,
    onDeleteTemplate,
    onDuplicateTemplate,
}: TemplatesPageProps) {
    const navigate = useNavigate();

    const handleSelectTemplate = (template: EmailTemplate) => {
        onSelectTemplate(template);
        navigate(`/compose/${template.id}`);
    };

    const handleEditTemplate = (template: EmailTemplate) => {
        onEditTemplate(template);
        navigate(`/templates/${template.id}/edit`);
    };

    return (
        <TemplateLibrary
            templates={templates}
            onSelectTemplate={handleSelectTemplate}
            onEditTemplate={handleEditTemplate}
            onDeleteTemplate={onDeleteTemplate}
            onDuplicateTemplate={onDuplicateTemplate}
        />
    );
}
