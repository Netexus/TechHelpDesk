import { IsEnum, IsNotEmpty, IsString, IsUUID } from 'class-validator';
import { TicketPriority } from '../entities/ticket.entity';

export class CreateTicketDto {
    @IsString()
    @IsNotEmpty()
    title: string;

    @IsString()
    @IsNotEmpty()
    description: string;

    @IsEnum(TicketPriority)
    priority: TicketPriority;

    @IsUUID()
    categoryId: string;
}
