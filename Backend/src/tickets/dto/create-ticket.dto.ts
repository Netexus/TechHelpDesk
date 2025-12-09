import { IsEnum, IsNotEmpty, IsString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { TicketPriority } from '../entities/ticket.entity';

export class CreateTicketDto {
    @ApiProperty({ example: 'Printer not working', description: 'The title of the ticket' })
    @IsString()
    @IsNotEmpty()
    title: string;

    @ApiProperty({ example: 'The printer on the 2nd floor is jamming', description: 'The description of the issue' })
    @IsString()
    @IsNotEmpty()
    description: string;

    @ApiProperty({ enum: TicketPriority, description: 'The priority of the ticket' })
    @IsEnum(TicketPriority)
    priority: TicketPriority;

    @ApiProperty({ example: 'uuid-of-category', description: 'The ID of the category' })
    @IsUUID()
    categoryId: string;
}
