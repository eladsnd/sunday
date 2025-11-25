import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { boardsApi } from './api/boardsApi';
import BoardView from './components/BoardView';

function App() {
    const [boardId, setBoardId] = useState<string | null>(null);

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
        <div className="app">
            <header className="app-header">
                <div className="app-header-content">
                    <div className="app-logo">
                        <div className="app-logo-icon">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                                <path d="M12 2L2 7L12 12L22 7L12 2Z" />
                                <path d="M2 17L12 22L22 17" opacity="0.7" />
                                <path d="M2 12L12 17L22 12" opacity="0.4" />
                            </svg>
                        </div>
                        <h1>Sunday</h1>
                    </div>
                    <div className="app-logo">
                        <span className="text-muted">Work OS</span>
                    </div>
                </div>
            </header>

            <main className="board-container">
                {boardId ? (
                    <BoardView boardId={boardId} />
                ) : (
                    <div className="loading-container">
                        <div className="loading-spinner"></div>
                        <p className="text-muted">Loading your board...</p>
                    </div>
                )}
            </main>
        </div>
    );
}

export default App;
