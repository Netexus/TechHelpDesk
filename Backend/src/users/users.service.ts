import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private usersRepository: Repository<User>,
    ) { }

    async create(createUserDto: CreateUserDto): Promise<User> {
        const { password, ...rest } = createUserDto;
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = this.usersRepository.create({ ...rest, password: hashedPassword });
        return this.usersRepository.save(user);
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
