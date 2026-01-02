import { useNavigate } from 'react-router-dom';
import { GmailIntegration } from '../components/GmailIntegration';
import { GmailConnection } from '../types/template';

interface SettingsPageProps {
    gmailConnection: GmailConnection;
    onDisconnect: () => void;
}

export function SettingsPage({ gmailConnection, onDisconnect }: SettingsPageProps) {
    const navigate = useNavigate();

    const handleBack = () => {
        navigate('/');
    };

    return (
        <GmailIntegration
            connection={gmailConnection}
            onDisconnect={onDisconnect}
            onBack={handleBack}
            onConnect={() => { }} // No-op, button handles redirect directly
        />
    );
}
