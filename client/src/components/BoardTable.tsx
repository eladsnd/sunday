
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
    DndContext,
    DragEndEvent,
    DragOverlay,
    DragStartEvent,

    pointerWithin,
    PointerSensor,
    useSensor,
    useSensors,
    useDroppable,
    defaultDropAnimationSideEffects,
    DropAnimation,
} from '@dnd-kit/core';
import {
    SortableContext,
    verticalListSortingStrategy,
    useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useState } from 'react';
import type { Board, Item, Group } from '../types/board.types';
import TableRow from './TableRow';
import { itemsApi, groupsApi, columnsApi } from '../api/boardsApi';

interface BoardTableProps {
    board: Board;
}

interface GroupHeaderProps {
    group: Group & { items: Item[] };
    columnsCount: number;
    activeItem: Item | null;
    onDelete: () => void;
}

function GroupHeader({ group, columnsCount, activeItem, onDelete }: GroupHeaderProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: group.id,
        data: {
            type: 'group',
            group,
        },
    });

    const { setNodeRef: setDropRef, isOver } = useDroppable({
        id: `droppable - ${group.id} `,
        data: {
            type: 'group-drop-zone',
            groupId: group.id,
        },
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <tr ref={setNodeRef} style={style} {...attributes}>
            <td
                ref={setDropRef}
                colSpan={columnsCount + 2}
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
                    {/* Group Drag Handle */}
                    <span
                        {...listeners}
                        style={{
                            cursor: 'grab',
                            marginRight: '0.5rem',
                            color: 'var(--color-text-tertiary)',
                            fontSize: '1.2rem',
                        }}
                        title="Drag to reorder group"
                    >
                        ⋮⋮
                    </span>

                    <div
                        className="group-color-indicator"
                        style={{ backgroundColor: group.color }}
                    />
                    <span>{group.name}</span>

                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onDelete();
                        }}
                        style={{
                            marginLeft: '1rem',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: 'var(--color-text-tertiary)',
                            fontSize: '1.2rem',
                            padding: '0 0.5rem'
                        }}
                        title="Delete Group"
                    >
                        ×
                    </button>

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
    const [activeId, setActiveId] = useState<string | null>(null);
    const [activeType, setActiveType] = useState<'item' | 'group' | null>(null);

    // Organize items by group
    const groupedItems = board.groups
        .sort((a, b) => a.position - b.position)
        .map((group) => ({
            ...group,
            items: board.items
                .filter((item) => item.groupId === group.id)
                .sort((a, b) => a.position - b.position),
        }));

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        })
    );

    const updateItemPositionMutation = useMutation({
        mutationFn: ({ itemId, groupId, position }: { itemId: string; groupId: string; position: number }) =>
            itemsApi.updatePosition(itemId, { groupId, position }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['board', board.id] });
        },
    });

    const updateGroupPositionMutation = useMutation({
        mutationFn: ({ groupId, position }: { groupId: string; position: number }) =>
            groupsApi.updatePosition(groupId, { position }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['board', board.id] });
        },
    });

    const deleteColumnMutation = useMutation({
        mutationFn: (columnId: string) => columnsApi.delete(columnId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['board', board.id] });
        },
    });

    const handleDragStart = (event: DragStartEvent) => {
        const { active } = event;
        setActiveId(active.id as string);
        setActiveType(active.data.current?.type || null);
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveId(null);
        setActiveType(null);

        if (!over) return;

        if (active.data.current?.type === 'group') {
            const activeGroupId = active.id as string;
            const overGroupId = over.id as string;

            if (activeGroupId !== overGroupId) {

                const newIndex = groupedItems.findIndex((g) => g.id === overGroupId);

                // Optimistic update could go here, but for now we rely on mutation
                updateGroupPositionMutation.mutate({
                    groupId: activeGroupId,
                    position: newIndex, // Backend handles shifting
                });
            }
        } else if (active.data.current?.type === 'item') {
            const itemId = active.id as string;

            // Determine target group
            let newGroupId = '';
            let newPosition = 0;

            if (over.data.current?.type === 'group-drop-zone') {
                // Dropped on a group header
                newGroupId = over.data.current.groupId;
                const targetGroup = groupedItems.find(g => g.id === newGroupId);
                newPosition = targetGroup ? targetGroup.items.length : 0;
            } else if (over.data.current?.type === 'item') {
                // Dropped on another item (reordering within group or moving to another group)
                const overItem = board.items.find(i => i.id === over.id);
                if (overItem) {
                    newGroupId = overItem.groupId;
                    // Insert before or after depending on direction, simplified to 'at index'
                    const targetGroup = groupedItems.find(g => g.id === newGroupId);
                    if (targetGroup) {
                        const overIndex = targetGroup.items.findIndex(i => i.id === over.id);
                        newPosition = overIndex;
                    }
                }
            }

            const draggedItem = board.items.find((item) => item.id === itemId);

            if (draggedItem && newGroupId && (draggedItem.groupId !== newGroupId || true)) { // Allow reordering in same group too
                // If moving to a different group or reordering
                updateItemPositionMutation.mutate({
                    itemId,
                    groupId: newGroupId,
                    position: newPosition,
                });
            }
        }
    };

    const dropAnimation: DropAnimation = {
        sideEffects: defaultDropAnimationSideEffects({
            styles: {
                active: {
                    opacity: '0.5',
                },
            },
        }),
    };

    const activeItem = activeType === 'item' ? (board.items.find(i => i.id === activeId) || null) : null;
    const activeGroup = activeType === 'group' ? board.groups.find(g => g.id === activeId) : null;

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={pointerWithin}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        >
            <div className="board-table-wrapper">
                <div style={{ padding: '1rem', display: 'flex', gap: '1rem' }}>
                    <button
                        className="btn btn-primary"
                        onClick={() => {
                            const name = prompt('Enter group name:');
                            if (name) {
                                groupsApi.create({
                                    name,
                                    boardId: board.id,
                                    color: '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')
                                }).then(() => {
                                    queryClient.invalidateQueries({ queryKey: ['board', board.id] });
                                });
                            }
                        }}
                    >
                        + Add New Group
                    </button>
                </div>
                <table className="board-table">
                    <thead>
                        <tr>
                            <th style={{ minWidth: '200px' }}>Item</th>
                            {board.columns
                                .sort((a, b) => a.position - b.position)
                                .map((column) => (
                                    <th key={column.id} style={{ minWidth: '150px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                                            <span>{column.label}</span>
                                            <button
                                                onClick={() => {
                                                    if (confirm(`Delete column "${column.label}"?`)) {
                                                        deleteColumnMutation.mutate(column.id);
                                                    }
                                                }}
                                                style={{
                                                    background: 'none',
                                                    border: 'none',
                                                    cursor: 'pointer',
                                                    color: 'var(--color-text-tertiary)',
                                                    fontSize: '1.2rem',
                                                    padding: '0 0.25rem',
                                                    opacity: 0.6,
                                                    transition: 'opacity 0.2s',
                                                }}
                                                onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                                                onMouseLeave={(e) => e.currentTarget.style.opacity = '0.6'}
                                                title="Delete Column"
                                            >
                                                ×
                                            </button>
                                        </div>
                                    </th>
                                ))}
                            <th style={{ minWidth: '120px' }}>
                                <button
                                    className="btn btn-secondary"
                                    onClick={() => {
                                        const label = prompt('Enter column name:');
                                        if (label) {
                                            const type = prompt(
                                                'Enter column type:\n' +
                                                '- text (default)\n' +
                                                '- status\n' +
                                                '- date\n' +
                                                '- priority\n' +
                                                '- link\n' +
                                                '- number\n' +
                                                '- person\n' +
                                                '- timeline\n' +
                                                '- files',
                                                'text'
                                            ) || 'text';
                                            columnsApi.create({ boardId: board.id, label, type }).then(() => {
                                                queryClient.invalidateQueries({ queryKey: ['board', board.id] });
                                            });
                                        }
                                    }}
                                    style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
                                >
                                    + Add Column
                                </button>
                            </th>
                        </tr>
                    </thead>
                    <SortableContext
                        items={groupedItems.map(g => g.id)}
                        strategy={verticalListSortingStrategy}
                    >
                        <tbody>
                            {groupedItems.map((group) => (
                                <>
                                    <GroupHeader
                                        key={`group - header - ${group.id} `}
                                        group={group}
                                        columnsCount={board.columns.length}
                                        activeItem={activeItem}
                                        onDelete={() => {
                                            if (confirm(`Are you sure you want to delete group "${group.name}"?`)) {
                                                groupsApi.delete(group.id).then(() => {
                                                    queryClient.invalidateQueries({ queryKey: ['board', board.id] });
                                                });
                                            }
                                        }}
                                    />
                                    {group.items.map((item) => (
                                        <TableRow
                                            key={item.id}
                                            item={item}
                                            columns={board.columns.sort((a, b) => a.position - b.position)}
                                            boardId={board.id}
                                            isDragging={activeId === item.id}
                                        />
                                    ))}
                                    {group.items.length === 0 && !activeItem && (
                                        <tr>
                                            <td
                                                colSpan={board.columns.length + 2}
                                                style={{ textAlign: 'center', padding: '2rem' }}
                                            >
                                                <span className="text-muted">No items in this group</span>
                                            </td>
                                        </tr>
                                    )}
                                </>
                            ))}
                        </tbody>
                    </SortableContext>
                </table>
            </div>

            <DragOverlay dropAnimation={dropAnimation}>
                {activeItem ? (
                    <div
                        style={{
                            opacity: 0.9,
                            backgroundColor: 'var(--color-bg-elevated)',
                            padding: '0.5rem 1rem',
                            borderRadius: 'var(--radius-md)',
                            boxShadow: 'var(--shadow-xl)',
                            border: '2px solid var(--color-primary)',
                        }}
                    >
                        {activeItem.name}
                    </div>
                ) : activeGroup ? (
                    <div
                        style={{
                            opacity: 0.9,
                            backgroundColor: 'var(--color-bg-elevated)',
                            padding: '1rem',
                            borderRadius: 'var(--radius-md)',
                            boxShadow: 'var(--shadow-xl)',
                            border: '2px solid var(--color-primary)',
                            width: '300px',
                        }}
                    >
                        {activeGroup.name}
                    </div>
                ) : null}
            </DragOverlay>
        </DndContext >
    );
}

export default BoardTable;

