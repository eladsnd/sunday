import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { Board } from './board.entity';

@Entity('automations')
export class Automation {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'board_id' })
    boardId: string;

    @ManyToOne(() => Board, (board) => board.automations, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'board_id' })
    board: Board;

    @Column({ type: 'varchar' })
    triggerType: string; // e.g., 'status_change'

    @Column({ type: 'jsonb' })
    triggerConfig: any; // e.g., { columnId: '...', value: 'Done' }

    @Column({ type: 'varchar' })
    actionType: string; // e.g., 'move_to_group'

    @Column({ type: 'jsonb' })
    actionConfig: any; // e.g., { groupId: '...' }
}
