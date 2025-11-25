import { useAuth } from '../context/AuthContext';

interface SidebarProps {
    activeView: 'board' | 'agenda' | 'calendar';
    onViewChange: (view: 'board' | 'agenda' | 'calendar') => void;
}

function Sidebar({ activeView, onViewChange }: SidebarProps) {
    const { user, logout } = useAuth();
    return (
        <div className="sidebar" style={{
            width: '240px',
            backgroundColor: 'var(--color-bg-elevated)',
            borderRight: '1px solid var(--color-border)',
            display: 'flex',
            flexDirection: 'column',
            padding: '1rem',
            height: '100vh',
            position: 'fixed',
            left: 0,
            top: 0,
            zIndex: 100
        }}>
            <div className="app-logo" style={{ marginBottom: '2rem', paddingLeft: '0.5rem' }}>
                <div className="app-logo-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                        <path d="M12 2L2 7L12 12L22 7L12 2Z" />
                        <path d="M2 17L12 22L22 17" opacity="0.7" />
                        <path d="M2 12L12 17L22 12" opacity="0.4" />
                    </svg>
                </div>
                <h1>Sunday</h1>
            </div>

            <nav className="sidebar-nav">
                <button
                    className={`sidebar-item ${activeView === 'board' ? 'active' : ''}`}
                    onClick={() => onViewChange('board')}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        width: '100%',
                        padding: '0.75rem 1rem',
                        border: 'none',
                        background: activeView === 'board' ? 'rgba(108, 99, 255, 0.1)' : 'transparent',
                        color: activeView === 'board' ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                        borderRadius: 'var(--radius-md)',
                        cursor: 'pointer',
                        marginBottom: '0.5rem',
                        textAlign: 'left',
                        fontSize: '0.95rem',
                        fontWeight: 500,
                        transition: 'all 0.2s'
                    }}
                >
                    <span style={{ marginRight: '0.75rem' }}>📋</span>
                    Board
                </button>

                <button
                    className={`sidebar-item ${activeView === 'agenda' ? 'active' : ''}`}
                    onClick={() => onViewChange('agenda')}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        width: '100%',
                        padding: '0.75rem 1rem',
                        border: 'none',
                        background: activeView === 'agenda' ? 'rgba(108, 99, 255, 0.1)' : 'transparent',
                        color: activeView === 'agenda' ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                        borderRadius: 'var(--radius-md)',
                        cursor: 'pointer',
                        marginBottom: '0.5rem',
                        textAlign: 'left',
                        fontSize: '0.95rem',
                        fontWeight: 500,
                        transition: 'all 0.2s'
                    }}
                >
                    <span style={{ marginRight: '0.75rem' }}>📅</span>
                    Agenda
                </button>

                <button
                    className={`sidebar-item ${activeView === 'calendar' ? 'active' : ''}`}
                    onClick={() => onViewChange('calendar')}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        width: '100%',
                        padding: '0.75rem 1rem',
                        border: 'none',
                        background: activeView === 'calendar' ? 'rgba(108, 99, 255, 0.1)' : 'transparent',
                        color: activeView === 'calendar' ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                        borderRadius: 'var(--radius-md)',
                        cursor: 'pointer',
                        marginBottom: '0.5rem',
                        textAlign: 'left',
                        fontSize: '0.95rem',
                        fontWeight: 500,
                        transition: 'all 0.2s'
                    }}
                >
                    <span style={{ marginRight: '0.75rem' }}>🗓️</span>
                    Calendar
                </button>
            </nav>

            <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--color-border)' }}>
                {user && (
                    <div style={{
                        padding: '0.75rem',
                        backgroundColor: 'rgba(108, 99, 255, 0.05)',
                        borderRadius: 'var(--radius-md)',
                        marginBottom: '0.5rem'
                    }}>
                        <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text)' }}>
                            {user.firstName} {user.lastName}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginTop: '0.25rem' }}>
                            {user.email}
                        </div>
                        {user.role === 'admin' && (
                            <div style={{
                                fontSize: '0.7rem',
                                color: 'var(--color-primary)',
                                marginTop: '0.25rem',
                                fontWeight: 600
                            }}>
                                Administrator
                            </div>
                        )}
                    </div>
                )}
                <button
                    onClick={logout}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        width: '100%',
                        padding: '0.75rem 1rem',
                        border: '1px solid var(--color-border)',
                        background: 'transparent',
                        color: 'var(--color-text-secondary)',
                        borderRadius: 'var(--radius-md)',
                        cursor: 'pointer',
                        fontSize: '0.95rem',
                        fontWeight: 500,
                        transition: 'all 0.2s'
                    }}
                >
                    <span style={{ marginRight: '0.75rem' }}>🚪</span>
                    Logout
                </button>
            </div>
        </div>
    );
}

export default Sidebar;
