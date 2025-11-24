import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { cellsApi } from '../../api/boardsApi';
import { format } from 'date-fns';

interface DateCellProps {
    value: any;
    itemId: string;
    columnId: string;
    boardId: string;
}

function DateCell({ value, itemId, columnId, boardId }: DateCellProps) {
    const queryClient = useQueryClient();
    const [isEditing, setIsEditing] = useState(false);
    const currentDate = value?.text || '';

    const updateMutation = useMutation({
        mutationFn: (newDate: string) =>
            cellsApi.updateValue(itemId, columnId, { text: newDate }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['board', boardId] });
            setIsEditing(false);
        },
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        updateMutation.mutate(e.target.value);
    };

    if (isEditing) {
        return (
            <input
                type="date"
                value={currentDate}
                onChange={handleChange}
                onBlur={() => setIsEditing(false)}
                autoFocus
                style={{ width: '100%' }}
            />
        );
    }

    return (
        <div className="cell cell-editable" onClick={() => setIsEditing(true)}>
            {currentDate ? (
                <span className="cell-date">
                    {format(new Date(currentDate), 'MMM dd, yyyy')}
                </span>
            ) : (
                <span className="cell-empty">Select date</span>
            )}
        </div>
    );
}

export default DateCell;
