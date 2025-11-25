import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BoardsService } from './boards.service';
import { Board } from '../entities/board.entity';
import { Group } from '../entities/group.entity';
import { Item } from '../entities/item.entity';
import { BoardColumn } from '../entities/column.entity';
import { CellValue } from '../entities/cell-value.entity';
import { NotFoundException } from '@nestjs/common';

describe('BoardsService', () => {
    let service: BoardsService;
    let boardRepository: Repository<Board>;

    const mockBoardRepository = {
        find: jest.fn(),
        findOne: jest.fn(),
        create: jest.fn(),
        save: jest.fn(),
        remove: jest.fn(),
    };

    const mockGroupRepository = {
        save: jest.fn(),
    };

    const mockItemRepository = {
        save: jest.fn(),
    };

    const mockColumnRepository = {
        save: jest.fn(),
    };

    const mockCellValueRepository = {
        save: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                BoardsService,
                {
                    provide: getRepositoryToken(Board),
                    useValue: mockBoardRepository,
                },
                {
                    provide: getRepositoryToken(Group),
                    useValue: mockGroupRepository,
                },
                {
                    provide: getRepositoryToken(Item),
                    useValue: mockItemRepository,
                },
                {
                    provide: getRepositoryToken(BoardColumn),
                    useValue: mockColumnRepository,
                },
                {
                    provide: getRepositoryToken(CellValue),
                    useValue: mockCellValueRepository,
                },
            ],
        }).compile();

        service = module.get<BoardsService>(BoardsService);
        boardRepository = module.get<Repository<Board>>(getRepositoryToken(Board));

        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('findAll', () => {
        it('should return all boards', async () => {
            const boards = [
                { id: 'board-1', name: 'Board 1' },
                { id: 'board-2', name: 'Board 2' },
            ];

            mockBoardRepository.find.mockResolvedValue(boards);

            const result = await service.findAll();

            expect(mockBoardRepository.find).toHaveBeenCalled();
            expect(result).toEqual(boards);
        });
    });

    describe('findOne', () => {
        it('should return a board with relations', async () => {
            const board = {
                id: 'board-1',
                name: 'Test Board',
                groups: [],
                columns: [],
                items: [],
            };

            mockBoardRepository.findOne.mockResolvedValue(board);

            const result = await service.findOne('board-1');

            expect(mockBoardRepository.findOne).toHaveBeenCalledWith({
                where: { id: 'board-1' },
                relations: ['groups', 'columns', 'items', 'items.cellValues'],
                order: expect.any(Object),
            });
            expect(result).toEqual(board);
        });

        it('should throw NotFoundException when board not found', async () => {
            mockBoardRepository.findOne.mockResolvedValue(null);

            await expect(service.findOne('non-existent')).rejects.toThrow(
                NotFoundException,
            );
        });
    });

    describe('create', () => {
        it('should create a board', async () => {
            const createDto = {
                name: 'New Board',
                description: 'Test description',
            };

            const savedBoard = {
                id: 'board-1',
                ...createDto,
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            mockBoardRepository.create.mockReturnValue(savedBoard);
            mockBoardRepository.save.mockResolvedValue(savedBoard);

            const result = await service.create(createDto);

            expect(mockBoardRepository.create).toHaveBeenCalledWith(createDto);
            expect(mockBoardRepository.save).toHaveBeenCalledWith(savedBoard);
            expect(result).toEqual(savedBoard);
        });
    });

    describe('update', () => {
        it('should update a board', async () => {
            const board = {
                id: 'board-1',
                name: 'Old Name',
                description: 'Old description',
                groups: [],
                columns: [],
                items: [],
            };

            const updateDto = {
                name: 'New Name',
            };

            mockBoardRepository.findOne.mockResolvedValue(board);
            mockBoardRepository.save.mockResolvedValue({ ...board, ...updateDto });

            const result = await service.update('board-1', updateDto);

            expect(result.name).toBe('New Name');
            expect(mockBoardRepository.save).toHaveBeenCalled();
        });
    });

    describe('remove', () => {
        it('should remove a board', async () => {
            const board = {
                id: 'board-1',
                name: 'Test Board',
                groups: [],
                columns: [],
                items: [],
            };

            mockBoardRepository.findOne.mockResolvedValue(board);
            mockBoardRepository.remove.mockResolvedValue(board);

            await service.remove('board-1');

            expect(mockBoardRepository.remove).toHaveBeenCalledWith(board);
        });
    });
});
