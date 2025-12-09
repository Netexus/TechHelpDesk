import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCategoryDto {
    @ApiProperty({ example: 'Hardware', description: 'The name of the category' })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty({ example: 'Issues related to physical hardware', description: 'The description of the category' })
    @IsString()
    @IsNotEmpty()
    description: string;
}
