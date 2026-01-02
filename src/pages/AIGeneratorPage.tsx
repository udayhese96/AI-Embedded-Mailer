import { useNavigate } from 'react-router-dom';
import { AIGeneratorV2 } from '../components/AIGeneratorV2';
import { EmailTemplate, GmailConnection } from '../types/template';

interface AIGeneratorPageProps {
    onGenerateTemplate: (template: EmailTemplate) => void;
    gmailConnection: GmailConnection;
}

export function AIGeneratorPage({ onGenerateTemplate, gmailConnection }: AIGeneratorPageProps) {
    const navigate = useNavigate();

    const handleBack = () => {
        navigate('/templates');
    };

    return (
        <AIGeneratorV2
            onGenerateTemplate={onGenerateTemplate}
            onBack={handleBack}
            gmailConnection={gmailConnection}
        />
    );
}
