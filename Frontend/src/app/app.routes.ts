import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login';
import { DashboardComponent } from './pages/dashboard/dashboard';
import { inject } from '@angular/core';
import { AuthService } from './services/auth';
import { Router } from '@angular/router';

const authGuard = () => {
    const authService = inject(AuthService);
    const router = inject(Router);
    console.log('AuthGuard: Checking authentication...');
    if (authService.isAuthenticated()) {
        console.log('AuthGuard: Authenticated');
        return true;
    }
    console.log('AuthGuard: Not authenticated, redirecting to login');
    return router.parseUrl('/login');
};

import { CreateTicketComponent } from './pages/create-ticket/create-ticket';
import { TicketDetailsComponent } from './pages/ticket-details/ticket-details';

import { UsersComponent } from './pages/admin/users/users';
import { CategoriesComponent } from './pages/admin/categories/categories';

export const routes: Routes = [
    { path: 'login', component: LoginComponent },
    { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] },
    { path: 'create-ticket', component: CreateTicketComponent, canActivate: [authGuard] },
    { path: 'tickets/:id', component: TicketDetailsComponent, canActivate: [authGuard] },
    { path: 'admin/users', component: UsersComponent, canActivate: [authGuard] },
    { path: 'admin/categories', component: CategoriesComponent, canActivate: [authGuard] },
    { path: '', redirectTo: '/dashboard', pathMatch: 'full' }
];
