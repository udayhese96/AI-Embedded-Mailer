import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard,
    FileText,
    Sparkles,
    Mail,
    Settings,
    Menu,
    X,
    LucideIcon
} from 'lucide-react';
import { useState, useEffect } from 'react';

interface NavItem {
    path: string;
    label: string;
    icon: LucideIcon;
}

const navItems: NavItem[] = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/templates', label: 'Templates', icon: FileText },
    { path: '/ai-generator', label: 'AI Generator', icon: Sparkles },
    { path: '/compose', label: 'Compose Email', icon: Mail },
    { path: '/settings', label: 'Gmail Settings', icon: Settings },
];

interface SidebarProps {
    children: React.ReactNode;
}

const SIDEBAR_WIDTH = 256;

export function Sidebar({ children }: SidebarProps) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isDesktop, setIsDesktop] = useState(false);

    // Check if we're on desktop
    useEffect(() => {
        const checkDesktop = () => {
            setIsDesktop(window.innerWidth >= 1024);
        };

        checkDesktop();
        window.addEventListener('resize', checkDesktop);
        return () => window.removeEventListener('resize', checkDesktop);
    }, []);

    // Show sidebar on desktop, or when mobile menu is open
    const showSidebar = isDesktop || isSidebarOpen;

    return (
        <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f9fafb' }}>
            {/* Mobile Menu Button - only visible on mobile */}
            {!isDesktop && (
                <button
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    style={{
                        position: 'fixed',
                        top: 16,
                        left: 16,
                        zIndex: 50,
                        padding: 8,
                        backgroundColor: '#ffffff',
                        borderRadius: 8,
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                        border: 'none',
                        cursor: 'pointer',
                    }}
                >
                    {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
            )}

            {/* Sidebar */}
            <aside
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: SIDEBAR_WIDTH,
                    height: '100vh',
                    backgroundColor: '#ffffff',
                    borderRight: '1px solid #e5e7eb',
                    zIndex: 40,
                    transform: showSidebar ? 'translateX(0)' : 'translateX(-100%)',
                    transition: 'transform 0.2s ease-in-out',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                }}
            >
                {/* Logo */}
                <div style={{ padding: 16, borderBottom: '1px solid #e5e7eb', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <img
                        src="/Logo.png"
                        alt="Logo"
                        style={{ maxWidth: '100%', maxHeight: 64, objectFit: 'contain' }}
                    />
                </div>

                {/* Navigation */}
                <nav style={{ flex: 1, padding: 16, overflowY: 'auto' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        {navItems.map((item) => (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                onClick={() => setIsSidebarOpen(false)}
                                style={({ isActive }) => ({
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 12,
                                    padding: '12px 16px',
                                    borderRadius: 8,
                                    textDecoration: 'none',
                                    transition: 'all 0.2s',
                                    backgroundColor: isActive ? '#f3e8ff' : 'transparent',
                                    color: isActive ? '#7c3aed' : '#374151',
                                    fontWeight: isActive ? 500 : 400,
                                })}
                            >
                                <item.icon style={{ width: 20, height: 20 }} />
                                <span>{item.label}</span>
                            </NavLink>
                        ))}
                    </div>
                </nav>


            </aside>

            {/* Mobile Sidebar Overlay */}
            {!isDesktop && isSidebarOpen && (
                <div
                    onClick={() => setIsSidebarOpen(false)}
                    style={{
                        position: 'fixed',
                        inset: 0,
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                        zIndex: 30,
                    }}
                />
            )}

            {/* Main Content */}
            <main
                style={{
                    flex: 1,
                    minHeight: '100vh',
                    marginLeft: isDesktop ? SIDEBAR_WIDTH : 0,
                    transition: 'margin-left 0.2s ease-in-out',
                }}
            >
                <div style={{ padding: isDesktop ? 32 : 24, maxWidth: 1280, margin: '0 auto' }}>
                    {children}
                </div>
            </main>
        </div>
    );
}
