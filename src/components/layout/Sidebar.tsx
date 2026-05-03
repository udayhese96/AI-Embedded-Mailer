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
    <div style={{ display: 'flex', minHeight: '100vh', background: 'linear-gradient(160deg, #f5f3ff 0%, #eff6ff 60%, #f8fafc 100%)' }}>
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
                    background: '#ffffff',
                    borderRight: '1px solid #ede9fe',
                    zIndex: 40,
                    transform: showSidebar ? 'translateX(0)' : 'translateX(-100%)',
                    transition: 'transform 0.2s ease-in-out',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                    boxShadow: '4px 0 24px rgba(124,58,237,0.07)',
                }}
            >
                {/* Logo area — full width, white background */}
                <div style={{
                    width: '100%',
                    height: 90,
                    flexShrink: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: '#ffffff',
                    borderBottom: '1px solid #ede9fe',
                    padding: '8px 12px',
                    boxSizing: 'border-box',
                }}>
                    <img
                        src="/Logo.png"
                        alt="Mailcraft AI"
                        style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'contain',
                            objectPosition: 'center',
                        }}
                    />
                </div>

                {/* Navigation */}
                <nav style={{ flex: 1, padding: 16, overflowY: 'auto' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        {navItems.map((item) => (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                end={item.path === '/'}
                                onClick={() => setIsSidebarOpen(false)}
                                style={({ isActive }) => ({
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 12,
                                    padding: '11px 14px',
                                    borderRadius: 10,
                                    textDecoration: 'none',
                                    transition: 'all 0.18s ease',
                                    background: isActive
                                        ? 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 60%, #2563eb 100%)'
                                        : 'transparent',
                                    color: isActive ? '#ffffff' : '#4b5563',
                                    fontWeight: isActive ? 600 : 400,
                                    fontSize: '0.9rem',
                                    boxShadow: isActive ? '0 4px 14px rgba(124,58,237,0.35)' : 'none',
                                })}
                            >
                                {({ isActive }) => (
                                    <>
                                        <span style={{
                                            width: 32, height: 32,
                                            borderRadius: 8,
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            background: isActive ? 'rgba(255,255,255,0.2)' : '#f3e8ff',
                                            flexShrink: 0,
                                            transition: 'background 0.18s',
                                        }}>
                                            <item.icon style={{ width: 16, height: 16, color: isActive ? '#fff' : '#7c3aed' }} />
                                        </span>
                                        <span>{item.label}</span>
                                    </>
                                )}
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
