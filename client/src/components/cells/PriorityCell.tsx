import { useMutation, useQueryClient } from '@tanstack/react-query';
import { cellsApi } from '../../api/boardsApi';
import type { PriorityOption } from '../../types/board.types';

interface PriorityCellProps {
    value: any;
    settings: any;
    itemId: string;
    columnId: string;
    boardId: string;
}

function PriorityCell({ value, settings, itemId, columnId, boardId }: PriorityCellProps) {
    const queryClient = useQueryClient();
    const options: PriorityOption[] = settings?.options || [];
    const currentPriority = value?.text || '';

    const updateMutation = useMutation({
        mutationFn: (newPriority: string) =>
            cellsApi.updateValue(itemId, columnId, { text: newPriority }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['board', boardId] });
        },
    });

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        updateMutation.mutate(e.target.value);
    };

    const currentOption = options.find((opt) => opt.label === currentPriority);

    return (
        <div className="cell">
            {currentPriority ? (
                <select
                    value={currentPriority}
                    onChange={handleChange}
                    className="priority-badge"
                    style={{
                        backgroundColor: currentOption?.color || '#6c63ff',
                        color: 'white',
                        fontWeight: 600,
                        border: 'none',
                        padding: '0.25rem 0.75rem',
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        cursor: 'pointer',
                    }}
                >
                    {options.map((option) => (
                        <option key={option.label} value={option.label}>
                            {option.label}
                        </option>
                    ))}
                </select>
            ) : (
                <select
                    value=""
                    onChange={handleChange}
                    style={{
                        backgroundColor: 'var(--color-bg-tertiary)',
                        color: 'var(--color-text-tertiary)',
                        border: '1px solid var(--color-border)',
                    }}
                >
                    <option value="">Select priority</option>
                    {options.map((option) => (
                        <option key={option.label} value={option.label}>
                            {option.label}
                        </option>
                    ))}
                </select>
            )}
        </div>
    );
}

export default PriorityCell;
