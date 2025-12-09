import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ticket, TicketStatus } from './entities/ticket.entity';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UsersService } from '../users/users.service';
import { CategoriesService } from '../categories/categories.service';
import { User, UserRole } from '../users/entities/user.entity';

@Injectable()
export class TicketsService {
    constructor(
        @InjectRepository(Ticket)
        private ticketsRepository: Repository<Ticket>,
        private usersService: UsersService,
        private categoriesService: CategoriesService,
    ) { }

    async create(createTicketDto: CreateTicketDto, user: User) {
        console.log('Creating ticket for user:', user);
        console.log('User client profile:', user.clientProfile);

        const category = await this.categoriesService.findOne(createTicketDto.categoryId);
        if (!category) {
            throw new NotFoundException('Category not found');
        }

        if (!user.clientProfile) {
            // Ideally this should be handled by ensuring the user is a client, but for safety:
            // If the user is an admin creating a ticket, we might need to specify the client.
            // For now, assuming only clients create tickets for themselves as per requirements "Cliente: puede registrar nuevos tickets".
            if (user.role !== UserRole.CLIENT) {
                throw new BadRequestException('Only clients can create tickets');
            }
            // If user is client but profile is missing, try to fetch it
            // Note: user object from JWT strategy has userId, not id
            const userId = (user as any).userId || user.id;
            const fullUser = await this.usersService.findOne(userId);
            if (fullUser && fullUser.clientProfile) {
                user.clientProfile = fullUser.clientProfile;
            } else {
                throw new BadRequestException('Client profile not found for user');
            }
        }

        const ticket = this.ticketsRepository.create({
            ...createTicketDto,
            category,
            client: user.clientProfile,
            status: TicketStatus.OPEN,
        });

        return this.ticketsRepository.save(ticket);
    }

    async findAll() {
        return this.ticketsRepository.find({ relations: ['client', 'technician', 'category'] });
    }

    async findOne(id: string) {
        const ticket = await this.ticketsRepository.findOne({ where: { id }, relations: ['client', 'technician', 'category'] });
        if (!ticket) throw new NotFoundException(`Ticket with ID ${id} not found`);
        return ticket;
    }

    async findByClient(userId: string) {
        console.log(`Finding tickets for client (User ID): ${userId}`);
        const tickets = await this.ticketsRepository.find({
            where: { client: { user: { id: userId } } },
            relations: ['category', 'technician', 'client', 'client.user']
        });
        console.log(`Found ${tickets.length} tickets for client ${userId}`);
        return tickets;
    }

    async findByTechnician(userId: string) {
        return this.ticketsRepository.find({
            where: { technician: { user: { id: userId } } },
            relations: ['category', 'client', 'client.user']
        });
    }

    async updateStatus(id: string, status: TicketStatus, user: User) {
        const ticket = await this.findOne(id);

        // Validation: Technician max 5 tickets in progress
        if (status === TicketStatus.IN_PROGRESS) {
            if (user.role === UserRole.TECHNICIAN) {
                const inProgressCount = await this.ticketsRepository.count({
                    where: {
                        technician: { id: user.technicianProfile.id },
                        status: TicketStatus.IN_PROGRESS
                    }
                });
                if (inProgressCount >= 5) {
                    throw new BadRequestException('Technician cannot have more than 5 tickets in progress');
                }
                // Assign technician if not assigned?
                if (!ticket.technician) {
                    ticket.technician = user.technicianProfile;
                }
            }
        }

        // Validation: Status flow
        // Abierto → En progreso → Resuelto → Cerrado
        const validTransitions: Record<TicketStatus, TicketStatus[]> = {
            [TicketStatus.OPEN]: [TicketStatus.IN_PROGRESS],
            [TicketStatus.IN_PROGRESS]: [TicketStatus.RESOLVED],
            [TicketStatus.RESOLVED]: [TicketStatus.CLOSED],
            [TicketStatus.CLOSED]: [],
        };

        if (!validTransitions[ticket.status].includes(status)) {
            throw new BadRequestException(`Invalid status transition from ${ticket.status} to ${status}`);
        }

        ticket.status = status;
        return this.ticketsRepository.save(ticket);
    }
}
