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
3.  **Environment Variables**
    Copy `.env.example` to `.env` and configure your database credentials.
    ```bash
    cp .env.example .env
    ```
4.  **Database Setup**
    Ensure you have PostgreSQL running. You can use Docker:
    ```bash
    docker-compose up -d
    ```
5.  **Run the application**
    ```bash
    npm run start:dev
    ```
    The application will start on `http://localhost:3000`.
    Seeders will automatically populate the database with initial users and categories.

## Swagger Documentation
The API documentation is available at:
`http://localhost:3000/api`

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
