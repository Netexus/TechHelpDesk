import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { CategoriesModule } from './categories/categories.module';
import { TicketsModule } from './tickets/tickets.module';
import { AuthModule } from './auth/auth.module';
import { User } from './users/entities/user.entity';
import { Client } from './users/entities/client.entity';
import { Technician } from './users/entities/technician.entity';
import { Category } from './categories/entities/category.entity';
import { Ticket } from './tickets/entities/ticket.entity';
import { SeederService } from './seeder.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_NAME'),
        entities: [User, Client, Technician, Category, Ticket],
        synchronize: true, // For development only
      }),
      inject: [ConfigService],
    }),
    UsersModule,
    CategoriesModule,
    TicketsModule,
    AuthModule,
    TypeOrmModule.forFeature([User, Category, Client, Technician]),
  ],
  controllers: [AppController],
  providers: [AppService, SeederService],
})
export class AppModule { }
