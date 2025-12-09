import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth';
import { TicketService } from '../../services/ticket';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class DashboardComponent implements OnInit {
  user: any = null;
  tickets: any[] = [];

  // Computed properties for technician view
  get availableTickets() {
    return this.tickets.filter(t => t.status === 'open' && !t.technician);
  }

  get myTickets() {
    if (this.user?.role === 'technician') {
      return this.tickets.filter(t => t.technician && t.technician.user?.id === this.user.sub);
    }
    return this.tickets;
  }

  // Computed properties for Admin view
  get openTicketsCount() {
    return this.tickets.filter(t => t.status === 'open').length;
  }

  get inProgressTicketsCount() {
    return this.tickets.filter(t => t.status === 'in_progress').length;
  }

  get resolvedTicketsCount() {
    return this.tickets.filter(t => t.status === 'resolved').length;
  }

  get closedTicketsCount() {
    return this.tickets.filter(t => t.status === 'closed').length;
  }

  get highPriorityCount() {
    return this.tickets.filter(t => t.priority === 'high').length;
  }

  errorMessage: string | null = null;
  errorTimeout: any;

  constructor(private authService: AuthService, private ticketService: TicketService, public router: Router) { }

  ngOnInit() {
    this.authService.currentUser$.subscribe(user => {
      this.user = user;
      if (user) {
        this.loadTickets();
      }
    });
  }

  loadTickets() {
    this.fetchRoleBasedTickets();
  }

  fetchRoleBasedTickets() {
    console.log('Fetching tickets for user:', this.user);
    if (!this.user) return;

    let observable;
    if (this.user.role === 'admin') {
      observable = this.ticketService.getTickets();
    } else if (this.user.role === 'client') {
      observable = this.ticketService.getTicketsByClient(this.user.sub);
    } else if (this.user.role === 'technician') {
      observable = this.ticketService.getTicketsByTechnician(this.user.sub);
    }

    if (observable) {
      observable.subscribe({
        next: (res: any) => {
          this.tickets = res.data || res;
        },
        error: (err: any) => console.error('Error fetching tickets:', err)
      });
    }
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  getStatusClass(status: string): string {
    return `badge badge-${status}`;
  }

  updateStatus(ticket: any, newStatus: string) {
    this.ticketService.updateStatus(ticket.id, newStatus).subscribe({
      next: () => {
        // Reload tickets to reflect changes (assignment, status update)
        this.loadTickets();
      },
      error: (err) => {
        console.error('Update status error:', err);
        const message = err.error?.message || err.message || 'Unknown error';
        this.showError(message);
      }
    });
  }

  showError(message: string) {
    this.errorMessage = message;
    if (this.errorTimeout) clearTimeout(this.errorTimeout);
    this.errorTimeout = setTimeout(() => {
      this.errorMessage = null;
    }, 5000);
  }

  closeError() {
    this.errorMessage = null;
    if (this.errorTimeout) clearTimeout(this.errorTimeout);
  }
}
