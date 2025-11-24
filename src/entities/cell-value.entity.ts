import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
    UpdateDateColumn,
} from 'typeorm';
import { Item } from './item.entity';
import { BoardColumn } from './column.entity';

@Entity('cell_values')
export class CellValue {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'jsonb' })
    value: any; // Flexible storage for different cell types

    @Column({ name: 'item_id' })
    itemId: string;

    @Column({ name: 'column_id' })
    columnId: string;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;

    @ManyToOne(() => Item, (item) => item.cellValues, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'item_id' })
    item: Item;

    @ManyToOne(() => BoardColumn, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'column_id' })
    column: BoardColumn;
}
