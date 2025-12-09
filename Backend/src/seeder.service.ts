import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from './users/entities/user.entity';
import { Category } from './categories/entities/category.entity';
import * as bcrypt from 'bcrypt';
import { Client } from './users/entities/client.entity';
import { Technician } from './users/entities/technician.entity';

@Injectable()
export class SeederService implements OnModuleInit {
    constructor(
        @InjectRepository(User) private userRepository: Repository<User>,
        @InjectRepository(Category) private categoryRepository: Repository<Category>,
        @InjectRepository(Client) private clientRepository: Repository<Client>,
        @InjectRepository(Technician) private technicianRepository: Repository<Technician>,
    ) { }

    async onModuleInit() {
        await this.seedUsers();
        await this.seedCategories();
    }

    async seedUsers() {
        const adminEmail = 'admin@techhelpdesk.com';
        const adminExists = await this.userRepository.findOne({ where: { email: adminEmail } });
        if (!adminExists) {
            const password = await bcrypt.hash('admin123', 10);
            await this.userRepository.save({
                name: 'Admin User',
                email: adminEmail,
                password,
                role: UserRole.ADMIN,
            });
        }

        const techEmail = 'tech@techhelpdesk.com';
        const techExists = await this.userRepository.findOne({ where: { email: techEmail } });
        if (!techExists) {
            const password = await bcrypt.hash('tech123', 10);
            const user = await this.userRepository.save({
                name: 'Technician User',
                email: techEmail,
                password,
                role: UserRole.TECHNICIAN,
            });
            await this.technicianRepository.save({
                specialty: 'General IT',
                user
            });
        }

        const clientEmail = 'client@techhelpdesk.com';
        const clientExists = await this.userRepository.findOne({ where: { email: clientEmail } });
        if (!clientExists) {
            const password = await bcrypt.hash('client123', 10);
            const user = await this.userRepository.save({
                name: 'Client User',
                email: clientEmail,
                password,
                role: UserRole.CLIENT,
            });
            await this.clientRepository.save({
                company: 'Acme Corp',
                contactEmail: 'contact@acme.com',
                user
            });
        }
    }

    async seedCategories() {
        const categories = [
            { name: 'Solicitud', description: 'General request' },
            { name: 'Incidente de Hardware', description: 'Hardware issues' },
            { name: 'Incidente de Software', description: 'Software issues' },
        ];

        for (const cat of categories) {
            const exists = await this.categoryRepository.findOne({ where: { name: cat.name } });
            if (!exists) {
                await this.categoryRepository.save(cat);
            }
        }
    }
}
