import type { BoardColumn, CellValue, ColumnType } from '../../types/board.types';
import StatusCell from './StatusCell';
import TextCell from './TextCell';
import DateCell from './DateCell';
import LinkCell from './LinkCell';
import PriorityCell from './PriorityCell';

interface CellRendererProps {
    column: BoardColumn;
    cellValue?: CellValue;
    itemId: string;
    boardId: string;
}

function CellRenderer({ column, cellValue, itemId, boardId }: CellRendererProps) {
    const value = cellValue?.value;

    switch (column.type) {
        case 'status' as ColumnType:
            return (
                <StatusCell
                    value={value}
                    settings={column.settings}
                    itemId={itemId}
                    columnId={column.id}
                    boardId={boardId}
                />
            );

        case 'priority' as ColumnType:
            return (
                <PriorityCell
                    value={value}
                    settings={column.settings}
                    itemId={itemId}
                    columnId={column.id}
                    boardId={boardId}
                />
            );

        case 'date' as ColumnType:
            return (
                <DateCell
                    value={value}
                    itemId={itemId}
                    columnId={column.id}
                    boardId={boardId}
                />
            );

        case 'link' as ColumnType:
            return (
                <LinkCell
                    value={value}
                    itemId={itemId}
                    columnId={column.id}
                    boardId={boardId}
                />
            );

        case 'text' as ColumnType:
        default:
            return (
                <TextCell
                    value={value}
                    itemId={itemId}
                    columnId={column.id}
                    boardId={boardId}
                />
            );
    }
}

export default CellRenderer;
