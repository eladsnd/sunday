import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Board } from '../entities/board.entity';
import { Group } from '../entities/group.entity';
import { Item } from '../entities/item.entity';
import { BoardColumn, ColumnType } from '../entities/column.entity';
import { CellValue } from '../entities/cell-value.entity';
import { CreateBoardDto } from './dto/create-board.dto';
import { UpdateBoardDto } from './dto/update-board.dto';

@Injectable()
export class BoardsService {
    constructor(
        @InjectRepository(Board)
        private boardRepository: Repository<Board>,
        @InjectRepository(Group)
        private groupRepository: Repository<Group>,
        @InjectRepository(Item)
        private itemRepository: Repository<Item>,
        @InjectRepository(BoardColumn)
        private columnRepository: Repository<BoardColumn>,
        @InjectRepository(CellValue)
        private cellValueRepository: Repository<CellValue>,
    ) { }

    async findAll(): Promise<Board[]> {
        return this.boardRepository.find({
            select: ['id', 'name', 'description', 'createdAt', 'updatedAt'],
            order: { createdAt: 'DESC' },
        });
    }

    async findOne(id: string): Promise<Board> {
        const board = await this.boardRepository.findOne({
            where: { id },
            relations: ['groups', 'columns', 'items', 'items.cellValues'],
            order: {
                columns: { position: 'ASC' },
                groups: { position: 'ASC' },
                items: { position: 'ASC' },
            },
        });

        if (!board) {
            throw new NotFoundException(`Board with ID ${id} not found`);
        }

        return board;
    }

    async create(createBoardDto: CreateBoardDto): Promise<Board> {
        const board = this.boardRepository.create(createBoardDto);
        return this.boardRepository.save(board);
    }

    async update(id: string, updateBoardDto: UpdateBoardDto): Promise<Board> {
        const board = await this.findOne(id);
        Object.assign(board, updateBoardDto);
        return this.boardRepository.save(board);
    }

    async remove(id: string): Promise<void> {
        const board = await this.findOne(id);
        await this.boardRepository.remove(board);
    }

    async seedJobSearchBoard(): Promise<Board> {
        // Create board
        const board = this.boardRepository.create({
            name: 'Main Board',
            description: 'Organize and track your work in one place',
        });
        await this.boardRepository.save(board);

        // Create columns
        const columns = [
            {
                label: 'Job Title',
                type: ColumnType.TEXT,
                position: 0,
                settings: null,
            },
            {
                label: 'Company',
                type: ColumnType.TEXT,
                position: 1,
                settings: null,
            },
            {
                label: 'Status',
                type: ColumnType.STATUS,
                position: 2,
                settings: {
                    options: [
                        { label: 'Applied', color: '#579BFC' },
                        { label: 'Phone Screen', color: '#A25DDC' },
                        { label: 'Interview', color: '#FDAB3D' },
                        { label: 'Offer', color: '#00C875' },
                        { label: 'Accepted', color: '#037F4C' },
                        { label: 'Rejected', color: '#E44258' },
                        { label: 'Withdrawn', color: '#C4C4C4' },
                    ],
                },
            },
            {
                label: 'Applied Date',
                type: ColumnType.DATE,
                position: 3,
                settings: null,
            },
            {
                label: 'Interview Timeline',
                type: ColumnType.TIMELINE,
                position: 4,
                settings: null,
            },
            {
                label: 'Priority',
                type: ColumnType.PRIORITY,
                position: 5,
                settings: {
                    options: [
                        { label: 'High', color: '#E44258' },
                        { label: 'Medium', color: '#FDAB3D' },
                        { label: 'Low', color: '#579BFC' },
                    ],
                },
            },
            {
                label: 'Salary Range',
                type: ColumnType.TEXT,
                position: 6,
                settings: null,
            },
            {
                label: 'Job Posting',
                type: ColumnType.LINK,
                position: 7,
                settings: null,
            },
            {
                label: 'Contact Person',
                type: ColumnType.TEXT,
                position: 8,
                settings: null,
            },
            {
                label: 'Notes',
                type: ColumnType.TEXT,
                position: 9,
                settings: null,
            },
        ];

        const savedColumns = await Promise.all(
            columns.map((col) =>
                this.columnRepository.save({
                    ...col,
                    boardId: board.id,
                }),
            ),
        );

        // Create groups
        const activeGroup = await this.groupRepository.save({
            name: 'Active Applications',
            position: 0,
            color: '#6C63FF',
            boardId: board.id,
        });

        const followUpGroup = await this.groupRepository.save({
            name: 'Follow Up',
            position: 1,
            color: '#FDAB3D',
            boardId: board.id,
        });

        const closedGroup = await this.groupRepository.save({
            name: 'Closed',
            position: 2,
            color: '#C4C4C4',
            boardId: board.id,
        });

        // Create sample items
        const sampleJobs = [
            {
                name: 'Senior Full Stack Developer',
                groupId: activeGroup.id,
                position: 0,
                cells: {
                    'Company': 'Google',
                    'Status': 'Interview',
                    'Applied Date': '2024-11-15',
                    'Priority': 'High',
                    'Salary Range': '$150k - $180k',
                    'Job Posting': 'https://careers.google.com/jobs/12345',
                    'Contact Person': 'Jane Smith - Technical Recruiter',
                    'Notes': 'Third round scheduled for next week',
                },
            },
            {
                name: 'Backend Engineer',
                groupId: activeGroup.id,
                position: 1,
                cells: {
                    'Company': 'Microsoft',
                    'Status': 'Phone Screen',
                    'Applied Date': '2024-11-18',
                    'Priority': 'High',
                    'Salary Range': '$140k - $170k',
                    'Job Posting': 'https://careers.microsoft.com/jobs/67890',
                    'Contact Person': 'John Doe',
                    'Notes': 'Initial screening went well',
                },
            },
            {
                name: 'TypeScript Developer',
                groupId: followUpGroup.id,
                position: 0,
                cells: {
                    'Company': 'Stripe',
                    'Status': 'Applied',
                    'Applied Date': '2024-11-20',
                    'Priority': 'Medium',
                    'Salary Range': '$130k - $160k',
                    'Job Posting': 'https://stripe.com/jobs/positions/typescript-dev',
                    'Contact Person': '',
                    'Notes': 'Need to follow up next week',
                },
            },
            {
                name: 'Full Stack Engineer',
                groupId: closedGroup.id,
                position: 0,
                cells: {
                    'Company': 'Amazon',
                    'Status': 'Rejected',
                    'Applied Date': '2024-11-01',
                    'Priority': 'Low',
                    'Salary Range': '$145k - $175k',
                    'Job Posting': 'https://amazon.jobs/en/jobs/12345',
                    'Contact Person': 'Sarah Johnson',
                    'Notes': 'Did not pass coding assessment',
                },
            },
        ];

        for (const job of sampleJobs) {
            const item = await this.itemRepository.save({
                name: job.name,
                groupId: job.groupId,
                boardId: board.id,
                position: job.position,
            });

            // Create cell values
            for (const [columnLabel, value] of Object.entries(job.cells)) {
                if (value) {
                    const column = savedColumns.find((col) => col.label === columnLabel);
                    if (column) {
                        await this.cellValueRepository.save({
                            itemId: item.id,
                            columnId: column.id,
                            value: { text: value },
                        });
                    }
                }
            }
        }

        return this.findOne(board.id);
    }
}
