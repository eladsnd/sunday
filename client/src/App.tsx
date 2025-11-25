import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { boardsApi } from './api/boardsApi';
import BoardView from './components/BoardView';
import Sidebar from './components/Sidebar';
import AgendaView from './components/AgendaView';
import CalendarView from './components/CalendarView';

function App() {
    const [boardId, setBoardId] = useState<string | null>(null);
    const [activeView, setActiveView] = useState<'board' | 'agenda' | 'calendar'>('board');

    // Get all boards
    const { data: boards } = useQuery({
        queryKey: ['boards'],
        queryFn: async () => {
            const response = await boardsApi.getAll();
            return response.data;
        },
    });

    // Auto-select first board or seed if no boards exist
    useEffect(() => {
        if (boards && boards.length > 0) {
            setBoardId(boards[0].id);
        } else if (boards && boards.length === 0) {
            // Seed the job search board
            boardsApi.seedJobSearch().then((response) => {
                setBoardId(response.data.id);
                window.location.reload(); // Reload to fetch the new board
            });
        }
    }, [boards]);

    return (
        <div className="app" style={{ display: 'flex' }}>
            <Sidebar activeView={activeView} onViewChange={setActiveView} />

            <div className="main-content" style={{ marginLeft: '240px', flex: 1, width: 'calc(100% - 240px)' }}>
                {activeView === 'board' && (
                    <>
                        <header className="app-header" style={{ left: '240px', width: 'calc(100% - 240px)' }}>
                            <div className="app-header-content">
                                <div className="app-logo">
                                    <div className="app-logo-icon">📋</div>
                                    <h1>Sunday</h1>
                                </div>
                            </div>
                        </header>

                        <main className="board-container" style={{ marginTop: '60px' }}>
                            {boardId ? (
                                <BoardView boardId={boardId} />
                            ) : (
                                <div className="loading-container">
                                    <div className="loading-spinner"></div>
                                    <p className="text-muted">Loading your board...</p>
                                </div>
                            )}
                        </main>
                    </>
                )}

                {activeView === 'agenda' && boardId && (
                    <AgendaView boardId={boardId} />
                )}

                {activeView === 'calendar' && boardId && (
                    <CalendarView boardId={boardId} />
                )}
            </div>
        </div>
    );
}

export default App;
