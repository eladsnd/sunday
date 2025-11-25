import { useQuery } from '@tanstack/react-query';
import { boardsApi } from '../api/boardsApi';
import type { Board, Item } from '../types/board.types';

interface AgendaViewProps {
    boardId: string;
}

interface GroupedItems {
    today: Item[];
    thisWeek: Item[];
    nextWeek: Item[];
    later: Item[];
    noDates: Item[];
}

function AgendaView({ boardId }: AgendaViewProps) {
    const { data: board, isLoading } = useQuery({
        queryKey: ['board', boardId],
        queryFn: async () => {
            const response = await boardsApi.getOne(boardId);
            return response.data as Board;
        },
    });

    if (isLoading || !board) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p className="text-muted">Loading agenda...</p>
            </div>
        );
    }

    // Find date columns (unused but kept for potential future use)
    // const dateColumns = board.columns.filter(
    //     (col) => col.type === 'date' || col.type === 'timeline'
    // );

    // Group items by date
    const groupedItems: GroupedItems = {
        today: [],
        thisWeek: [],
        nextWeek: [],
        later: [],
        noDates: [],
    };

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekFromNow = new Date(today);
    weekFromNow.setDate(weekFromNow.getDate() + 7);
    const twoWeeksFromNow = new Date(today);
    twoWeeksFromNow.setDate(twoWeeksFromNow.getDate() + 14);

    board.items.forEach((item) => {
        // Find the earliest date in item's cells
        let earliestDate: Date | null = null;

        item.cellValues.forEach((cell) => {
            const column = board.columns.find((c) => c.id === cell.columnId);
            if (column && (column.type === 'date' || column.type === 'timeline')) {
                const dateValue = cell.value?.text;
                if (dateValue) {
                    const date = new Date(dateValue);
                    if (!isNaN(date.getTime())) {
                        if (!earliestDate || date.getTime() < earliestDate.getTime()) {
                            earliestDate = date;
                        }
                    }
                }
            }
        });

        if (earliestDate === null) {
            groupedItems.noDates.push(item);
        } else {
            // Type assertion needed due to TypeScript's flow analysis limitations
            const dateValue = earliestDate as Date;
            const earliestTime = dateValue.getTime();
            const todayTime = today.getTime();
            const weekTime = weekFromNow.getTime();
            const twoWeeksTime = twoWeeksFromNow.getTime();

            if (earliestTime === todayTime) {
                groupedItems.today.push(item);
            } else if (earliestTime >= todayTime && earliestTime < weekTime) {
                groupedItems.thisWeek.push(item);
            } else if (earliestTime >= weekTime && earliestTime < twoWeeksTime) {
                groupedItems.nextWeek.push(item);
            } else {
                groupedItems.later.push(item);
            }
        }
    });

    const renderItemGroup = (title: string, items: Item[], color: string) => {
        if (items.length === 0) return null;

        return (
            <div style={{ marginBottom: '2rem' }}>
                <h3
                    style={{
                        color,
                        fontSize: '1.25rem',
                        fontWeight: 600,
                        marginBottom: '1rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                    }}
                >
                    {title}
                    <span className="text-muted" style={{ fontSize: '0.9rem', fontWeight: 400 }}>
                        ({items.length} {items.length === 1 ? 'item' : 'items'})
                    </span>
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {items.map((item) => {
                        const group = board.groups.find((g) => g.id === item.groupId);
                        const statusCell = item.cellValues.find((cv) => {
                            const col = board.columns.find((c) => c.id === cv.columnId);
                            return col?.type === 'status';
                        });
                        const priorityCell = item.cellValues.find((cv) => {
                            const col = board.columns.find((c) => c.id === cv.columnId);
                            return col?.type === 'priority';
                        });

                        return (
                            <div
                                key={item.id}
                                style={{
                                    backgroundColor: 'var(--color-bg-secondary)',
                                    padding: '1rem',
                                    borderRadius: 'var(--radius-md)',
                                    border: '1px solid var(--color-border)',
                                    transition: 'all var(--transition-fast)',
                                    cursor: 'pointer',
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor =
                                        'var(--color-bg-hover)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor =
                                        'var(--color-bg-secondary)';
                                }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                                    <div>
                                        <div
                                            style={{
                                                fontSize: '1rem',
                                                fontWeight: 600,
                                                color: 'var(--color-text-primary)',
                                                marginBottom: '0.5rem',
                                            }}
                                        >
                                            {item.name}
                                        </div>
                                        {group && (
                                            <div
                                                style={{
                                                    fontSize: '0.75rem',
                                                    color: 'var(--color-text-tertiary)',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '0.25rem',
                                                }}
                                            >
                                                <div
                                                    style={{
                                                        width: '8px',
                                                        height: '8px',
                                                        borderRadius: '50%',
                                                        backgroundColor: group.color,
                                                    }}
                                                />
                                                {group.name}
                                            </div>
                                        )}
                                    </div>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        {statusCell && (
                                            <span
                                                className="status-badge"
                                                style={{
                                                    backgroundColor: '#579BFC',
                                                    color: 'white',
                                                }}
                                            >
                                                {statusCell.value?.text || 'N/A'}
                                            </span>
                                        )}
                                        {priorityCell && (
                                            <span
                                                className="priority-badge"
                                                style={{
                                                    backgroundColor:
                                                        priorityCell.value?.text === 'High'
                                                            ? 'var(--priority-high)'
                                                            : priorityCell.value?.text === 'Medium'
                                                                ? 'var(--priority-medium)'
                                                                : 'var(--priority-low)',
                                                    color: 'white',
                                                    padding: '0.25rem 0.5rem',
                                                    borderRadius: 'var(--radius-sm)',
                                                    fontSize: '0.75rem',
                                                }}
                                            >
                                                {priorityCell.value?.text || 'N/A'}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    return (
        <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                    Agenda
                </h1>
                <p className="text-muted">Your items organized by date</p>
            </div>

            {renderItemGroup('📅 Today', groupedItems.today, 'var(--color-error)')}
            {renderItemGroup('📆 This Week', groupedItems.thisWeek, 'var(--color-warning)')}
            {renderItemGroup('📅 Next Week', groupedItems.nextWeek, 'var(--color-primary)')}
            {renderItemGroup('🗓️ Later', groupedItems.later, 'var(--color-text-secondary)')}
            {renderItemGroup('⚪ No Dates', groupedItems.noDates, 'var(--color-text-tertiary)')}

            {board.items.length === 0 && (
                <div className="loading-container">
                    <p className="text-muted">No items to display</p>
                </div>
            )}
        </div>
    );
}

export default AgendaView;
