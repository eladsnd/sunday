import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    OneToMany,
} from 'typeorm';
import { Group } from './group.entity';
import { BoardColumn } from './column.entity';
import { Item } from './item.entity';

@Entity('boards')
export class Board {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string;

    @Column({ type: 'text', nullable: true })
    description: string;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;

    @OneToMany(() => Group, (group) => group.board, { cascade: true })
    groups: Group[];

    @OneToMany(() => BoardColumn, (column) => column.board, { cascade: true })
    columns: BoardColumn[];

    @OneToMany(() => Item, (item) => item.board, { cascade: true })
    items: Item[];
}
