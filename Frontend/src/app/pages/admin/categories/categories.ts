import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth';
import { Router } from '@angular/router';
import { environment } from '../../../../enviroments/environment';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './categories.html',
  styleUrls: ['./categories.css']
})
export class CategoriesComponent implements OnInit {
  private apiUrl = `${environment.apiUrl}/categories`;
  categories: any[] = [];
  user: any = null;
  newCategory = {
    name: '',
    description: ''
  };
  loading = false;
  error = '';

  constructor(private http: HttpClient, private authService: AuthService, public router: Router) { }

  ngOnInit() {
    this.authService.currentUser$.subscribe(user => this.user = user);
    this.loadCategories();
  }

  loadCategories() {
    this.http.get(this.apiUrl).subscribe({
      next: (res: any) => this.categories = res.data || res,
      error: (err) => console.error(err)
    });
  }

  createCategory() {
    this.loading = true;
    this.http.post(this.apiUrl, this.newCategory).subscribe({
      next: () => {
        this.loading = false;
        this.loadCategories();
        this.newCategory = { name: '', description: '' };
        alert('Category created successfully');
      },
      error: (err) => {
        this.loading = false;
        this.error = 'Failed to create category.';
        console.error(err);
      }
    });
  }
}
