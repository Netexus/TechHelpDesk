import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth';
import { Router } from '@angular/router';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './categories.html',
  styleUrls: ['./categories.css']
})
export class CategoriesComponent implements OnInit {
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
    this.http.get('http://localhost:3000/categories').subscribe({
      next: (res: any) => this.categories = res.data || res,
      error: (err) => console.error(err)
    });
  }

  createCategory() {
    this.loading = true;
    this.http.post('http://localhost:3000/categories', this.newCategory).subscribe({
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
