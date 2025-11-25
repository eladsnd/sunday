import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { itemsApi } from '../api/boardsApi';
import type { Board } from '../types/board.types';

import AutomationsModal from './AutomationsModal';

interface BoardHeaderProps {
    board: Board;
    onRefresh: () => void;
}

function BoardHeader({ board, onRefresh }: BoardHeaderProps) {
    const queryClient = useQueryClient();
    const [isAddingItem, setIsAddingItem] = useState(false);
    const [newItemName, setNewItemName] = useState('');
    const [isAutomationsOpen, setIsAutomationsOpen] = useState(false);

    const createItemMutation = useMutation({
        mutationFn: (data: { name: string; groupId: string; boardId: string }) =>
            itemsApi.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['board', board.id] });
            setNewItemName('');
            setIsAddingItem(false);
        },
    });

    const handleAddItem = () => {
        if (newItemName.trim() && board.groups.length > 0) {
            createItemMutation.mutate({
                name: newItemName.trim(),
                groupId: board.groups[0].id,
                boardId: board.id,
            });
        }
    };

    return (
        <>
            <div className="board-header">
                <div className="board-header-top">
                    <div>
                        <h2 className="board-title">{board.name}</h2>
                        {board.description && (
                            <p className="board-description">{board.description}</p>
                        )}
                    </div>
                    <div className="board-actions">
                        {isAddingItem ? (
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <input
                                    type="text"
                                    placeholder="Enter item name..."
                                    value={newItemName}
                                    onChange={(e) => setNewItemName(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') handleAddItem();
                                        if (e.key === 'Escape') setIsAddingItem(false);
                                    }}
                                    autoFocus
                                    style={{ width: '250px' }}
                                />
                                <button className="btn btn-primary" onClick={handleAddItem}>
                                    Add
                                </button>
                                <button
                                    className="btn btn-secondary"
                                    onClick={() => setIsAddingItem(false)}
                                >
                                    Cancel
                                </button>
                            </div>
                        ) : (
                            <>
                                <button
                                    className="btn btn-primary"
                                    onClick={() => setIsAddingItem(true)}
                                >
                                    + New Item
                                </button>
                                <button
                                    className="btn btn-secondary"
                                    onClick={() => setIsAutomationsOpen(true)}
                                >
                                    ⚡ Automations
                                </button>
                                <button className="btn btn-secondary" onClick={onRefresh}>
                                    ↻ Refresh
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>
            <AutomationsModal
                board={board}
                isOpen={isAutomationsOpen}
                onClose={() => setIsAutomationsOpen(false)}
            />
        </>
    );
}

export default BoardHeader;
