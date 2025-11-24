import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useDraggable } from '@dnd-kit/core';
import { itemsApi } from '../api/boardsApi';
import type { Item, BoardColumn } from '../types/board.types';
import CellRenderer from './cells/CellRenderer';

interface TableRowProps {
    item: Item;
    columns: BoardColumn[];
    boardId: string;
    isDragging?: boolean;
}

function TableRow({ item, columns, boardId, isDragging = false }: TableRowProps) {
    const queryClient = useQueryClient();

    // Make the row draggable
    const { attributes, listeners, setNodeRef: setDragRef, transform } = useDraggable({
        id: item.id,
        data: {
            type: 'item',
            item,
        },
    });

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

    const style = transform
        ? {
            transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
            opacity: isDragging ? 0.5 : 1,
        }
        : {
            opacity: isDragging ? 0.5 : 1,
        };

    return (
        <tr ref={setDragRef} style={style}>
            <td style={{ fontWeight: 500 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        {/* Drag handle */}
                        <span
                            {...listeners}
                            {...attributes}
                            style={{
                                cursor: isDragging ? 'grabbing' : 'grab',
                                fontSize: '1.2rem',
                                color: 'var(--color-text-tertiary)',
                                userSelect: 'none',
                            }}
                            title="Drag to move between groups"
                        >
                            ⋮⋮
                        </span>
                        <span>{item.name}</span>
                    </div>
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
