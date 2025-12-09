import { Test, TestingModule } from '@nestjs/testing';
import { TicketsService } from './tickets.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Ticket, TicketStatus, TicketPriority } from './entities/ticket.entity';
import { UsersService } from '../users/users.service';
import { CategoriesService } from '../categories/categories.service';
import { User, UserRole } from '../users/entities/user.entity';
import { Category } from '../categories/entities/category.entity';
import { Client } from '../users/entities/client.entity';
import { Technician } from '../users/entities/technician.entity';
import { BadRequestException, NotFoundException } from '@nestjs/common';

const mockTicketRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    count: jest.fn(),
};

const mockUsersService = {
    findOne: jest.fn(),
};

const mockCategoriesService = {
    findOne: jest.fn(),
};

describe('TicketsService', () => {
    let service: TicketsService;
    let ticketRepository;
    let categoriesService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                TicketsService,
                { provide: getRepositoryToken(Ticket), useValue: mockTicketRepository },
                { provide: UsersService, useValue: mockUsersService },
                { provide: CategoriesService, useValue: mockCategoriesService },
            ],
        }).compile();

        service = module.get<TicketsService>(TicketsService);
        ticketRepository = module.get(getRepositoryToken(Ticket));
        categoriesService = module.get(CategoriesService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('create', () => {
        it('should create a ticket successfully', async () => {
            const createTicketDto = {
                title: 'Test Ticket',
                description: 'Test Description',
                priority: TicketPriority.MEDIUM,
                categoryId: 'cat-1',
            };
            const user = {
                role: UserRole.CLIENT,
                clientProfile: { id: 'client-1' } as Client,
            } as User;
            const category = { id: 'cat-1', name: 'Test Cat' } as Category;

            categoriesService.findOne.mockResolvedValue(category);
            ticketRepository.create.mockReturnValue({ ...createTicketDto, category, client: user.clientProfile, status: TicketStatus.OPEN });
            ticketRepository.save.mockResolvedValue({ id: 'ticket-1', ...createTicketDto, category, client: user.clientProfile, status: TicketStatus.OPEN });

            const result = await service.create(createTicketDto, user);
            expect(result).toEqual(expect.objectContaining({ title: 'Test Ticket' }));
            expect(ticketRepository.create).toHaveBeenCalled();
            expect(ticketRepository.save).toHaveBeenCalled();
        });

        it('should throw error if category not found', async () => {
            categoriesService.findOne.mockResolvedValue(null);
            const user = { role: UserRole.CLIENT } as User;
            await expect(service.create({ title: 'T', description: 'D', priority: TicketPriority.LOW, categoryId: 'bad' }, user)).rejects.toThrow(NotFoundException);
        });
    });

    describe('updateStatus', () => {
        it('should update status from OPEN to IN_PROGRESS', async () => {
            const ticket = { id: 't-1', status: TicketStatus.OPEN };
            const user = { role: UserRole.TECHNICIAN, technicianProfile: { id: 'tech-1' } } as User;

            ticketRepository.findOne.mockResolvedValue(ticket);
            ticketRepository.count.mockResolvedValue(0); // Less than 5 tickets
            ticketRepository.save.mockResolvedValue({ ...ticket, status: TicketStatus.IN_PROGRESS, technician: user.technicianProfile });
            (service as any).usersService.findOne.mockResolvedValue(user);

            const result = await service.updateStatus('t-1', TicketStatus.IN_PROGRESS, user);
            expect(result.status).toBe(TicketStatus.IN_PROGRESS);
        });

        it('should throw error for invalid transition', async () => {
            const ticket = { id: 't-1', status: TicketStatus.OPEN };
            const user = { role: UserRole.ADMIN } as User;
            ticketRepository.findOne.mockResolvedValue(ticket);

            await expect(service.updateStatus('t-1', TicketStatus.CLOSED, user)).rejects.toThrow(BadRequestException);
        });

        it('should throw error if technician has 5 tickets in progress', async () => {
            const ticket = { id: 't-1', status: TicketStatus.OPEN };
            const user = { role: UserRole.TECHNICIAN, technicianProfile: { id: 'tech-1' } } as User;

            ticketRepository.findOne.mockResolvedValue(ticket);
            ticketRepository.count.mockResolvedValue(5);
            (service as any).usersService.findOne.mockResolvedValue(user);

            await expect(service.updateStatus('t-1', TicketStatus.IN_PROGRESS, user)).rejects.toThrow(BadRequestException);
        });
    });
});
