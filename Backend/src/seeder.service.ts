import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from './users/entities/user.entity';
import { Category } from './categories/entities/category.entity';
import * as bcrypt from 'bcrypt';
import { Client } from './users/entities/client.entity';
import { Technician } from './users/entities/technician.entity';
import { Ticket, TicketPriority, TicketStatus } from './tickets/entities/ticket.entity';

@Injectable()
export class SeederService implements OnModuleInit {
    constructor(
        @InjectRepository(User) private userRepository: Repository<User>,
        @InjectRepository(Category) private categoryRepository: Repository<Category>,
        @InjectRepository(Client) private clientRepository: Repository<Client>,
        @InjectRepository(Technician) private technicianRepository: Repository<Technician>,
        @InjectRepository(Ticket) private ticketRepository: Repository<Ticket>,
    ) { }

    async onModuleInit() {
        console.log('SeederService: Initializing...');
        await this.seedUsers();
        await this.seedCategories();
        await this.seedTickets();
        console.log('SeederService: Finished.');
    }

    async seedCategories() {
        const categories = [
            { name: 'Hardware', description: 'Hardware related issues' },
            { name: 'Software', description: 'Software installation and bugs' },
            { name: 'Network', description: 'Internet and connectivity issues' },
            { name: 'Security', description: 'Security incidents and access control' },
            { name: 'Other', description: 'Miscellaneous inquiries' },
        ];

        for (const category of categories) {
            let existingCategory = await this.categoryRepository.findOne({ where: { name: category.name } });
            if (!existingCategory) {
                existingCategory = this.categoryRepository.create(category);
                await this.categoryRepository.save(existingCategory);
            }
        }
    }



    async seedUsers() {
        // Admin
        const adminEmail = 'admin@techhelpdesk.com';
        let adminUser = await this.userRepository.findOne({ where: { email: adminEmail } });
        const adminPass = await bcrypt.hash('admin123', 10);
        if (!adminUser) {
            try {
                adminUser = this.userRepository.create({
                    name: 'Admin User',
                    email: adminEmail,
                    password: adminPass,
                    role: UserRole.ADMIN,
                });
                await this.userRepository.save(adminUser);
            } catch (error) {
                console.log(`User ${adminEmail} already exists or error creating:`, error.message);
            }
        }

        // Technicians (3)
        for (let i = 1; i <= 3; i++) {
            const email = `tech${i}@techhelpdesk.com`;
            let user = await this.userRepository.findOne({ where: { email }, relations: ['technicianProfile'] });

            if (!user) {
                try {
                    user = this.userRepository.create({
                        name: `Technician ${i}`,
                        email,
                        password: await bcrypt.hash('tech123', 10),
                        role: UserRole.TECHNICIAN,
                    });
                    await this.userRepository.save(user);
                } catch (error) {
                    console.log(`Error creating user ${email}:`, error.message);
                    user = await this.userRepository.findOne({ where: { email }, relations: ['technicianProfile'] });
                }
            }

            if (user && !user.technicianProfile) {
                const existingProfile = await this.technicianRepository.findOne({ where: { user: { id: user.id } } });
                if (!existingProfile) {
                    await this.technicianRepository.save({
                        specialty: i === 1 ? 'Hardware' : i === 2 ? 'Software' : 'Network',
                        user
                    });
                }
            }
        }

        // Clients (5)
        for (let i = 1; i <= 5; i++) {
            const email = `client${i}@techhelpdesk.com`;
            let user = await this.userRepository.findOne({ where: { email }, relations: ['clientProfile'] });

            if (!user) {
                try {
                    user = this.userRepository.create({
                        name: `Client ${i}`,
                        email,
                        password: await bcrypt.hash('client123', 10),
                        role: UserRole.CLIENT,
                    });
                    await this.userRepository.save(user);
                } catch (error) {
                    console.log(`Error creating user ${email}:`, error.message);
                    user = await this.userRepository.findOne({ where: { email }, relations: ['clientProfile'] });
                }
            }

            if (user && !user.clientProfile) {
                const existingProfile = await this.clientRepository.findOne({ where: { user: { id: user.id } } });
                if (!existingProfile) {
                    await this.clientRepository.save({
                        company: `Company ${i}`,
                        contactEmail: `contact${i}@company.com`,
                        user
                    });
                }
            }
        }
    }

    async seedTickets() {
        const clients = await this.clientRepository.find({ relations: ['user'] });
        const technicians = await this.technicianRepository.find({ relations: ['user'] });
        const categories = await this.categoryRepository.find();

        if (clients.length === 0 || technicians.length === 0 || categories.length === 0) return;

        const ticketCount = await this.ticketRepository.count();
        if (ticketCount >= 20) return; // Don't seed if we already have enough tickets

        const priorities = [TicketPriority.LOW, TicketPriority.MEDIUM, TicketPriority.HIGH];
        const statuses = [TicketStatus.OPEN, TicketStatus.IN_PROGRESS, TicketStatus.RESOLVED, TicketStatus.CLOSED];

        for (let i = 1; i <= 20; i++) {
            const client = clients[Math.floor(Math.random() * clients.length)];
            const technician = Math.random() > 0.3 ? technicians[Math.floor(Math.random() * technicians.length)] : null;
            const category = categories[Math.floor(Math.random() * categories.length)];
            const status = statuses[Math.floor(Math.random() * statuses.length)];
            const priority = priorities[Math.floor(Math.random() * priorities.length)];

            const ticket = this.ticketRepository.create({
                title: `Ticket Issue #${i}`,
                description: `This is a generated description for ticket #${i}. It involves ${category.name}.`,
                priority,
                status,
                category,
                client,
                technician: status !== TicketStatus.OPEN ? (technician || undefined) : undefined // Open tickets might not have tech yet
            });
            await this.ticketRepository.save(ticket);
        }

        // GUARANTEE: Ensure EVERY client (1-5) has at least one ticket
        for (let i = 1; i <= 5; i++) {
            const email = `client${i}@techhelpdesk.com`;
            const user = await this.userRepository.findOne({ where: { email }, relations: ['clientProfile'] });

            if (user && user.clientProfile) {
                const count = await this.ticketRepository.count({ where: { client: { id: user.clientProfile.id } } });
                if (count === 0) {
                    console.log(`Seeder: Backfilling tickets for ${email}...`);
                    await this.ticketRepository.save({
                        title: `Issue for Client ${i}`,
                        description: `Auto-generated ticket for client ${i} to ensure visibility.`,
                        priority: TicketPriority.MEDIUM,
                        status: TicketStatus.OPEN,
                        category: categories[0],
                        client: user.clientProfile
                    });
                }
            }
        }

        // GUARANTEE: Ensure EVERY technician (1-3) has at least one assigned ticket
        for (let i = 1; i <= 3; i++) {
            const email = `tech${i}@techhelpdesk.com`;
            const user = await this.userRepository.findOne({ where: { email }, relations: ['technicianProfile'] });

            if (user && user.technicianProfile) {
                const count = await this.ticketRepository.count({ where: { technician: { id: user.technicianProfile.id } } });
                if (count === 0) {
                    console.log(`Seeder: Backfilling assignment for ${email}...`);
                    // Assign to a random client
                    const randomClient = clients[Math.floor(Math.random() * clients.length)];
                    await this.ticketRepository.save({
                        title: `Assigned Task for Tech ${i}`,
                        description: `Auto-generated assignment for technician ${i}.`,
                        priority: TicketPriority.HIGH,
                        status: TicketStatus.IN_PROGRESS,
                        category: categories[1],
                        client: randomClient,
                        technician: user.technicianProfile
                    });
                }
            }
        }
    }
}
