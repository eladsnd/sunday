import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { cellsApi } from '../../api/boardsApi';

interface LinkCellProps {
    value: any;
    itemId: string;
    columnId: string;
    boardId: string;
}

function LinkCell({ value, itemId, columnId, boardId }: LinkCellProps) {
    const queryClient = useQueryClient();
    const [isEditing, setIsEditing] = useState(false);
    const [editValue, setEditValue] = useState(value?.text || '');

    const updateMutation = useMutation({
        mutationFn: (newValue: string) =>
            cellsApi.updateValue(itemId, columnId, { text: newValue }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['board', boardId] });
            setIsEditing(false);
        },
    });

    const handleSave = () => {
        if (editValue !== (value?.text || '')) {
            updateMutation.mutate(editValue);
        } else {
            setIsEditing(false);
        }
    };

    if (isEditing) {
        return (
            <input
                type="text"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onBlur={handleSave}
                onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSave();
                    if (e.key === 'Escape') {
                        setEditValue(value?.text || '');
                        setIsEditing(false);
                    }
                }}
                placeholder="https://..."
                autoFocus
                style={{ width: '100%' }}
            />
        );
    }

    return (
        <div className="cell cell-editable" onClick={() => setIsEditing(true)}>
            {value?.text ? (
                <a
                    href={value.text}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="cell-link"
                    onClick={(e) => e.stopPropagation()}
                >
                    🔗 Link
                </a>
            ) : (
                <span className="cell-empty">Add link</span>
            )}
        </div>
    );
}

export default LinkCell;
