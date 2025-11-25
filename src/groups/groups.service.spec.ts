import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GroupsService } from './groups.service';
import { Group } from '../entities/group.entity';
import { NotFoundException } from '@nestjs/common';

describe('GroupsService', () => {
    let service: GroupsService;
    let groupRepository: Repository<Group>;

    const mockGroupRepository = {
        findOne: jest.fn(),
        find: jest.fn(),
        save: jest.fn(),
        manager: {
            transaction: jest.fn(),
        },
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                GroupsService,
                {
                    provide: getRepositoryToken(Group),
                    useValue: mockGroupRepository,
                },
            ],
        }).compile();

        service = module.get<GroupsService>(GroupsService);
        groupRepository = module.get<Repository<Group>>(getRepositoryToken(Group));

        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('updatePosition', () => {
        it('should update group position', async () => {
            const group = {
                id: 'group-1',
                name: 'Test Group',
                boardId: 'board-1',
                position: 0,
                color: '#6c63ff',
            };

            const boardGroups = [
                { id: 'group-1', position: 0 },
                { id: 'group-2', position: 1 },
                { id: 'group-3', position: 2 },
            ];

            mockGroupRepository.findOne.mockResolvedValue(group);
            mockGroupRepository.find.mockResolvedValue(boardGroups);
            mockGroupRepository.manager.transaction.mockImplementation(
                async (callback) => callback({
                    save: jest.fn().mockResolvedValue({ ...group, position: 2 }),
                }),
            );

            const result = await service.updatePosition('group-1', { position: 2 });

            expect(mockGroupRepository.findOne).toHaveBeenCalledWith({
                where: { id: 'group-1' },
            });
            expect(result).toBeDefined();
        });

        it('should throw NotFoundException when group not found', async () => {
            mockGroupRepository.findOne.mockResolvedValue(null);

            await expect(
                service.updatePosition('non-existent', { position: 1 }),
            ).rejects.toThrow(NotFoundException);
        });

        it('should handle moving group to same position', async () => {
            const group = {
                id: 'group-1',
                name: 'Test Group',
                boardId: 'board-1',
                position: 1,
                color: '#6c63ff',
            };

            mockGroupRepository.findOne.mockResolvedValue(group);
            mockGroupRepository.find.mockResolvedValue([group]);
            mockGroupRepository.manager.transaction.mockImplementation(
                async (callback) => callback({
                    save: jest.fn().mockResolvedValue(group),
                }),
            );

            const result = await service.updatePosition('group-1', { position: 1 });

            expect(result).toBeDefined();
        });
    });
});
