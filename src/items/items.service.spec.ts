import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ItemsService } from './items.service';
import { Item } from '../entities/item.entity';
import { NotFoundException } from '@nestjs/common';

describe('ItemsService', () => {
    let service: ItemsService;
    let itemRepository: Repository<Item>;

    const mockItemRepository = {
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
                ItemsService,
                {
                    provide: getRepositoryToken(Item),
                    useValue: mockItemRepository,
                },
            ],
        }).compile();

        service = module.get<ItemsService>(ItemsService);
        itemRepository = module.get<Repository<Item>>(getRepositoryToken(Item));

        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('create', () => {
        it('should create an item with calculated position', async () => {
            const createDto = {
                name: 'Test Item',
                groupId: 'group-1',
                boardId: 'board-1',
            };

            const mockQueryBuilder = {
                select: jest.fn().mockReturnThis(),
                where: jest.fn().mockReturnThis(),
                getRawOne: jest.fn().mockResolvedValue({ max: 2 }),
            };

            mockItemRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

            const savedItem = {
                id: 'item-1',
                ...createDto,
                position: 3,
                createdAt: new Date(),
            };

            mockItemRepository.create.mockReturnValue(savedItem);
            mockItemRepository.save.mockResolvedValue(savedItem);

            const result = await service.create(createDto);

            expect(mockItemRepository.createQueryBuilder).toHaveBeenCalledWith('item');
            expect(mockQueryBuilder.select).toHaveBeenCalledWith('MAX(item.position)', 'max');
            expect(mockQueryBuilder.where).toHaveBeenCalledWith('item.groupId = :groupId', { groupId: 'group-1' });
            expect(mockItemRepository.create).toHaveBeenCalledWith({
                ...createDto,
                position: 3,
            });
            expect(mockItemRepository.save).toHaveBeenCalledWith(savedItem);
            expect(result).toEqual(savedItem);
        });

        it('should create first item with position 0 when group is empty', async () => {
            const createDto = {
                name: 'First Item',
                groupId: 'group-1',
                boardId: 'board-1',
            };

            const mockQueryBuilder = {
                select: jest.fn().mockReturnThis(),
                where: jest.fn().mockReturnThis(),
                getRawOne: jest.fn().mockResolvedValue({ max: null }),
            };

            mockItemRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

            const savedItem = {
                id: 'item-1',
                ...createDto,
                position: 0,
                createdAt: new Date(),
            };

            mockItemRepository.create.mockReturnValue(savedItem);
            mockItemRepository.save.mockResolvedValue(savedItem);

            const result = await service.create(createDto);

            expect(mockItemRepository.create).toHaveBeenCalledWith({
                ...createDto,
                position: 0,
            });
            expect(result.position).toBe(0);
        });
    });

    describe('findOne', () => {
        it('should return an item', async () => {
            const item = {
                id: 'item-1',
                name: 'Test Item',
                groupId: 'group-1',
                boardId: 'board-1',
            };

            mockItemRepository.findOne.mockResolvedValue(item);

            const result = await service.findOne('item-1');

            expect(mockItemRepository.findOne).toHaveBeenCalledWith({
                where: { id: 'item-1' },
            });
            expect(result).toEqual(item);
        });

        it('should throw NotFoundException when item not found', async () => {
            mockItemRepository.findOne.mockResolvedValue(null);

            await expect(service.findOne('non-existent')).rejects.toThrow(
                NotFoundException,
            );
        });
    });

    describe('update', () => {
        it('should update an item', async () => {
            const item = {
                id: 'item-1',
                name: 'Old Name',
                groupId: 'group-1',
                boardId: 'board-1',
            };

            const updateDto = { name: 'New Name' };

            mockItemRepository.findOne.mockResolvedValue(item);
            mockItemRepository.save.mockResolvedValue({ ...item, ...updateDto });

            const result = await service.update('item-1', updateDto);

            expect(result.name).toBe('New Name');
            expect(mockItemRepository.save).toHaveBeenCalled();
        });
    });

    describe('remove', () => {
        it('should remove an item', async () => {
            const item = {
                id: 'item-1',
                name: 'Test Item',
                groupId: 'group-1',
                boardId: 'board-1',
            };

            mockItemRepository.findOne.mockResolvedValue(item);
            mockItemRepository.remove.mockResolvedValue(item);

            await service.remove('item-1');

            expect(mockItemRepository.remove).toHaveBeenCalledWith(item);
        });
    });

    describe('updatePosition', () => {
        it('should update item position within same group', async () => {
            const item = {
                id: 'item-1',
                name: 'Test Item',
                groupId: 'group-1',
                boardId: 'board-1',
                position: 0,
            };

            const groupItems = [
                { id: 'item-1', position: 0 },
                { id: 'item-2', position: 1 },
                { id: 'item-3', position: 2 },
            ];

            mockItemRepository.findOne.mockResolvedValue(item);
            mockItemRepository.find.mockResolvedValue(groupItems);
            mockItemRepository.manager.transaction.mockImplementation(
                async (callback) => callback({
                    save: jest.fn().mockResolvedValue(item),
                }),
            );

            const result = await service.updatePosition('item-1', {
                groupId: 'group-1',
                position: 2,
            });

            expect(mockItemRepository.findOne).toHaveBeenCalled();
            expect(result).toBeDefined();
        });

        it('should move item to different group', async () => {
            const item = {
                id: 'item-1',
                name: 'Test Item',
                groupId: 'group-1',
                boardId: 'board-1',
                position: 0,
            };

            mockItemRepository.findOne.mockResolvedValue(item);
            mockItemRepository.find.mockResolvedValue([]);
            mockItemRepository.manager.transaction.mockImplementation(
                async (callback) => callback({
                    save: jest.fn().mockResolvedValue({ ...item, groupId: 'group-2' }),
                }),
            );

            const result = await service.updatePosition('item-1', {
                groupId: 'group-2',
                position: 0,
            });

            expect(result).toBeDefined();
        });
    });
});
