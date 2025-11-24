import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
    DndContext,
    DragEndEvent,
    DragOverlay,
    DragStartEvent,
    closestCenter,
    PointerSensor,
    useSensor,
    useSensors,
    useDroppable,
} from '@dnd-kit/core';
import { useState } from 'react';
import type { Board, Item, Group } from '../types/board.types';
import TableRow from './TableRow';
import { itemsApi } from '../api/boardsApi';

interface BoardTableProps {
    board: Board;
}

interface GroupHeaderProps {
    group: Group & { items: Item[] };
    columnsCount: number;
    activeItem: Item | null;
}

function GroupHeader({ group, columnsCount, activeItem }: GroupHeaderProps) {
    const { setNodeRef, isOver } = useDroppable({
        id: group.id,
    });

    return (
        <tr ref={setNodeRef} data-group-id={group.id}>
            <td
                colSpan={columnsCount + 1}
                className="group-header"
                style={{
                    position: 'relative',
                    backgroundColor:
                        isOver || (activeItem && activeItem.groupId !== group.id)
                            ? 'rgba(108, 99, 255, 0.15)'
                            : undefined,
                    transition: 'background-color 200ms',
                    border: isOver ? '2px solid var(--color-primary)' : undefined,
                }}
            >
                <div className="group-header-content">
                    <div
                        className="group-color-indicator"
                        style={{ backgroundColor: group.color }}
                    />
                    <span>{group.name}</span>
                    <span className="text-muted" style={{ marginLeft: 'auto' }}>
                        {group.items.length} items
                    </span>
                    {activeItem && activeItem.groupId !== group.id && (
                        <span
                            style={{
                                marginLeft: '1rem',
                                fontSize: '0.75rem',
                                color: 'var(--color-primary)',
                                fontWeight: 600,
                            }}
                        >
                            {isOver ? '👆 Release to drop here' : '⬇ Drop here to move'}
                        </span>
                    )}
                </div>
            </td>
        </tr>
    );
}

function BoardTable({ board }: BoardTableProps) {
    const queryClient = useQueryClient();
    const [activeItem, setActiveItem] = useState<Item | null>(null);

    // Organize items by group
    const groupedItems = board.groups.map((group) => ({
        ...group,
        items: board.items
            .filter((item) => item.groupId === group.id)
            .sort((a, b) => a.position - b.position),
    }));

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8, // 8px drag threshold
            },
        })
    );

    const updatePositionMutation = useMutation({
        mutationFn: ({ itemId, groupId, position }: { itemId: string; groupId: string; position: number }) =>
            itemsApi.updatePosition(itemId, { groupId, position }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['board', board.id] });
        },
    });

    const handleDragStart = (event: DragStartEvent) => {
        const item = board.items.find((i) => i.id === event.active.id);
        setActiveItem(item || null);
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveItem(null);

        if (!over) return;

        const itemId = active.id as string;
        const newGroupId = over.id as string;

        // Find the item being dragged
        const draggedItem = board.items.find((item) => item.id === itemId);
        if (!draggedItem) return;

        // If dropped on same group, do nothing
        if (draggedItem.groupId === newGroupId) return;

        // Get items in the new group
        const targetGroup = groupedItems.find((g) => g.id === newGroupId);
        if (!targetGroup) return;

        // New position is at the end of the target group
        const newPosition = targetGroup.items.length;

        console.log('Moving item:', draggedItem.name, 'to group:', targetGroup.name, 'at position:', newPosition);

        // Update the item's group and position
        updatePositionMutation.mutate({
            itemId,
            groupId: newGroupId,
            position: newPosition,
        });
    };

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        >
            <div className="board-table-wrapper">
                <table className="board-table">
                    <thead>
                        <tr>
                            <th style={{ minWidth: '200px' }}>Item</th>
                            {board.columns
                                .sort((a, b) => a.position - b.position)
                                .map((column) => (
                                    <th key={column.id} style={{ minWidth: '150px' }}>
                                        {column.label}
                                    </th>
                                ))}
                        </tr>
                    </thead>
                    <tbody>
                        {groupedItems.map((group) => (
                            <>
                                <GroupHeader
                                    key={`group-header-${group.id}`}
                                    group={group}
                                    columnsCount={board.columns.length}
                                    activeItem={activeItem}
                                />
                                {group.items.map((item) => (
                                    <TableRow
                                        key={item.id}
                                        item={item}
                                        columns={board.columns.sort((a, b) => a.position - b.position)}
                                        boardId={board.id}
                                        isDragging={activeItem?.id === item.id}
                                    />
                                ))}
                                {group.items.length === 0 && !activeItem && (
                                    <tr>
                                        <td
                                            colSpan={board.columns.length + 1}
                                            style={{ textAlign: 'center', padding: '2rem' }}
                                        >
                                            <span className="text-muted">No items in this group</span>
                                        </td>
                                    </tr>
                                )}
                            </>
                        ))}
                    </tbody>
                </table>
            </div>

            <DragOverlay>
                {activeItem ? (
                    <div
                        style={{
                            opacity: 0.9,
                            backgroundColor: 'var(--color-bg-elevated)',
                            padding: '0.75rem 1.5rem',
                            borderRadius: 'var(--radius-md)',
                            boxShadow: 'var(--shadow-xl)',
                            border: '2px solid var(--color-primary)',
                            fontSize: '0.95rem',
                            fontWeight: 600,
                        }}
                    >
                        📌 {activeItem.name}
                    </div>
                ) : null}
            </DragOverlay>
        </DndContext>
    );
}

export default BoardTable;
