import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BoardsModule } from './boards/boards.module';
import { ItemsModule } from './items/items.module';
import { CellsModule } from './cells/cells.module';
import { Board } from './entities/board.entity';
import { Group } from './entities/group.entity';
import { Item } from './entities/item.entity';
import { BoardColumn } from './entities/column.entity';
import { CellValue } from './entities/cell-value.entity';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
        }),
        TypeOrmModule.forRoot({
            type: 'postgres',
            host: process.env.DB_HOST || 'localhost',
            port: parseInt(process.env.DB_PORT, 10) || 5432,
            username: process.env.DB_USERNAME || 'sunday',
            password: process.env.DB_PASSWORD || 'sunday123',
            database: process.env.DB_DATABASE || 'sunday_db',
            entities: [Board, Group, Item, BoardColumn, CellValue],
            synchronize: process.env.NODE_ENV !== 'production', // Auto-sync in dev only
            logging: process.env.NODE_ENV === 'development',
        }),
        BoardsModule,
        ItemsModule,
        CellsModule,
    ],
})
export class AppModule { }
