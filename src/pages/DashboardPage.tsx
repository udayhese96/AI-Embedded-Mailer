import { Dashboard } from '../components/Dashboard';

interface DashboardPageProps {
    stats: {
        totalTemplates: number;
        customTemplates: number;
        emailsSent: number;
        openRate: number;
    };
}

export function DashboardPage({ stats }: DashboardPageProps) {
    return <Dashboard stats={stats} />;
}
