import { Module, OnModuleInit } from '@nestjs/common';
import { DataSource } from 'typeorm';
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
        url: configService.get<string>('DATABASE_URL'),
        entities: [User, Client, Technician, Category, Ticket],
        synchronize: configService.get<string>('NODE_ENV') !== 'production',
        ssl: {
          rejectUnauthorized: false // ← Necesary for Supabase
        },
        logging: configService.get<string>('NODE_ENV') === 'development',
        autoLoadEntities: true,
      }),
      inject: [ConfigService],
    }),
    UsersModule,
    CategoriesModule,
    TicketsModule,
    AuthModule,
    TypeOrmModule.forFeature([User, Category, Ticket, Client, Technician]),
  ],
  controllers: [AppController],
  providers: [AppService, SeederService],
})
export class AppModule implements OnModuleInit {
  constructor(private dataSource: DataSource) { }

  onModuleInit() {
    if (this.dataSource.isInitialized) {
      console.log('✅ DATABASE CONNECTED SUCCESSFULLY');
    } else {
      console.error('❌ DATABASE CONNECTION FAILED');
    }
  }
}
