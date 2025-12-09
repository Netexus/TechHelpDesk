import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
    @ApiProperty({ example: 'admin@techhelpdesk.com', description: 'The email of the user' })
    @IsEmail()
    email: string;

    @ApiProperty({ example: 'admin123', description: 'The password of the user' })
    @IsString()
    @IsNotEmpty()
    password: string;
}
