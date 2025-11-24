import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { Board } from './board.entity';

export enum ColumnType {
    TEXT = 'text',
    STATUS = 'status',
    DATE = 'date',
    TIMELINE = 'timeline',
    PERSON = 'person',
    LINK = 'link',
    NUMBER = 'number',
    PRIORITY = 'priority',
    FILES = 'files',
}

@Entity('columns')
export class BoardColumn {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    label: string;

    @Column({
        type: 'enum',
        enum: ColumnType,
        default: ColumnType.TEXT,
    })
    type: ColumnType;

    @Column({ type: 'int', default: 0 })
    position: number;

    @Column({ type: 'jsonb', nullable: true })
    settings: any; // Column-specific settings (e.g., status options, date format)

    @Column({ name: 'board_id' })
    boardId: string;

    @ManyToOne(() => Board, (board) => board.columns, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'board_id' })
    board: Board;
}
