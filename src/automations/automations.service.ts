import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Automation } from '../entities/automation.entity';
import { CreateAutomationDto } from './dto/create-automation.dto';
import { ItemsService } from '../items/items.service';
import { GroupsService } from '../groups/groups.service';

@Injectable()
export class AutomationsService {
    constructor(
        @InjectRepository(Automation)
        private automationsRepository: Repository<Automation>,
        private itemsService: ItemsService,
        private groupsService: GroupsService,
    ) { }

    async create(createAutomationDto: CreateAutomationDto) {
        const automation = this.automationsRepository.create(createAutomationDto);
        return this.automationsRepository.save(automation);
    }

    async findAll(boardId: string) {
        return this.automationsRepository.find({ where: { boardId } });
    }

    async delete(id: string) {
        return this.automationsRepository.delete(id);
    }

    async checkAndExecuteAutomations(boardId: string, triggerType: string, context: any) {
        console.log('=== checkAndExecuteAutomations called ===');
        console.log('boardId:', boardId);
        console.log('triggerType:', triggerType);
        console.log('context:', JSON.stringify(context));

        const automations = await this.automationsRepository.find({
            where: { boardId, triggerType },
        });

        console.log(`Found ${automations.length} automations for this board and trigger type`);
        automations.forEach((auto, idx) => {
            console.log(`Automation ${idx}:`, JSON.stringify({
                id: auto.id,
                triggerConfig: auto.triggerConfig,
                actionConfig: auto.actionConfig
            }));
        });

        for (const automation of automations) {
            if (this.matchesTrigger(automation, context)) {
                console.log('✓ Automation matched! Executing action...');
                await this.executeAction(automation, context);
            } else {
                console.log('✗ Automation did not match');
            }
        }
    }

    private matchesTrigger(automation: Automation, context: any): boolean {
        if (automation.triggerType === 'status_change') {
            const { columnId, value } = automation.triggerConfig;
            const matches = context.columnId === columnId && context.value === value;

            console.log(`Checking automation trigger:`, {
                automationColumnId: columnId,
                automationValue: value,
                contextColumnId: context.columnId,
                contextValue: context.value,
                matches
            });

            return matches;
        }
        return false;
    }

    private async executeAction(automation: Automation, context: any) {
        if (automation.actionType === 'move_to_group') {
            const { groupId } = automation.actionConfig;
            const { itemId } = context;

            // We need to find the new position (end of group)
            // But ItemsService.updatePosition handles that if we just pass the group?
            // Actually our updatePosition takes a specific position.
            // Let's find the group to get the count.
            // For simplicity, let's just put it at position 0 or we can fetch the group items count.

            // A better way is to let ItemsService handle "move to group" logic if it existed,
            // but we can just use updatePosition with a high number or 0.
            // Let's put it at the top (0) for now, or fetch group items.

            // Let's just use 0 for now to be safe and simple.
            await this.itemsService.updatePosition(itemId, { groupId, position: 0 });
            console.log(`Executed automation: Moved item ${itemId} to group ${groupId}`);
        }
    }
}
