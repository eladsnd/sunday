import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, EntityManager } from 'typeorm';
import { CellsService } from './cells.service';
import { CellValue } from '../entities/cell-value.entity';
import { Item } from '../entities/item.entity';
import { AutomationsService } from '../automations/automations.service';

describe('CellsService', () => {
    let service: CellsService;
    let cellValueRepository: Repository<CellValue>;
    let automationsService: AutomationsService;

    const mockCellValueRepository = {
        findOne: jest.fn(),
        create: jest.fn(),
        save: jest.fn(),
        manager: {
            findOne: jest.fn(),
        } as Partial<EntityManager>,
    };

    const mockAutomationsService = {
        checkAndExecuteAutomations: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                CellsService,
                {
                    provide: getRepositoryToken(CellValue),
                    useValue: mockCellValueRepository,
                },
                {
                    provide: AutomationsService,
                    useValue: mockAutomationsService,
                },
            ],
        }).compile();

        service = module.get<CellsService>(CellsService);
        cellValueRepository = module.get<Repository<CellValue>>(
            getRepositoryToken(CellValue),
        );
        automationsService = module.get<AutomationsService>(AutomationsService);

        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('updateCellValue', () => {
        it('should update existing cell value', async () => {
            const itemId = 'item-1';
            const columnId = 'col-1';
            const updateDto = { value: { text: 'New Value' } };

            const existingCell = {
                id: 'cell-1',
                itemId,
                columnId,
                value: { text: 'Old Value' },
            };

            const item = {
                id: itemId,
                group: { id: 'group-1', boardId: 'board-1' },
            };

            mockCellValueRepository.findOne.mockResolvedValue(existingCell);
            mockCellValueRepository.save.mockResolvedValue({
                ...existingCell,
                value: updateDto.value,
            });
            (mockCellValueRepository.manager.findOne as jest.Mock).mockResolvedValue(item);

            const result = await service.updateCellValue(itemId, columnId, updateDto);

            expect(mockCellValueRepository.findOne).toHaveBeenCalledWith({
                where: { itemId, columnId },
            });
            expect(mockCellValueRepository.save).toHaveBeenCalled();
            expect(mockAutomationsService.checkAndExecuteAutomations).toHaveBeenCalledWith(
                'board-1',
                'status_change',
                {
                    columnId,
                    value: 'New Value', // Should extract text from { text: 'New Value' }
                    itemId,
                },
            );
        });

        it('should create new cell value if not exists', async () => {
            const itemId = 'item-1';
            const columnId = 'col-1';
            const updateDto = { value: { text: 'New Value' } };

            const newCell = {
                id: 'cell-1',
                itemId,
                columnId,
                value: updateDto.value,
            };

            const item = {
                id: itemId,
                group: { id: 'group-1', boardId: 'board-1' },
            };

            mockCellValueRepository.findOne.mockResolvedValue(null);
            mockCellValueRepository.create.mockReturnValue(newCell);
            mockCellValueRepository.save.mockResolvedValue(newCell);
            (mockCellValueRepository.manager.findOne as jest.Mock).mockResolvedValue(item);

            const result = await service.updateCellValue(itemId, columnId, updateDto);

            expect(mockCellValueRepository.create).toHaveBeenCalledWith({
                itemId,
                columnId,
                value: updateDto.value,
            });
            expect(mockCellValueRepository.save).toHaveBeenCalled();
            expect(mockAutomationsService.checkAndExecuteAutomations).toHaveBeenCalled();
        });

        it('should extract text value from object for automation', async () => {
            const itemId = 'item-1';
            const columnId = 'col-1';
            const updateDto = { value: { text: 'Accepted' } };

            const existingCell = {
                id: 'cell-1',
                itemId,
                columnId,
                value: { text: 'Pending' },
            };

            const item = {
                id: itemId,
                group: { id: 'group-1', boardId: 'board-1' },
            };

            mockCellValueRepository.findOne.mockResolvedValue(existingCell);
            mockCellValueRepository.save.mockResolvedValue({
                ...existingCell,
                value: updateDto.value,
            });
            (mockCellValueRepository.manager.findOne as jest.Mock).mockResolvedValue(item);

            await service.updateCellValue(itemId, columnId, updateDto);

            expect(mockAutomationsService.checkAndExecuteAutomations).toHaveBeenCalledWith(
                'board-1',
                'status_change',
                expect.objectContaining({
                    value: 'Accepted', // Should be the string, not the object
                }),
            );
        });

        it('should not trigger automation if item has no group', async () => {
            const itemId = 'item-1';
            const columnId = 'col-1';
            const updateDto = { value: { text: 'New Value' } };

            const existingCell = {
                id: 'cell-1',
                itemId,
                columnId,
                value: { text: 'Old Value' },
            };

            const item = {
                id: itemId,
                group: null, // No group
            };

            mockCellValueRepository.findOne.mockResolvedValue(existingCell);
            mockCellValueRepository.save.mockResolvedValue({
                ...existingCell,
                value: updateDto.value,
            });
            (mockCellValueRepository.manager.findOne as jest.Mock).mockResolvedValue(item);

            await service.updateCellValue(itemId, columnId, updateDto);

            expect(mockAutomationsService.checkAndExecuteAutomations).not.toHaveBeenCalled();
        });
    });
});
