import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { cellsApi } from '../../api/boardsApi';

interface TextCellProps {
    value: any;
    itemId: string;
    columnId: string;
    boardId: string;
}

function TextCell({ value, itemId, columnId, boardId }: TextCellProps) {
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
                autoFocus
                style={{ width: '100%' }}
            />
        );
    }

    return (
        <div className="cell cell-editable" onClick={() => setIsEditing(true)}>
            {value?.text ? (
                <span className="cell-text">{value.text}</span>
            ) : (
                <span className="cell-empty">Click to add</span>
            )}
        </div>
    );
}

export default TextCell;
