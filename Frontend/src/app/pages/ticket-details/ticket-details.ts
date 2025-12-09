import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { TicketService } from '../../services/ticket';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-ticket-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ticket-details.html',
  styleUrls: ['./ticket-details.css']
})
export class TicketDetailsComponent implements OnInit {
  ticket: any = null;
  user: any = null;
  loading = true;
  error = '';

  constructor(
    private route: ActivatedRoute,
    private ticketService: TicketService,
    private authService: AuthService,
    public router: Router
  ) { }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadTicket(id);
    }
    this.authService.currentUser$.subscribe(u => this.user = u);
  }

  loadTicket(id: string) {
    this.ticketService.getTicket(id).subscribe({
      next: (res: any) => {
        this.ticket = res.data || res;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load ticket details.';
        this.loading = false;
        console.error(err);
      }
    });
  }

  getStatusClass(status: string): string {
    return `badge badge-${status}`;
  }

  updateStatus(newStatus: string) {
    if (!this.ticket) return;
    this.ticketService.updateStatus(this.ticket.id, newStatus).subscribe({
      next: () => {
        this.ticket.status = newStatus;
      },
      error: (err) => alert('Failed to update status: ' + err.message)
    });
  }
}
