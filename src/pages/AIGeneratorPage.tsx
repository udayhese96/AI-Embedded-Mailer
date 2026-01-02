import { useNavigate } from 'react-router-dom';
import { AIGeneratorV2 } from '../components/AIGeneratorV2';
import { EmailTemplate } from '../types/template';

interface AIGeneratorPageProps {
    onGenerateTemplate: (template: EmailTemplate) => void;
}

export function AIGeneratorPage({ onGenerateTemplate }: AIGeneratorPageProps) {
    const navigate = useNavigate();

    const handleBack = () => {
        navigate('/templates');
    };

    return (
        <AIGeneratorV2
            onGenerateTemplate={onGenerateTemplate}
            onBack={handleBack}
        />
    );
}
