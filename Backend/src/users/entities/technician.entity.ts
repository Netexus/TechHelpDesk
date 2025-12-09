import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, OneToMany } from 'typeorm';
import { User } from './user.entity';
import { Ticket } from '../../tickets/entities/ticket.entity';

@Entity()
export class Technician {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    specialty: string;

    @Column({ default: true })
    availability: boolean;

    @OneToOne(() => User, (user) => user.technicianProfile)
    @JoinColumn()
    user: User;

    @OneToMany(() => Ticket, (ticket) => ticket.technician)
    tickets: Ticket[];
}
