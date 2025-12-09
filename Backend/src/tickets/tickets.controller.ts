import { Controller, Get, Post, Body, Patch, Param, UseGuards, Request } from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketStatusDto } from './dto/update-ticket-status.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { CurrentUser } from '../auth/current-user.decorator';
import { User } from '../users/entities/user.entity';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('tickets')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('tickets')
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) { }

  @Post()
  @Roles(UserRole.CLIENT)
  create(@Body() createTicketDto: CreateTicketDto, @CurrentUser() user: User) {
    return this.ticketsService.create(createTicketDto, user);
  }

  @Get()
  @Roles(UserRole.ADMIN)
  findAll() {
    return this.ticketsService.findAll();
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.TECHNICIAN, UserRole.CLIENT)
  findOne(@Param('id') id: string) {
    return this.ticketsService.findOne(id);
  }

  @Patch(':id/status')
  @Roles(UserRole.TECHNICIAN, UserRole.ADMIN)
  updateStatus(@Param('id') id: string, @Body() updateTicketStatusDto: UpdateTicketStatusDto, @CurrentUser() user: User) {
    return this.ticketsService.updateStatus(id, updateTicketStatusDto.status, user);
  }

  @Get('client/:id')
  @Roles(UserRole.ADMIN, UserRole.CLIENT)
  findByClient(@Param('id') id: string) {
    return this.ticketsService.findByClient(id);
  }

  @Get('technician/:id')
  @Roles(UserRole.ADMIN, UserRole.TECHNICIAN)
  findByTechnician(@Param('id') id: string) {
    return this.ticketsService.findByTechnician(id);
  }
}
