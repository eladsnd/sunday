import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Group } from '../entities/group.entity';
import { UpdateGroupPositionDto } from './dto/update-group-position.dto';

@Injectable()
export class GroupsService {
    constructor(
        @InjectRepository(Group)
        private groupsRepository: Repository<Group>,
        private dataSource: DataSource,
    ) { }

    async updatePosition(id: string, updateGroupPositionDto: UpdateGroupPositionDto) {
        const { position } = updateGroupPositionDto;
        const group = await this.groupsRepository.findOne({ where: { id } });

        if (!group) {
            throw new NotFoundException(`Group with ID ${id} not found`);
        }

        // Use a transaction to update positions safely
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const oldPosition = group.position;
            const boardId = group.boardId;

            if (oldPosition === position) {
                return group;
            }

            // Shift other groups
            if (position > oldPosition) {
                // Moving down: shift items between old and new position UP (-1)
                await queryRunner.manager
                    .createQueryBuilder()
                    .update(Group)
                    .set({ position: () => 'position - 1' })
                    .where('board_id = :boardId', { boardId })
                    .andWhere('position > :oldPosition', { oldPosition })
                    .andWhere('position <= :newPosition', { newPosition: position })
                    .execute();
            } else {
                // Moving up: shift items between new and old position DOWN (+1)
                await queryRunner.manager
                    .createQueryBuilder()
                    .update(Group)
                    .set({ position: () => 'position + 1' })
                    .where('board_id = :boardId', { boardId })
                    .andWhere('position >= :newPosition', { newPosition: position })
                    .andWhere('position < :oldPosition', { oldPosition })
                    .execute();
            }

            // Update the target group
            group.position = position;
            await queryRunner.manager.save(group);

            await queryRunner.commitTransaction();
            return group;
        } catch (err) {
            await queryRunner.rollbackTransaction();
            throw err;
        } finally {
            await queryRunner.release();
        }
    }
}
