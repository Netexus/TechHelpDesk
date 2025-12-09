import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Client } from '../../users/entities/client.entity';
import { Technician } from '../../users/entities/technician.entity';
import { Category } from '../../categories/entities/category.entity';

export enum TicketStatus {
    OPEN = 'open',
    IN_PROGRESS = 'in_progress',
    RESOLVED = 'resolved',
    CLOSED = 'closed',
}

export enum TicketPriority {
    LOW = 'low',
    MEDIUM = 'medium',
    HIGH = 'high',
}

@Entity()
export class Ticket {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    title: string;

    @Column()
    description: string;

    @Column({ type: 'enum', enum: TicketStatus, default: TicketStatus.OPEN })
    status: TicketStatus;

    @Column({ type: 'enum', enum: TicketPriority, default: TicketPriority.MEDIUM })
    priority: TicketPriority;

    @ManyToOne(() => Client, (client) => client.tickets)
    client: Client;

    @ManyToOne(() => Technician, (tech) => tech.tickets, { nullable: true })
    technician: Technician;

    @ManyToOne(() => Category, (category) => category.tickets)
    category: Category;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
