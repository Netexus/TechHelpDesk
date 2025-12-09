import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TicketService {
  private apiUrl = 'http://localhost:3000/tickets';

  constructor(private http: HttpClient) { }

  getTickets(): Observable<any> {
    return this.http.get(this.apiUrl);
  }

  getTicketsByClient(clientId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/client/${clientId}`);
  }

  getTicketsByTechnician(techId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/technician/${techId}`);
  }

  getTicket(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  createTicket(ticket: any): Observable<any> {
    return this.http.post(this.apiUrl, ticket);
  }

  updateStatus(id: string, status: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}/status`, { status });
  }

  getCategories(): Observable<any> {
    return this.http.get('http://localhost:3000/categories');
  }
}
