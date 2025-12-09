import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TicketService } from '../../services/ticket';

@Component({
  selector: 'app-create-ticket',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './create-ticket.html',
  styleUrls: ['./create-ticket.css']
})
export class CreateTicketComponent implements OnInit {
  ticket = {
    title: '',
    description: '',
    priority: 'medium',
    categoryId: ''
  };
  categories: any[] = [];
  error = '';

  constructor(private ticketService: TicketService, public router: Router) { }

  ngOnInit() {
    this.ticketService.getCategories().subscribe({
      next: (res: any) => this.categories = res.data || res,
      error: (err) => console.error(err)
    });
  }

  onSubmit() {
    this.ticketService.createTicket(this.ticket).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: (err) => {
        this.error = 'Failed to create ticket. Please check your inputs.';
        console.error(err);
      }
    });
  }
}
