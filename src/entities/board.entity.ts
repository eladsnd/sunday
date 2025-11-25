import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    OneToMany,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { Group } from './group.entity';
import { BoardColumn } from './column.entity';
import { Item } from './item.entity';
import { Automation } from './automation.entity';
import { User } from './user.entity';

@Entity('boards')
export class Board {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string;

    @Column({ type: 'text', nullable: true })
    description: string;

    @ManyToOne(() => User, user => user.boards, { nullable: true })
    @JoinColumn({ name: 'owner_id' })
    owner: User;

    @Column({ name: 'owner_id', nullable: true })
    ownerId: string;

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

    @OneToMany(() => Automation, (automation) => automation.board, { cascade: true })
    automations: Automation[];
}
