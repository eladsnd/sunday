import { useQuery, useQueryClient } from '@tanstack/react-query';
import { boardsApi } from '../api/boardsApi';
import BoardHeader from './BoardHeader';
import BoardTable from './BoardTable';

interface BoardViewProps {
    boardId: string;
}

function BoardView({ boardId }: BoardViewProps) {
    const queryClient = useQueryClient();

    const { data: board, isLoading, error } = useQuery({
        queryKey: ['board', boardId],
        queryFn: async () => {
            const response = await boardsApi.getOne(boardId);
            return response.data;
        },
    });

    const handleRefresh = () => {
        queryClient.invalidateQueries({ queryKey: ['board', boardId] });
    };

    if (isLoading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p className="text-muted">Loading board data...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="error-container">
                <p className="error-message">Failed to load board</p>
                <button className="btn btn-primary" onClick={handleRefresh}>
                    Retry
                </button>
            </div>
        );
    }

    if (!board) {
        return null;
    }

    return (
        <div>
            <BoardHeader board={board} onRefresh={handleRefresh} />
            <BoardTable board={board} />
        </div>
    );
}

export default BoardView;
