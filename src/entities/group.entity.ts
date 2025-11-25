import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    OneToMany,
    JoinColumn,
} from 'typeorm';
import { Board } from './board.entity';
import { Item } from './item.entity';

@Entity('groups')
export class Group {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string;

    @Column({ type: 'int', default: 0 })
    position: number;

    @Column({ type: 'varchar', default: '#3b9eff' })
    color: string;

    @Column({ name: 'board_id' })
    boardId: string;

    @ManyToOne(() => Board, (board) => board.groups, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'board_id' })
    board: Board;

    @OneToMany(() => Item, (item) => item.group, { cascade: true })
    items: Item[];
}
