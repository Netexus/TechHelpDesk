import { Entity, PrimaryGeneratedColumn, Column, OneToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Client } from './client.entity';
import { Technician } from './technician.entity';

export enum UserRole {
    ADMIN = 'admin',
    TECHNICIAN = 'technician',
    CLIENT = 'client',
}

@Entity()
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string;

    @Column({ unique: true })
    email: string;

    @Column()
    password: string;

    @Column({ type: 'enum', enum: UserRole, default: UserRole.CLIENT })
    role: UserRole;

    @OneToOne(() => Client, (client) => client.user, { nullable: true, cascade: true })
    clientProfile: Client;

    @OneToOne(() => Technician, (tech) => tech.user, { nullable: true, cascade: true })
    technicianProfile: Technician;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
