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

        const priorities = [TicketPriority.LOW, TicketPriority.MEDIUM, TicketPriority.HIGH];
        const statuses = [TicketStatus.OPEN, TicketStatus.IN_PROGRESS, TicketStatus.RESOLVED, TicketStatus.CLOSED];

        // 1. Ensure Clients 1-5 have at least 3 tickets each
        for (let i = 1; i <= 5; i++) {
            const email = `client${i}@techhelpdesk.com`;
            const user = await this.userRepository.findOne({ where: { email }, relations: ['clientProfile'] });

            if (user && user.clientProfile) {
                const currentCount = await this.ticketRepository.count({ where: { client: { id: user.clientProfile.id } } });
                const targetCount = 3;

                if (currentCount < targetCount) {
                    console.log(`Seeder: Creating tickets for ${email}...`);
                    for (let j = currentCount; j < targetCount; j++) {
                        const category = categories[j % categories.length];
                        const status = statuses[j % statuses.length];
                        const priority = priorities[j % priorities.length];

                        // Randomly assign a technician if not OPEN
                        let assignedTech: Technician | null = null;
                        if (status !== TicketStatus.OPEN) {
                            assignedTech = technicians[Math.floor(Math.random() * technicians.length)];
                        }

                        await this.ticketRepository.save({
                            title: `Issue ${j + 1} for ${user.name}`,
                            description: `Auto-generated ticket for ${user.name}. Category: ${category.name}.`,
                            priority,
                            status,
                            category,
                            client: user.clientProfile,
                            technician: assignedTech || undefined
                        });
                    }
                }
            }
        }

        // 2. Ensure Technicians 1-3 have at least 3 assigned tickets each
        for (let i = 1; i <= 3; i++) {
            const email = `tech${i}@techhelpdesk.com`;
            const user = await this.userRepository.findOne({ where: { email }, relations: ['technicianProfile'] });

            if (user && user.technicianProfile) {
                const currentCount = await this.ticketRepository.count({ where: { technician: { id: user.technicianProfile.id } } });
                const targetCount = 3;

                if (currentCount < targetCount) {
                    console.log(`Seeder: Assigning tickets to ${email}...`);
                    for (let j = currentCount; j < targetCount; j++) {
                        const category = categories[(j + 2) % categories.length]; // Offset category
                        const status = TicketStatus.IN_PROGRESS;
                        const priority = TicketPriority.HIGH;
                        const client = clients[Math.floor(Math.random() * clients.length)];

                        await this.ticketRepository.save({
                            title: `Assigned Task ${j + 1} for ${user.name}`,
                            description: `Task assigned to ${user.name}. Priority: ${priority}.`,
                            priority,
                            status,
                            category,
                            client,
                            technician: user.technicianProfile
                        });
                    }
                }
            }
        }
    }
}