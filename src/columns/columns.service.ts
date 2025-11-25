import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BoardColumn } from '../entities/column.entity';

@Injectable()
export class ColumnsService {
    constructor(
        @InjectRepository(BoardColumn)
        private columnsRepository: Repository<BoardColumn>,
    ) { }

    async create(data: { boardId: string; label: string; type: any; position?: number }) {
        const count = await this.columnsRepository.count({ where: { boardId: data.boardId } });
        const column = this.columnsRepository.create({
            ...data,
            position: data.position ?? count,
        });
        return this.columnsRepository.save(column);
    }

    async remove(id: string) {
        const result = await this.columnsRepository.delete(id);
        if (result.affected === 0) {
            throw new NotFoundException(`Column with ID ${id} not found`);
        }
    }

    async update(id: string, data: Partial<BoardColumn>) {
        await this.columnsRepository.update(id, data);
        return this.columnsRepository.findOneBy({ id });
    }
}
