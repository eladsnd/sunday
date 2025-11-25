import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AutomationsService } from './automations.service';
import { Automation } from '../entities/automation.entity';
import { ItemsService } from '../items/items.service';
import { GroupsService } from '../groups/groups.service';

describe('AutomationsService', () => {
    let service: AutomationsService;
    let automationRepository: Repository<Automation>;
    let itemsService: ItemsService;

    const mockAutomationRepository = {
        create: jest.fn(),
        save: jest.fn(),
        find: jest.fn(),
        delete: jest.fn(),
    };

    const mockItemsService = {
        updatePosition: jest.fn(),
    };

    const mockGroupsService = {};

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AutomationsService,
                {
                    provide: getRepositoryToken(Automation),
                    useValue: mockAutomationRepository,
                },
                {
                    provide: ItemsService,
                    useValue: mockItemsService,
                },
                {
                    provide: GroupsService,
                    useValue: mockGroupsService,
                },
            ],
        }).compile();

        service = module.get<AutomationsService>(AutomationsService);
        automationRepository = module.get<Repository<Automation>>(
            getRepositoryToken(Automation),
        );
        itemsService = module.get<ItemsService>(ItemsService);

        // Clear all mocks before each test
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('create', () => {
        it('should create an automation', async () => {
            const createDto = {
                boardId: 'board-1',
                triggerType: 'status_change',
                triggerConfig: { columnId: 'col-1', value: 'Done' },
                actionType: 'move_to_group',
                actionConfig: { groupId: 'group-1' },
            };

            const savedAutomation = { id: 'auto-1', ...createDto };
            mockAutomationRepository.create.mockReturnValue(savedAutomation);
            mockAutomationRepository.save.mockResolvedValue(savedAutomation);

            const result = await service.create(createDto);

            expect(mockAutomationRepository.create).toHaveBeenCalledWith(createDto);
            expect(mockAutomationRepository.save).toHaveBeenCalledWith(savedAutomation);
            expect(result).toEqual(savedAutomation);
        });
    });

    describe('findAll', () => {
        it('should return all automations for a board', async () => {
            const boardId = 'board-1';
            const automations = [
                { id: 'auto-1', boardId, triggerType: 'status_change' },
                { id: 'auto-2', boardId, triggerType: 'status_change' },
            ];

            mockAutomationRepository.find.mockResolvedValue(automations);

            const result = await service.findAll(boardId);

            expect(mockAutomationRepository.find).toHaveBeenCalledWith({
                where: { boardId },
            });
            expect(result).toEqual(automations);
        });
    });

    describe('delete', () => {
        it('should delete an automation', async () => {
            const id = 'auto-1';
            mockAutomationRepository.delete.mockResolvedValue({ affected: 1 });

            const result = await service.delete(id);

            expect(mockAutomationRepository.delete).toHaveBeenCalledWith(id);
            expect(result).toEqual({ affected: 1 });
        });
    });

    describe('checkAndExecuteAutomations', () => {
        it('should execute matching automation', async () => {
            const boardId = 'board-1';
            const automation = {
                id: 'auto-1',
                boardId,
                triggerType: 'status_change',
                triggerConfig: { columnId: 'col-1', value: 'Done' },
                actionType: 'move_to_group',
                actionConfig: { groupId: 'group-1' },
            };

            mockAutomationRepository.find.mockResolvedValue([automation]);
            mockItemsService.updatePosition.mockResolvedValue({});

            await service.checkAndExecuteAutomations(boardId, 'status_change', {
                columnId: 'col-1',
                value: 'Done',
                itemId: 'item-1',
            });

            expect(mockAutomationRepository.find).toHaveBeenCalledWith({
                where: { boardId, triggerType: 'status_change' },
            });
            expect(mockItemsService.updatePosition).toHaveBeenCalledWith('item-1', {
                groupId: 'group-1',
                position: 0,
            });
        });

        it('should not execute non-matching automation', async () => {
            const boardId = 'board-1';
            const automation = {
                id: 'auto-1',
                boardId,
                triggerType: 'status_change',
                triggerConfig: { columnId: 'col-1', value: 'Done' },
                actionType: 'move_to_group',
                actionConfig: { groupId: 'group-1' },
            };

            mockAutomationRepository.find.mockResolvedValue([automation]);

            await service.checkAndExecuteAutomations(boardId, 'status_change', {
                columnId: 'col-1',
                value: 'In Progress', // Different value
                itemId: 'item-1',
            });

            expect(mockItemsService.updatePosition).not.toHaveBeenCalled();
        });

        it('should not execute automation with different column', async () => {
            const boardId = 'board-1';
            const automation = {
                id: 'auto-1',
                boardId,
                triggerType: 'status_change',
                triggerConfig: { columnId: 'col-1', value: 'Done' },
                actionType: 'move_to_group',
                actionConfig: { groupId: 'group-1' },
            };

            mockAutomationRepository.find.mockResolvedValue([automation]);

            await service.checkAndExecuteAutomations(boardId, 'status_change', {
                columnId: 'col-2', // Different column
                value: 'Done',
                itemId: 'item-1',
            });

            expect(mockItemsService.updatePosition).not.toHaveBeenCalled();
        });
    });
});
