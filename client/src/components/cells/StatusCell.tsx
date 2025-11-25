import { useMutation, useQueryClient } from '@tanstack/react-query';
import { cellsApi } from '../../api/boardsApi';
import type { StatusOption } from '../../types/board.types';

interface StatusCellProps {
    value: any;
    settings: any;
    itemId: string;
    columnId: string;
    boardId: string;
}

function StatusCell({ value, settings, itemId, columnId, boardId }: StatusCellProps) {
    const queryClient = useQueryClient();
    const options: StatusOption[] = settings?.options || [];
    const currentStatus = value?.text || '';

    const updateMutation = useMutation({
        mutationFn: (newStatus: string) =>
            cellsApi.updateValue(itemId, columnId, { text: newStatus }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['board', boardId] });
        },
    });

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        updateMutation.mutate(e.target.value);
    };

    const currentOption = options.find((opt) => opt.label === currentStatus);

    return (
        <div className="cell">
            {currentStatus ? (
                <select
                    value={currentStatus}
                    onChange={handleChange}
                    style={{
                        backgroundColor: currentOption?.color || '#3b9eff',
                        color: 'white',
                        fontWeight: 600,
                        border: 'none',
                        padding: '0.25rem 0.75rem',
                        borderRadius: '8px',
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
                    <option value="">Select status</option>
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

export default StatusCell;
