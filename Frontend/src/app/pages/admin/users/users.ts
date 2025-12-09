import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth';
import { Router } from '@angular/router';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './users.html',
  styleUrls: ['./users.css']
})
export class UsersComponent implements OnInit {
  users: any[] = [];
  user: any = null;
  newUser = {
    name: '',
    email: '',
    password: '',
    role: 'client'
  };
  loading = false;
  error = '';

  constructor(private http: HttpClient, private authService: AuthService, public router: Router) { }

  ngOnInit() {
    this.authService.currentUser$.subscribe(user => this.user = user);
    this.loadUsers();
  }

  loadUsers() {
    this.http.get('http://localhost:3000/users').subscribe({
      next: (res: any) => this.users = res.data || res,
      error: (err) => console.error(err)
    });
  }

  createUser() {
    this.loading = true;
    this.http.post('http://localhost:3000/users', this.newUser).subscribe({
      next: () => {
        this.loading = false;
        this.loadUsers();
        this.newUser = { name: '', email: '', password: '', role: 'client' }; // Reset form
        alert('User created successfully');
      },
      error: (err) => {
        this.loading = false;
        this.error = 'Failed to create user.';
        console.error(err);
      }
    });
  }
}
