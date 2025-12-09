# TechHelpDesk Frontend 🎨

Angular-based Single Page Application for the TechHelpDesk ticket management system.

## 📋 Overview

This is the frontend application for TechHelpDesk, built with Angular 18. It provides a modern, responsive interface for managing IT support tickets with role-based dashboards and real-time updates.

## 🛠️ Technologies

- **Framework**: Angular 18.x
- **Language**: TypeScript
- **HTTP Client**: Angular HttpClient with RxJS
- **Routing**: Angular Router with Guards
- **Forms**: Template-driven Forms
- **Styling**: CSS Variables with custom design system
- **Build Tool**: Angular CLI

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- Angular CLI (optional, uses npx by default)

### Installation

```bash
# Install dependencies
npm install
```

### Running the Application

```bash
# Development server with hot-reload
npm start

# The app will open at http://localhost:4200
```

### Building for Production

```bash
# Production build
npm run build

# Output will be in dist/ directory
```

## 🏗️ Project Structure

```
src/
├── app/
│   ├── pages/                    # Page components
│   │   ├── login/               # Login page
│   │   ├── dashboard/           # Main dashboard (role-specific)
│   │   └── admin/               # Admin pages
│   │       ├── users/           # User management
│   │       └── categories/      # Category management
│   │
│   ├── services/                # HTTP services
│   │   ├── auth.ts             # Authentication service
│   │   ├── ticket.ts           # Ticket management
│   │   └── user.ts             # User management
│   │
│   ├── guards/                  # Route guards
│   │   ├── auth.guard.ts       # Authentication guard
│   │   └── role.guard.ts       # Role-based guard
│   │
│   ├── app.routes.ts           # Application routes
│   ├── app.component.ts        # Root component
│   └── app.config.ts           # App configuration
│
├── styles.css                   # Global styles
└── main.ts                      # Application entry point
```

## 🎨 Features

### Authentication
- JWT-based authentication
- Secure token storage in localStorage
- Auto-redirect to dashboard on successful login
- Auto-redirect to login on unauthorized access
- Demo credentials for quick testing

### Role-Based Dashboards

#### 👑 Admin Dashboard
- User management (create, view all users)
- Category management (create, view categories)
- Ticket overview (all tickets across system)
- Navigation to management pages

#### 🔧 Technician Dashboard
- **Available Tickets**: Open tickets without assignment
  - "Start Working" button for self-assignment
  - Client information displayed
- **My Assigned Tickets**: Tickets assigned to technician
  - Status update buttons (Resolve, Close)
  - Progress tracking
- Ticket count statistics
- Maximum 5 concurrent in-progress tickets

#### 📝 Client Dashboard
- Personal ticket history
- "New Ticket" creation button
- Technician information display:
  - Avatar with initial
  - Technician name
  - Contact email
- Ticket status tracking
- "Waiting for assignment" indicator

### Ticket Management

#### Creating Tickets (Clients)
- Title and description inputs
- Priority selection (Low, Medium, High)
- Category selection
- Form validation
- Success/error feedback

#### Ticket Workflow (Technicians)
1. View available open tickets
2. Click "Start Working" → Auto-assigned + Status: IN_PROGRESS
3. Click "Resolve" → Status: RESOLVED
4. Click "Close" → Status: CLOSED

### UI Components

#### Navigation
- Role-based header with user info
- Logout functionality
- Color-coded role badges:
  - 🔴 Admin (red)
  - 🔵 Technician (blue)
  - 🟢 Client (green)

#### Ticket Cards / Tables
- Color-coded status badges
- Priority indicators
- Timestamp display
- Action buttons based on state
- Responsive layout

#### Forms
- Input validation
- Error messages
- Loading states
- Disabled state during submission

### Development Tools Panel

Located on login page for easy access:
- **📚 API Docs (Swagger)**: Interactive API documentation
- **🧪 Backend Tests**: Test coverage reports
- **📊 Test Reports**: Consolidated testing info

## 🔐 Authentication Flow

1. User enters credentials
2. Frontend sends POST to `/auth/login`
3. Backend validates and returns JWT token
4. Frontend stores token in localStorage
5. Frontend decodes token to get user info (name, email, role)
6. Auth guard protects routes
7. HTTP interceptors add token to requests

### Token Storage

```typescript
// Stored in localStorage
{
  "token": "eyJhbGci...",
  "user": {
    "email": "user@example.com",
    "role": "client",
    "name": "User Name",
    "sub": "user-id"
  }
}
```

## 🛡️ Route Guards

### AuthGuard
Protects all routes except `/login`:
```typescript
{
  path: 'dashboard',
  component: DashboardComponent,
  canActivate: [AuthGuard]
}
```

### RoleGuard
Restricts access based on user role:
```typescript
{
  path: 'admin/users',
  component: UsersComponent,
  canActivate: [AuthGuard, RoleGuard],
  data: { roles: ['admin'] }
}
```

## 📡 API Services

### AuthService
```typescript
login(credentials)        // POST /auth/login
logout()                  // Clear local storage
getCurrentUser()          // Decode JWT token
isAuthenticated()         // Check token validity
```

### TicketService
```typescript
getTickets()                    // GET /tickets (admin)
getTicketsByClient(userId)      // GET /tickets/client/:id
getTicketsByTechnician(userId)  // GET /tickets/technician/:id
createTicket(data)              // POST /tickets
updateStatus(ticketId, status)  // PATCH /tickets/:id/status
getCategories()                 // GET /categories
```

### UserService
```typescript
getUsers()              // GET /users
createUser(userData)    // POST /users
```

## 🎯 Key Features Explained

### Auto-Refresh After Status Update

When a technician updates a ticket status:
```typescript
updateStatus(ticket, newStatus) {
  this.ticketService.updateStatus(ticket.id, newStatus).subscribe({
    next: () => {
      this.loadTickets(); // ✅ Reloads tickets to update UI
    }
  });
}
```

### Computed Properties for Ticket Filtering

```typescript
get availableTickets() {
  return this.tickets.filter(
    t => t.status === 'open' && !t.technician
  );
}

get myTickets() {
  return this.tickets.filter(
    t => t.technician?.user?.id === this.user.sub
  );
}
```

### Role-Based UI Rendering

```html
<!-- Show different content based on role -->
<div *ngIf="user?.role === 'admin'">
  <!-- Admin-only content -->
</div>

<div *ngIf="user?.role === 'technician'">
  <!-- Technician-only content -->
</div>

<div *ngIf="user?.role === 'client'">
  <!-- Client-only content -->
</div>
```

## 🎨 Styling System

### CSS Variables

```css
:root {
  --color-primary: #3b82f6;
  --color-success: #10b981;
  --color-warning: #f59e0b;
  --color-danger: #ef4444;
  --color-text: #1f2937;
  --color-text-light: #6b7280;
  --color-border: #e5e7eb;
  --radius-sm: 0.375rem;
  --radius-md: 0.5rem;
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
}
```

### Status Colors

```css
.badge-open { background: #dbeafe; color: #1e40af; }
.badge-in_progress { background: #fef3c7; color: #92400e; }
.badge-resolved { background: #d1fae5; color: #065f46; }
.badge-closed { background: #e5e7eb; color: #374151; }
```

### Button Styles

```css
.btn-primary    /* Blue primary actions */
.btn-success    /* Green success actions */
.btn-danger     /* Red destructive actions */
.btn-outline    /* Bordered secondary actions */
```

## 🧭 Routing

```typescript
const routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { 
    path: 'dashboard', 
    component: DashboardComponent,
    canActivate: [AuthGuard]
  },
  { 
    path: 'admin/users', 
    component: UsersComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['admin'] }
  }
];
```

## 🔧 Configuration

### Environment Configuration

The app connects to the backend API at:
- **Development**: `http://localhost:3000`
- Configured in service files

### Proxy Configuration (Optional)

Create `proxy.conf.json` to avoid CORS in development:
```json
{
  "/api": {
    "target": "http://localhost:3000",
    "secure": false
  }
}
```

## 🧪 Testing

```bash
# Unit tests
npm test

# E2E tests
npm run e2e
```

## 🎭 Demo Credentials

Pre-seeded users for testing:

| Role | Email | Password | Features |
|------|-------|----------|----------|
| Admin | admin@techhelpdesk.com | admin123 | Full access |
| Technician | tech@techhelpdesk.com | tech123 | Ticket management |
| Client | client@techhelpdesk.com | client123 | Create tickets |

Quick-fill buttons available on login page!

## 📱 Responsive Design

The application is fully responsive:
- **Desktop**: Full layout with sidebars
- **Tablet**: Collapsible navigation
- **Mobile**: Stacked layout, touch-friendly buttons

## 🐛 Troubleshooting

### Backend Connection Issues

```typescript
// Check API URL in services
private apiUrl = 'http://localhost:3000';
```

### CORS Errors

Ensure backend allows frontend origin:
```typescript
// Backend main.ts should have:
app.enableCors({
  origin: ['http://localhost:4200'],
  credentials: true
});
```

### Token Expiration

Tokens expire after 24 hours. Clear localStorage and login again:
```javascript
localStorage.clear();
```

### Route Not Loading

Check if:
1. Guard is allowing access
2. User has correct role
3. Component is declared in routes

## 🚀 Development Tips

### Adding New Pages

1. Generate component: `ng generate component pages/new-page`
2. Add route in `app.routes.ts`
3. Add guard if needed
4. Create corresponding service if API calls required

### Adding New Services

```typescript
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class NewService {
  private apiUrl = 'http://localhost:3000';
  
  constructor(private http: HttpClient) {}
  
  getData() {
    return this.http.get(`${this.apiUrl}/endpoint`);
  }
}
```

### Debugging

```typescript
// Enable Angular debug mode
import { enableProdMode } from '@angular/core';

if (environment.production) {
  enableProdMode();
}
```

## 📦 Build & Deploy

### Production Build

```bash
npm run build
```

Output in `dist/frontend/browser/`:
- Optimized bundles
- AOT compilation
- Tree-shaking applied
- Minified code

### Deployment

1. Build the application
2. Deploy `dist/frontend/browser/` contents to web server
3. Configure server for SPA routing (all routes → index.html)
4. Set correct backend API URL

### Nginx Configuration Example

```nginx
server {
  listen 80;
  root /var/www/techhelpdesk/frontend;
  
  location / {
    try_files $uri $uri/ /index.html;
  }
}
```

## 🎯 Best Practices

- ✅ Use services for all HTTP calls
- ✅ Implement guards for protected routes
- ✅ Use RxJS operators for data transformation
- ✅ Unsubscribe from observables in ngOnDestroy
- ✅ Use async pipe when possible
- ✅ Keep components focused and small
- ✅ Use TypeScript strict mode
- ✅ Follow Angular style guide

## 📈 Performance

- **Lazy Loading**: Load modules on demand
- **Change Detection**: OnPush strategy where applicable
- **Bundle Size**: Optimized with tree-shaking
- **Caching**: HTTP interceptors can add caching

## 🤝 Contributing

When adding features:
1. Follow existing code structure
2. Update this README if adding major features
3. Test on all user roles
4. Ensure responsive design
5. Add error handling

---

**Built with Angular** 🅰️
