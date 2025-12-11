import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../enviroments/environment';

@Injectable({
  providedIn: 'root'
})
export class TicketService {
  private apiUrl = `${environment.apiUrl}/tickets`;
  private categoriesUrl = `${environment.apiUrl}/categories`;

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
    return this.http.get(this.categoriesUrl);
  }
}
