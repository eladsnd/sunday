import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Item } from '../entities/item.entity';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { UpdateItemPositionDto } from './dto/update-item-position.dto';

@Injectable()
export class ItemsService {
    constructor(
        @InjectRepository(Item)
        private itemRepository: Repository<Item>,
    ) { }

    async create(createItemDto: CreateItemDto): Promise<Item> {
        // Get the max position in the group
        const maxPosition = await this.itemRepository
            .createQueryBuilder('item')
            .select('MAX(item.position)', 'max')
            .where('item.groupId = :groupId', { groupId: createItemDto.groupId })
            .getRawOne();

        const item = this.itemRepository.create({
            ...createItemDto,
            position: (maxPosition?.max ?? -1) + 1,
        });

        return this.itemRepository.save(item);
    }

    async update(id: string, updateItemDto: UpdateItemDto): Promise<Item> {
        const item = await this.itemRepository.findOne({ where: { id } });
        if (!item) {
            throw new NotFoundException(`Item with ID ${id} not found`);
        }

        Object.assign(item, updateItemDto);
        return this.itemRepository.save(item);
    }

    async updatePosition(
        id: string,
        updatePositionDto: UpdateItemPositionDto,
    ): Promise<Item> {
        const item = await this.itemRepository.findOne({ where: { id } });
        if (!item) {
            throw new NotFoundException(`Item with ID ${id} not found`);
        }

        const { groupId, position } = updatePositionDto;

        // If moving to a different group
        if (groupId && groupId !== item.groupId) {
            item.groupId = groupId;
        }

        item.position = position;
        return this.itemRepository.save(item);
    }

    async remove(id: string): Promise<void> {
        const item = await this.itemRepository.findOne({ where: { id } });
        if (!item) {
            throw new NotFoundException(`Item with ID ${id} not found`);
        }

        await this.itemRepository.remove(item);
    }
}
