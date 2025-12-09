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
  user: any;
  tickets: any[] = [];

  constructor(
    private authService: AuthService,
    private ticketService: TicketService,
    private router: Router
  ) { }

  ngOnInit() {
    this.authService.currentUser$.subscribe(user => {
      this.user = user;
      if (user && user.role === 'admin') {
        this.loadTickets();
      }
    });
  }

  loadTickets() {
    this.ticketService.getTickets().subscribe({
      next: (response: any) => {
        this.tickets = response.data || response;
      },
      error: (err) => console.error(err)
    });
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
