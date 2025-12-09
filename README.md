# TechHelpDesk 🎫

A comprehensive full-stack ticket management system for IT support, built with NestJS, Angular, and PostgreSQL.

![TechHelpDesk](https://img.shields.io/badge/Version-1.0.0-blue)
![License](https://img.shields.io/badge/License-MIT-green)

## 📋 Overview

TechHelpDesk is a modern ticket management system designed for IT support teams. It provides role-based access control, real-time ticket tracking, and a comprehensive dashboard for administrators, technicians, and clients.

### Key Features

- 🔐 **JWT Authentication** - Secure authentication with role-based access control
- 👥 **Three User Roles** - Admin, Technician, and Client with specific permissions
- 🎫 **Ticket Management** - Complete CRUD operations for support tickets
- 📊 **Dashboard** - Role-specific dashboards with real-time data
- 🔄 **Workflow Management** - Ticket status transitions with validation
- 📚 **API Documentation** - Interactive Swagger/OpenAPI documentation
- 🧪 **Test Coverage** - Unit tests with coverage reports
- 🎨 **Modern UI** - Responsive Angular frontend with clean design

## 🏗️ Architecture

```
TechHelpDesk/
├── Backend/          # NestJS REST API
├── Frontend/         # Angular SPA
└── docker-compose.yml # PostgreSQL database
```

### Tech Stack

#### Backend
- **Framework**: NestJS 10.x
- **Database**: PostgreSQL 15
- **ORM**: TypeORM
- **Authentication**: JWT (Passport.js)
- **Validation**: class-validator
- **Documentation**: Swagger/OpenAPI
- **Testing**: Jest

#### Frontend
- **Framework**: Angular 18.x
- **HTTP Client**: HttpClient with RxJS
- **Routing**: Angular Router
- **State Management**: Services with Observables
- **Styling**: CSS Variables with custom design system

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Docker and Docker Compose (for PostgreSQL)
- Git

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd TechHelpDesk
```

2. **Start PostgreSQL database**
```bash
docker-compose up -d
```

3. **Setup Backend**
```bash
cd Backend
npm install
cp .env.example .env  # Configure environment variables
npm run start:dev
```

4. **Setup Frontend**
```bash
cd Frontend
npm install
npm start
```

### Access the Application

- **Frontend**: http://localhost:4200
- **Backend API**: http://localhost:3000
- **Swagger Docs**: http://localhost:3000/api
- **Test Coverage**: http://localhost:3000/coverage

### Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@techhelpdesk.com | admin123 |
| Technician | tech@techhelpdesk.com | tech123 |
| Client | client@techhelpdesk.com | client123 |

## 📚 Documentation

### Backend API

- **Swagger UI**: Interactive API documentation at `/api`
- **Test Coverage**: HTML reports at `/coverage`
- See [Backend README](./Backend/README.md) for detailed documentation

### Frontend

- **Architecture**: Component-based Angular application
- **Services**: Authentication, Tickets, Users, Categories
- See [Frontend README](./Frontend/README.md) for detailed documentation

## 🎯 User Roles & Permissions

### 👑 Administrator
- Full CRUD access to all resources
- User management (create, list, view)
- Category management
- Ticket oversight across all users
- System configuration

### 🔧 Technician
- View available open tickets
- Self-assign tickets (via "Start Working")
- Update ticket status (in_progress → resolved → closed)
- View assigned tickets
- Maximum 5 concurrent tickets in progress

### 📝 Client
- Create new tickets
- View own ticket history
- See assigned technician details
- Track ticket status

## 🔄 Ticket Workflow

```
OPEN → IN_PROGRESS → RESOLVED → CLOSED
```

1. **Client creates ticket** → Status: `OPEN`
2. **Technician takes ticket** → Status: `IN_PROGRESS` + Auto-assigned
3. **Technician resolves** → Status: `RESOLVED`
4. **Admin/Technician closes** → Status: `CLOSED`

## 🗄️ Database Schema

### Entities

- **User** - Base user entity with authentication
- **Client** - Client profile (1:1 with User)
- **Technician** - Technician profile (1:1 with User)
- **Category** - Ticket categories
- **Ticket** - Support tickets with relationships

### Key Relationships

- `User` ↔ `Client` (One-to-One)
- `User` ↔ `Technician` (One-to-One)
- `Client` → `Ticket` (One-to-Many)
- `Technician` → `Ticket` (One-to-Many, nullable)
- `Category` → `Ticket` (One-to-Many)

## 🧪 Testing

### Backend Tests

```bash
cd Backend
npm test                 # Run all tests
npm run test:watch      # Watch mode
npm run test:cov        # With coverage report
```

### Test Coverage

View detailed coverage reports at: http://localhost:3000/coverage

## 🛠️ Development

### Environment Variables

Create `.env` file in Backend directory:

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=password
DB_NAME=techhelpdesk

# JWT
JWT_SECRET=your-secret-key-here

# Application
PORT=3000
```

### Database Commands

```bash
# Start PostgreSQL
docker-compose up -d

# Stop PostgreSQL
docker-compose down

# View logs
docker-compose logs -f postgres

# Reset database (⚠️ destroys data)
docker-compose down -v
docker-compose up -d
```

## 📦 Project Structure

```
TechHelpDesk/
├── Backend/
│   ├── src/
│   │   ├── auth/              # Authentication module
│   │   ├── users/             # Users, Clients, Technicians
│   │   ├── tickets/           # Ticket management
│   │   ├── categories/        # Category management
│   │   ├── common/            # Shared filters, interceptors
│   │   └── main.ts            # Application entry point
│   ├── test/                  # E2E tests
│   └── package.json
│
├── Frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── pages/         # Page components
│   │   │   ├── services/      # HTTP services
│   │   │   └── guards/        # Route guards
│   │   └── main.ts
│   └── package.json
│
├── docker-compose.yml         # PostgreSQL configuration
└── README.md                  # This file
```

## 🔐 Security Features

- ✅ JWT-based authentication
- ✅ Password hashing with bcrypt
- ✅ Role-based access control (RBAC)
- ✅ Route guards (frontend & backend)
- ✅ Input validation with class-validator
- ✅ CORS configuration
- ✅ SQL injection protection (TypeORM)

## 🎨 UI Features

- ✅ Responsive design
- ✅ Role-specific dashboards
- ✅ Color-coded role badges
- ✅ Status indicators with colors
- ✅ Real-time ticket updates
- ✅ Development tools panel (Swagger, Test Reports)
- ✅ Clean and modern interface

## 📈 Future Enhancements

- [ ] Real-time notifications (WebSockets)
- [ ] File attachments for tickets
- [ ] Email notifications
- [ ] Ticket comments/threading
- [ ] Advanced search and filters
- [ ] Analytics dashboard
- [ ] Technician availability calendar
- [ ] SLA tracking

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 👥 Authors

- Development Team

## 🙏 Acknowledgments

- NestJS Framework
- Angular Team
- TypeORM Contributors
- All open-source contributors

---

**Built with ❤️ using NestJS and Angular**
