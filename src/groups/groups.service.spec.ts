import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { GroupsService } from './groups.service';
import { Group } from '../entities/group.entity';
import { NotFoundException } from '@nestjs/common';

describe('GroupsService', () => {
    let service: GroupsService;
    let groupRepository: Repository<Group>;
    let dataSource: DataSource;

    const mockQueryRunner = {
        connect: jest.fn(),
        startTransaction: jest.fn(),
        commitTransaction: jest.fn(),
        rollbackTransaction: jest.fn(),
        release: jest.fn(),
        manager: {
            createQueryBuilder: jest.fn().mockReturnThis(),
            update: jest.fn().mockReturnThis(),
            set: jest.fn().mockReturnThis(),
            where: jest.fn().mockReturnThis(),
            andWhere: jest.fn().mockReturnThis(),
            execute: jest.fn(),
            save: jest.fn(),
        },
    };

    const mockDataSource = {
        createQueryRunner: jest.fn(() => mockQueryRunner),
    };

    const mockGroupRepository = {
        findOne: jest.fn(),
        find: jest.fn(),
        create: jest.fn(),
        save: jest.fn(),
        remove: jest.fn(),
        createQueryBuilder: jest.fn(),
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
                {
                    provide: DataSource,
                    useValue: mockDataSource,
                },
            ],
        }).compile();

        service = module.get<GroupsService>(GroupsService);
        groupRepository = module.get<Repository<Group>>(getRepositoryToken(Group));
        dataSource = module.get<DataSource>(DataSource);

        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('create', () => {
        it('should create a group with calculated position', async () => {
            const createGroupDto = {
                name: 'New Group',
                boardId: 'board-1',
                color: '#6c63ff',
            };

            const mockQueryBuilder = {
                select: jest.fn().mockReturnThis(),
                where: jest.fn().mockReturnThis(),
                getRawOne: jest.fn().mockResolvedValue({ max: 1 }),
            };

            mockGroupRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

            const mockGroup = {
                id: 'group-1',
                ...createGroupDto,
                position: 2,
            };

            mockGroupRepository.create.mockReturnValue(mockGroup);
            mockGroupRepository.save.mockResolvedValue(mockGroup);

            const result = await service.create(createGroupDto);

            expect(mockGroupRepository.createQueryBuilder).toHaveBeenCalledWith('group');
            expect(mockQueryBuilder.select).toHaveBeenCalledWith('MAX(group.position)', 'max');
            expect(mockQueryBuilder.where).toHaveBeenCalledWith('group.boardId = :boardId', { boardId: 'board-1' });
            expect(mockGroupRepository.create).toHaveBeenCalledWith({
                ...createGroupDto,
                position: 2,
            });
            expect(result).toEqual(mockGroup);
        });

        it('should use default color if not provided', async () => {
            const createGroupDto = {
                name: 'New Group',
                boardId: 'board-1',
            };

            const mockQueryBuilder = {
                select: jest.fn().mockReturnThis(),
                where: jest.fn().mockReturnThis(),
                getRawOne: jest.fn().mockResolvedValue({ max: null }),
            };

            mockGroupRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

            const mockGroup = {
                id: 'group-1',
                ...createGroupDto,
                color: '#3b9eff',
                position: 0,
            };

            mockGroupRepository.create.mockReturnValue(mockGroup);
            mockGroupRepository.save.mockResolvedValue(mockGroup);

            const result = await service.create(createGroupDto);

            expect(mockGroupRepository.create).toHaveBeenCalledWith({
                ...createGroupDto,
                color: '#579bfc',
                position: 0,
            });
            expect(result.color).toBe('#579bfc');
        });
    });

    describe('remove', () => {
        it('should remove a group', async () => {
            const mockGroup = {
                id: 'group-1',
                name: 'Test Group',
                boardId: 'board-1',
                position: 0,
            };

            mockGroupRepository.findOne.mockResolvedValue(mockGroup);
            mockGroupRepository.remove.mockResolvedValue(mockGroup);

            await service.remove('group-1');

            expect(mockGroupRepository.findOne).toHaveBeenCalledWith({ where: { id: 'group-1' } });
            expect(mockGroupRepository.remove).toHaveBeenCalledWith(mockGroup);
        });

        it('should throw NotFoundException when group not found', async () => {
            mockGroupRepository.findOne.mockResolvedValue(null);

            await expect(service.remove('nonexistent')).rejects.toThrow(NotFoundException);
            await expect(service.remove('nonexistent')).rejects.toThrow('Group with ID nonexistent not found');
        });
    });

    describe('updatePosition', () => {
        it('should update group position moving down', async () => {
            const group = {
                id: 'group-1',
                name: 'Test Group',
                boardId: 'board-1',
                position: 0,
                color: '#6c63ff',
            };

            mockGroupRepository.findOne.mockResolvedValue(group);
            mockQueryRunner.manager.save.mockResolvedValue({ ...group, position: 2 });

            const result = await service.updatePosition('group-1', { position: 2 });

            expect(mockGroupRepository.findOne).toHaveBeenCalledWith({
                where: { id: 'group-1' },
            });
            expect(mockDataSource.createQueryRunner).toHaveBeenCalled();
            expect(mockQueryRunner.connect).toHaveBeenCalled();
            expect(mockQueryRunner.startTransaction).toHaveBeenCalled();
            expect(mockQueryRunner.commitTransaction).toHaveBeenCalled();
            expect(mockQueryRunner.release).toHaveBeenCalled();
            expect(result.position).toBe(2);
        });

        it('should return group if position unchanged', async () => {
            const group = {
                id: 'group-1',
                name: 'Test Group',
                boardId: 'board-1',
                position: 1,
                color: '#6c63ff',
            };

            mockGroupRepository.findOne.mockResolvedValue(group);

            const result = await service.updatePosition('group-1', { position: 1 });

            expect(result).toEqual(group);
            expect(mockQueryRunner.commitTransaction).not.toHaveBeenCalled();
        });

        it('should throw NotFoundException when group not found', async () => {
            mockGroupRepository.findOne.mockResolvedValue(null);

            await expect(
                service.updatePosition('non-existent', { position: 1 }),
            ).rejects.toThrow(NotFoundException);
            await expect(
                service.updatePosition('non-existent', { position: 1 }),
            ).rejects.toThrow('Group with ID non-existent not found');
        });
    });
});
