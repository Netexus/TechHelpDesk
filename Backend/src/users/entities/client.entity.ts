import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, OneToMany } from 'typeorm';
import { User } from './user.entity';
import { Ticket } from '../../tickets/entities/ticket.entity';

@Entity()
export class Client {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    company: string;

    @Column()
    contactEmail: string;

    @OneToOne(() => User, (user) => user.clientProfile)
    @JoinColumn()
    user: User;

    @OneToMany(() => Ticket, (ticket) => ticket.client)
    tickets: Ticket[];
}
