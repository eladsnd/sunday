import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    OneToMany,
    JoinColumn,
    CreateDateColumn,
} from 'typeorm';
import { Board } from './board.entity';
import { Group } from './group.entity';
import { CellValue } from './cell-value.entity';

@Entity('items')
export class Item {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string;

    @Column({ type: 'int', default: 0 })
    position: number;

    @Column({ name: 'group_id' })
    groupId: string;

    @Column({ name: 'board_id' })
    boardId: string;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @ManyToOne(() => Group, (group) => group.items, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'group_id' })
    group: Group;

    @ManyToOne(() => Board, (board) => board.items, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'board_id' })
    board: Board;

    @OneToMany(() => CellValue, (cellValue) => cellValue.item, { cascade: true })
    cellValues: CellValue[];
}
