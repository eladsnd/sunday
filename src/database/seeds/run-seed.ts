import { DataSource } from 'typeorm';
import { seedAdmin } from './admin.seed';
import { Board } from '../../entities/board.entity';
import { Group } from '../../entities/group.entity';
import { Item } from '../../entities/item.entity';
import { BoardColumn } from '../../entities/column.entity';
import { CellValue } from '../../entities/cell-value.entity';
import { Automation } from '../../entities/automation.entity';
import { User } from '../../entities/user.entity';

async function runSeeds() {
    const dataSource = new DataSource({
        type: 'postgres',
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432', 10),
        username: process.env.DB_USERNAME || 'sunday',
        password: process.env.DB_PASSWORD || 'sunday123',
        database: process.env.DB_DATABASE || 'sunday_db',
        entities: [Board, Group, Item, BoardColumn, CellValue, Automation, User],
        synchronize: false,
    });

    try {
        await dataSource.initialize();
        console.log('Database connection established');

        await seedAdmin(dataSource);

        await dataSource.destroy();
        console.log('Seeding completed successfully');
        process.exit(0);
    } catch (error) {
        console.error('Error during seeding:', error);
        process.exit(1);
    }
}

runSeeds();
