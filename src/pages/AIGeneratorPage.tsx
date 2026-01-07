import { useNavigate } from 'react-router-dom';
import { AIGeneratorV2 } from '../components/AIGeneratorV2';
import { EmailTemplate, GmailConnection } from '../types/template';

interface Message {
    role: 'user' | 'assistant';
    content: string;
    timestamp?: Date;
}

interface AIGeneratorPageProps {
    onGenerateTemplate: (template: EmailTemplate) => void;
    gmailConnection: GmailConnection;
    messages?: Message[];
    setMessages?: React.Dispatch<React.SetStateAction<Message[]>>;
    currentTemplate?: EmailTemplate | null;
    setCurrentTemplate?: React.Dispatch<React.SetStateAction<EmailTemplate | null>>;
}

export function AIGeneratorPage({
    onGenerateTemplate,
    gmailConnection,
    messages,
    setMessages,
    currentTemplate,
    setCurrentTemplate,
}: AIGeneratorPageProps) {
    const navigate = useNavigate();

    const handleBack = () => {
        navigate('/templates');
    };

    return (
        <AIGeneratorV2
            onGenerateTemplate={onGenerateTemplate}
            onBack={handleBack}
            gmailConnection={gmailConnection}
            persistedMessages={messages}
            setPersistedMessages={setMessages}
            persistedTemplate={currentTemplate}
            setPersistedTemplate={setCurrentTemplate}
        />
    );
}
