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
    if (this.user.role === 'client') {
      this.ticketService.getTickets().subscribe((res: any) => {
        // Filter client tickets if backend doesn't do it automatically for this endpoint
        // Ideally backend has specific endpoints, but for now we use the general one or specific if available
        // Using the specific endpoint for clients would be better: /tickets/client/:id
        // But let's check what we have. We have findByClient in backend.
        // Let's try to use the general getTickets for now and see what it returns.
        // Actually, let's use the proper endpoints based on role.
        this.fetchRoleBasedTickets();
      });
    } else {
      this.fetchRoleBasedTickets();
    }
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
        ticket.status = newStatus;
      },
      error: (err) => alert('Failed to update status: ' + err.message)
    });
  }
}
