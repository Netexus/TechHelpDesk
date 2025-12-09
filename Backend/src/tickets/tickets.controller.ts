import { Controller, Get, Post, Body, Patch, Param, UseGuards } from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketStatusDto } from './dto/update-ticket-status.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { CurrentUser } from '../auth/current-user.decorator';
import { User } from '../users/entities/user.entity';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';

@ApiTags('Tickets')
@ApiBearerAuth('JWT-auth')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('tickets')
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) { }

  @Post()
  @Roles(UserRole.CLIENT)
  @ApiOperation({ summary: 'Create a new ticket (Client only)' })
  @ApiBody({ type: CreateTicketDto })
  @ApiResponse({ status: 201, description: 'Ticket created successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  create(@Body() createTicketDto: CreateTicketDto, @CurrentUser() user: User) {
    return this.ticketsService.create(createTicketDto, user);
  }

  @Get()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get all tickets (Admin only)' })
  @ApiResponse({ status: 200, description: 'Returns all tickets' })
  findAll() {
    return this.ticketsService.findAll();
  }

  @Get('client/:id')
  @Roles(UserRole.ADMIN, UserRole.CLIENT)
  @ApiOperation({ summary: 'Get tickets by client ID' })
  @ApiParam({ name: 'id', description: 'Client user ID' })
  @ApiResponse({ status: 200, description: 'Returns client tickets' })
  findByClient(@Param('id') id: string) {
    return this.ticketsService.findByClient(id);
  }

  @Get('technician/:id')
  @Roles(UserRole.ADMIN, UserRole.TECHNICIAN)
  @ApiOperation({ summary: 'Get tickets for technician (assigned + available open tickets)' })
  @ApiParam({ name: 'id', description: 'Technician user ID' })
  @ApiResponse({ status: 200, description: 'Returns technician tickets' })
  findByTechnician(@Param('id') id: string) {
    return this.ticketsService.findByTechnician(id);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.TECHNICIAN, UserRole.CLIENT)
  @ApiOperation({ summary: 'Get ticket by ID' })
  @ApiParam({ name: 'id', description: 'Ticket ID' })
  @ApiResponse({ status: 200, description: 'Returns ticket details' })
  @ApiResponse({ status: 404, description: 'Ticket not found' })
  findOne(@Param('id') id: string) {
    return this.ticketsService.findOne(id);
  }

  @Patch(':id/status')
  @Roles(UserRole.TECHNICIAN, UserRole.ADMIN)
  @ApiOperation({ summary: 'Update ticket status' })
  @ApiParam({ name: 'id', description: 'Ticket ID' })
  @ApiBody({ type: UpdateTicketStatusDto })
  @ApiResponse({ status: 200, description: 'Ticket status updated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid status transition' })
  updateStatus(@Param('id') id: string, @Body() updateTicketStatusDto: UpdateTicketStatusDto, @CurrentUser() user: User) {
    return this.ticketsService.updateStatus(id, updateTicketStatusDto.status, user);
  }
}
