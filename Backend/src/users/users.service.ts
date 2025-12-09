import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from './entities/user.entity';
import { Client } from './entities/client.entity';
import { Technician } from './entities/technician.entity';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private usersRepository: Repository<User>,
        @InjectRepository(Client)
        private clientRepository: Repository<Client>,
        @InjectRepository(Technician)
        private technicianRepository: Repository<Technician>,
    ) { }

    async create(createUserDto: CreateUserDto): Promise<User> {
        const { password, ...rest } = createUserDto;
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = this.usersRepository.create({ ...rest, password: hashedPassword });

        // Save user first
        const savedUser = await this.usersRepository.save(user);

        // Create corresponding profile based on role
        if (savedUser.role === UserRole.CLIENT) {
            const clientProfile = this.clientRepository.create({
                company: createUserDto.email.split('@')[1] || 'Unknown Company',
                contactEmail: createUserDto.email,
                user: savedUser
            });
            await this.clientRepository.save(clientProfile);
        } else if (savedUser.role === UserRole.TECHNICIAN) {
            const techProfile = this.technicianRepository.create({
                specialty: 'General Support',
                availability: true,
                user: savedUser
            });
            await this.technicianRepository.save(techProfile);
        }

        // Return user with profiles loaded
        return this.findOne(savedUser.id);
    }

    async findOneByEmail(email: string): Promise<User | null> {
        return this.usersRepository.findOne({ where: { email } });
    }

    async findOne(id: string): Promise<User> {
        const user = await this.usersRepository.findOne({ where: { id }, relations: ['clientProfile', 'technicianProfile'] });
        if (!user) throw new NotFoundException(`User with ID ${id} not found`);
        return user;
    }

    async findAll(): Promise<User[]> {
        return this.usersRepository.find();
    }
}
