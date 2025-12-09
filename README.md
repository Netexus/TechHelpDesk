# TechHelpDesk API

## Developer
**Name:** [Your Name]
**Clan:** [Your Clan]

## Description
TechHelpDesk is a support ticket management system built with NestJS. It allows users (Admins, Technicians, Clients) to manage support tickets with role-based access control.

## Setup Instructions

1.  **Clone the repository**
2.  **Install dependencies**
    ```bash
    cd Backend
    npm install
    ```
3.  **Frontend**: Angular application with Login and Dashboard.
    ```bash
    cd Frontend
    npm install
    npm start
    ```
    The application will start on `http://localhost:4200`.

## Swagger Documentation
The API documentation is available at:
`http://localhost:3000/api`

### How to test endpoints:
1.  **Login**: Go to `POST /auth/login`, click "Try it out", enter admin credentials, and execute.
2.  **Copy Token**: Copy the `access_token` from the response body.
3.  **Authorize**: Click the "Authorize" button at the top of the page. Paste the token (just the token, no "Bearer " prefix needed if configured standardly, but usually Swagger handles it).
4.  **Test**: Now you can try protected endpoints like `GET /users` or `GET /tickets`.

## Testing
Run unit tests:
```bash
npm run test
```
Run test coverage:
```bash
npm run test:cov
```

## Initial Data (Seeders)
- **Admin**: admin@techhelpdesk.com / admin123
- **Technician**: tech@techhelpdesk.com / tech123
- **Client**: client@techhelpdesk.com / client123

## Features
- **Authentication**: JWT based auth with Roles (Admin, Technician, Client).
- **Users**: Manage users, clients, and technicians.
- **Tickets**: Create, update status, and list tickets.
- **Categories**: Manage incident categories.
- **Frontend**: Angular 19+ with Standalone Components.
