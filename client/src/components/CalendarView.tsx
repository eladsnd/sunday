import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { boardsApi } from '../api/boardsApi';
import type { Board, Item } from '../types/board.types';

interface CalendarViewProps {
    boardId: string;
}

function CalendarView({ boardId }: CalendarViewProps) {
    const [currentDate, setCurrentDate] = useState(new Date());

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
                <p className="text-muted">Loading calendar...</p>
            </div>
        );
    }

    // Calendar logic
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const monthNames = [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December',
    ];

    // Map items to dates
    const itemsByDate: { [key: string]: Item[] } = {};

    board.items.forEach((item) => {
        item.cellValues.forEach((cell) => {
            const column = board.columns.find((c) => c.id === cell.columnId);
            if (column && (column.type === 'date' || column.type === 'timeline')) {
                const dateValue = cell.value?.text;
                if (dateValue) {
                    const date = new Date(dateValue);
                    if (!isNaN(date.getTime())) {
                        const dateKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
                        if (!itemsByDate[dateKey]) {
                            itemsByDate[dateKey] = [];
                        }
                        if (!itemsByDate[dateKey].find((i) => i.id === item.id)) {
                            itemsByDate[dateKey].push(item);
                        }
                    }
                }
            }
        });
    });

    const previousMonth = () => {
        setCurrentDate(new Date(year, month - 1, 1));
    };

    const nextMonth = () => {
        setCurrentDate(new Date(year, month + 1, 1));
    };

    const today = new Date();
    const isToday = (day: number) => {
        return (
            day === today.getDate() &&
            month === today.getMonth() &&
            year === today.getFullYear()
        );
    };

    return (
        <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
            {/* Header */}
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '2rem',
                }}
            >
                <div>
                    <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                        {monthNames[month]} {year}
                    </h1>
                    <p className="text-muted">Calendar view</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button className="btn btn-secondary" onClick={previousMonth}>
                        ← Previous
                    </button>
                    <button
                        className="btn btn-secondary"
                        onClick={() => setCurrentDate(new Date())}
                    >
                        Today
                    </button>
                    <button className="btn btn-secondary" onClick={nextMonth}>
                        Next →
                    </button>
                </div>
            </div>

            {/* Calendar Grid */}
            <div
                style={{
                    backgroundColor: 'var(--color-bg-elevated)',
                    borderRadius: 'var(--radius-lg)',
                    padding: '1rem',
                    boxShadow: 'var(--shadow-lg)',
                }}
            >
                {/* Day headers */}
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(7, 1fr)',
                        gap: '1px',
                        marginBottom: '1px',
                    }}
                >
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                        <div
                            key={day}
                            style={{
                                padding: '0.75rem',
                                textAlign: 'center',
                                fontWeight: 600,
                                fontSize: '0.875rem',
                                color: 'var(--color-text-secondary)',
                                backgroundColor: 'var(--color-bg-secondary)',
                            }}
                        >
                            {day}
                        </div>
                    ))}
                </div>

                {/* Calendar days */}
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(7, 1fr)',
                        gap: '1px',
                        backgroundColor: 'var(--color-border)',
                    }}
                >
                    {/* Empty cells before first day */}
                    {Array.from({ length: startingDayOfWeek }, (_, i) => (
                        <div
                            key={`empty-${i}`}
                            style={{
                                backgroundColor: 'var(--color-bg-secondary)',
                                minHeight: '120px',
                                opacity: 0.5,
                            }}
                        />
                    ))}

                    {/* Days of the month */}
                    {Array.from({ length: daysInMonth }, (_, i) => {
                        const day = i + 1;
                        const dateKey = `${year}-${month}-${day}`;
                        const dayItems = itemsByDate[dateKey] || [];
                        const isTodayDate = isToday(day);

                        return (
                            <div
                                key={day}
                                style={{
                                    backgroundColor: isTodayDate
                                        ? 'rgba(108, 99, 255, 0.1)'
                                        : 'var(--color-bg-secondary)',
                                    minHeight: '120px',
                                    padding: '0.5rem',
                                    position: 'relative',
                                    border: isTodayDate
                                        ? '2px solid var(--color-primary)'
                                        : 'none',
                                }}
                            >
                                <div
                                    style={{
                                        fontSize: '0.875rem',
                                        fontWeight: isTodayDate ? 700 : 600,
                                        color: isTodayDate
                                            ? 'var(--color-primary)'
                                            : 'var(--color-text-primary)',
                                        marginBottom: '0.5rem',
                                    }}
                                >
                                    {day}
                                </div>

                                {/* Items on this day */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                    {dayItems.slice(0, 3).map((item) => {
                                        const group = board.groups.find((g) => g.id === item.groupId);
                                        return (
                                            <div
                                                key={item.id}
                                                style={{
                                                    fontSize: '0.7rem',
                                                    padding: '0.25rem 0.5rem',
                                                    backgroundColor: group?.color || 'var(--color-primary)',
                                                    color: 'white',
                                                    borderRadius: 'var(--radius-sm)',
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    whiteSpace: 'nowrap',
                                                    cursor: 'pointer',
                                                }}
                                                title={item.name}
                                            >
                                                {item.name}
                                            </div>
                                        );
                                    })}
                                    {dayItems.length > 3 && (
                                        <div
                                            style={{
                                                fontSize: '0.65rem',
                                                color: 'var(--color-text-tertiary)',
                                                textAlign: 'center',
                                                marginTop: '0.25rem',
                                            }}
                                        >
                                            +{dayItems.length - 3} more
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

export default CalendarView;
