import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AutomationsService } from './automations.service';
import { AutomationsController } from './automations.controller';
import { Automation } from '../entities/automation.entity';
import { ItemsModule } from '../items/items.module';
import { GroupsModule } from '../groups/groups.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([Automation]),
        ItemsModule,
        GroupsModule,
    ],
    controllers: [AutomationsController],
    providers: [AutomationsService],
    exports: [AutomationsService],
})
export class AutomationsModule { }
