import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CellValue } from '../entities/cell-value.entity';
import { Item } from '../entities/item.entity';
import { UpdateCellValueDto } from './dto/update-cell-value.dto';
import { AutomationsService } from '../automations/automations.service';

@Injectable()
export class CellsService {
    constructor(
        @InjectRepository(CellValue)
        private cellValueRepository: Repository<CellValue>,
        private automationsService: AutomationsService,
    ) { }

    async updateCellValue(
        itemId: string,
        columnId: string,
        updateCellValueDto: UpdateCellValueDto,
    ): Promise<CellValue> {
        console.log('=== updateCellValue called ===');
        console.log('itemId:', itemId);
        console.log('columnId:', columnId);
        console.log('updateCellValueDto:', JSON.stringify(updateCellValueDto));

        // Find existing cell value or create new one
        let cellValue = await this.cellValueRepository.findOne({
            where: { itemId, columnId },
        });

        if (cellValue) {
            cellValue.value = updateCellValueDto.value;
        } else {
            cellValue = this.cellValueRepository.create({
                itemId,
                columnId,
                value: updateCellValueDto.value,
            });
        }

        const savedCellValue = await this.cellValueRepository.save(cellValue);
        console.log('Cell value saved:', JSON.stringify(savedCellValue));

        // Trigger automations
        // Fetch item to get boardId
        const item = await this.cellValueRepository.manager.findOne(Item, {
            where: { id: itemId },
            relations: ['group'],
        });

        console.log('Item found:', item ? 'YES' : 'NO');
        console.log('Item has group:', item?.group ? 'YES' : 'NO');

        if (item && item.group) {
            // Extract the actual value from the cell value object
            // Cell values are stored as { text: "value" } for most types
            const actualValue = updateCellValueDto.value?.text || updateCellValueDto.value;

            console.log(`Checking automations for item ${itemId}, column ${columnId}, value:`, actualValue);
            console.log('Board ID:', item.group.boardId);

            await this.automationsService.checkAndExecuteAutomations(
                item.group.boardId,
                'status_change',
                {
                    columnId,
                    value: actualValue,
                    itemId,
                }
            );
        }

        return savedCellValue;
    }
}
