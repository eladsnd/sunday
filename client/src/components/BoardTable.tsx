import type { Board } from '../types/board.types';
import TableRow from './TableRow';

interface BoardTableProps {
    board: Board;
}

function BoardTable({ board }: BoardTableProps) {
    // Organize items by group
    const groupedItems = board.groups.map((group) => ({
        ...group,
        items: board.items
            .filter((item) => item.groupId === group.id)
            .sort((a, b) => a.position - b.position),
    }));

    return (
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
                            <tr key={`group-${group.id}`}>
                                <td
                                    colSpan={board.columns.length + 1}
                                    className="group-header"
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
                                    </div>
                                </td>
                            </tr>
                            {group.items.map((item) => (
                                <TableRow
                                    key={item.id}
                                    item={item}
                                    columns={board.columns.sort((a, b) => a.position - b.position)}
                                    boardId={board.id}
                                />
                            ))}
                            {group.items.length === 0 && (
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
    );
}

export default BoardTable;
