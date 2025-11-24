import { useMutation, useQueryClient } from '@tanstack/react-query';
import { itemsApi } from '../api/boardsApi';
import type { Item, BoardColumn } from '../types/board.types';
import CellRenderer from './cells/CellRenderer';

interface TableRowProps {
    item: Item;
    columns: BoardColumn[];
    boardId: string;
}

function TableRow({ item, columns, boardId }: TableRowProps) {
    const queryClient = useQueryClient();

    const deleteItemMutation = useMutation({
        mutationFn: (itemId: string) => itemsApi.delete(itemId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['board', boardId] });
        },
    });

    const handleDelete = () => {
        if (confirm(`Delete "${item.name}"?`)) {
            deleteItemMutation.mutate(item.id);
        }
    };

    return (
        <tr>
            <td style={{ fontWeight: 500 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>{item.name}</span>
                    <button
                        onClick={handleDelete}
                        className="btn-secondary"
                        style={{
                            padding: '0.25rem 0.5rem',
                            fontSize: '0.75rem',
                            opacity: 0.7,
                        }}
                        title="Delete item"
                    >
                        ✕
                    </button>
                </div>
            </td>
            {columns.map((column) => {
                const cellValue = item.cellValues.find(
                    (cv) => cv.columnId === column.id
                );
                return (
                    <td key={column.id}>
                        <CellRenderer
                            column={column}
                            cellValue={cellValue}
                            itemId={item.id}
                            boardId={boardId}
                        />
                    </td>
                );
            })}
        </tr>
    );
}

export default TableRow;
