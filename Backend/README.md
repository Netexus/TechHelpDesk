# TechHelpDesk Backend 🚀

NestJS-based REST API for the TechHelpDesk ticket management system.

## 📋 Overview

This is the backend service for TechHelpDesk, built with NestJS, TypeORM, and PostgreSQL. It provides a complete REST API for authentication, user management, ticket management, and category management with role-based access control.

## 🛠️ Technologies

- **Framework**: NestJS 10.x
- **Language**: TypeScript
- **Database**: PostgreSQL 15
- **ORM**: TypeORM
- **Authentication**: JWT with Passport.js
- **Validation**: class-validator & class-transformer
- **Documentation**: Swagger/OpenAPI
- **Testing**: Jest
- **Password Hashing**: bcrypt

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL database (via Docker recommended)

### Installation

```bash
# Install dependencies
npm install

# Setup environment variables
cp .env.example .env

# Edit .env with your configuration
```

### Environment Variables

Create a `.env` file in the Backend directory:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=password
DB_NAME=techhelpdesk

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Application
PORT=3000
NODE_ENV=development
```

### Running the Application

```bash
# Development mode with hot-reload
npm run start:dev

# Production mode
npm run build
npm run start:prod

# Debug mode
npm run start:debug
```

The API will be available at `http://localhost:3000`

## 📚 API Documentation

### Swagger UI

Interactive API documentation is available at:
- **URL**: http://localhost:3000/api
- **Features**: Try out endpoints, view schemas, authentication

### Test Coverage Reports

View test coverage at:
- **URL**: http://localhost:3000/coverage

### Key Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| **Authentication** |
| POST | `/auth/login` | User login | Public |
| POST | `/auth/register` | User registration | Public |
| **Users** |
| POST | `/users` | Create user | Admin |
| GET | `/users` | List all users | Admin |
| GET | `/users/:id` | Get user by ID | Admin |
| **Categories** |
| POST | `/categories` | Create category | Admin |
| GET | `/categories` | List categories | Authenticated |
| GET | `/categories/:id` | Get category | Authenticated |
| **Tickets** |
| POST | `/tickets` | Create ticket | Client |
| GET | `/tickets` | List all tickets | Admin |
| GET | `/tickets/client/:id` | Client tickets | Admin, Client |
| GET | `/tickets/technician/:id` | Technician tickets | Admin, Technician |
| PATCH | `/tickets/:id/status` | Update status | Technician, Admin |

## 🏗️ Project Structure

```
src/
├── auth/                      # Authentication module
│   ├── guards/               # JWT & Roles guards
│   ├── decorators/           # Custom decorators
│   ├── strategies/           # Passport strategies
│   └── dto/                  # Login DTOs
│
├── users/                    # User management
│   ├── entities/            # User, Client, Technician entities
│   ├── dto/                 # User DTOs
│   └── users.service.ts     # Auto-creates profiles
│
├── tickets/                 # Ticket management
│   ├── entities/           # Ticket entity
│   ├── dto/                # Ticket DTOs
│   └── tickets.service.ts  # Business logic
│
├── categories/             # Category management
│   ├── entities/          # Category entity
│   └── dto/               # Category DTOs
│
├── common/                # Shared resources
│   ├── filters/          # Exception filters
│   ├── interceptors/     # Transform interceptor
│   └── decorators/       # Custom decorators
│
├── app.module.ts         # Main application module
├── main.ts              # Application entry point
└── seeder.service.ts    # Database seeder
```

## 🗄️ Database

### Entities

#### User
- `id` (UUID, PK)
- `name` (string)
- `email` (string, unique)
- `password` (string, hashed)
- `role` (enum: admin, technician, client)
- `createdAt`, `updatedAt` (timestamps)

#### Client
- `id` (UUID, PK)
- `company` (string)
- `contactEmail` (string)
- `userId` (UUID, FK) - One-to-One with User

#### Technician
- `id` (UUID, PK)
- `specialty` (string)
- `availability` (boolean)
- `userId` (UUID, FK) - One-to-One with User

#### Category
- `id` (UUID, PK)
- `name` (string)
- `description` (string)

#### Ticket
- `id` (UUID, PK)
- `title` (string)
- `description` (string)
- `status` (enum: open, in_progress, resolved, closed)
- `priority` (enum: low, medium, high)
- `clientId` (UUID, FK)
- `technicianId` (UUID, FK, nullable)
- `categoryId` (UUID, FK)
- `createdAt`, `updatedAt` (timestamps)

### Relationships

```
User (1) ↔ (1) Client
User (1) ↔ (1) Technician
Client (1) → (N) Ticket
Technician (1) → (N) Ticket
Category (1) → (N) Ticket
```

### Database Seeder

The application includes a seeder that creates initial data:
- 1 Admin user
- 1 Technician user
- 1 Client user
- 8 Categories
- 10 Sample tickets

The seeder runs automatically on application start if the database is empty.

## 🔐 Authentication & Authorization

### JWT Authentication

- Tokens are issued on successful login
- Tokens expire after 24 hours
- Token payload includes: `email`, `sub` (userId), `role`, `name`

### Role-Based Access Control

Implemented using:
- `@Roles()` decorator - Specifies required roles
- `RolesGuard` - Validates user role
- `@CurrentUser()` decorator - Injects current user

Example usage:
```typescript
@Post()
@Roles(UserRole.ADMIN)
@UseGuards(AuthGuard('jwt'), RolesGuard)
create(@CurrentUser() user: User) {
  // Only admins can access this endpoint
}
```

### User Roles

- **Admin**: Full access to all resources
- **Technician**: Can view/update tickets, limited user access
- **Client**: Can create tickets and view own history

## 🧪 Testing

### Run Tests

```bash
# Unit tests
npm test

# Watch mode
npm run test:watch

# Coverage report
npm run test:cov

# E2E tests
npm run test:e2e

# Debug tests
npm run test:debug
```

### Test Coverage

Coverage reports are generated in `/coverage` directory and served at `/coverage` endpoint when the app is running.

Current coverage:
- Statements: ~31%
- Branches: ~36%
- Functions: ~15%
- Lines: ~30%

### Example Tests

See `tickets.service.spec.ts` for examples of:
- Mocking repositories
- Testing business logic
- Validating exceptions
- Testing state transitions

## 🎯 Business Logic

### Ticket Creation
1. Client creates ticket with status `OPEN`
2. No technician assigned initially
3. Validates category exists
4. Auto-associates with client profile

### Ticket Assignment
1. Technician views available open tickets
2. Clicks "Start Working" → status changes to `IN_PROGRESS`
3. System auto-assigns technician
4. Validates technician doesn't exceed 5 concurrent tickets

### Status Transitions
```
OPEN → IN_PROGRESS → RESOLVED → CLOSED
```

Invalid transitions are rejected with `BadRequestException`.

## 🛡️ Security Features

- ✅ Password hashing with bcrypt (salt rounds: 10)
- ✅ JWT token validation
- ✅ Role-based access control
- ✅ Input validation with class-validator
- ✅ SQL injection protection (TypeORM parameterized queries)
- ✅ CORS enabled
- ✅ Exception filtering with custom format

## 📦 API Response Format

All successful responses follow this format:
```json
{
  "success": true,
  "data": { ... },
  "message": "Request successful"
}
```

Error responses:
```json
{
  "statusCode": 400,
  "timestamp": "2025-12-09T17:00:00.000Z",
  "path": "/tickets",
  "message": "Error description"
}
```

## 🔧 Development Tools

### Swagger/OpenAPI
- Access at `/api`
- Try endpoints directly
- View request/response schemas
- Test authentication

### Database Management

```bash
# Start PostgreSQL
cd ..
docker-compose up -d

# View logs
docker-compose logs -f postgres

# Stop database
docker-compose down

# Reset database (⚠️ destroys all data)
docker-compose down -v
```

### Useful Commands

```bash
# Type checking
npm run build

# Linting
npm run lint

# Format code
npm run format
```

## 📝 Creating New Features

### 1. Create Entity

```typescript
// entities/example.entity.ts
@Entity()
export class Example {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  
  @Column()
  name: string;
}
```

### 2. Create DTOs

```typescript
// dto/create-example.dto.ts
export class CreateExampleDto {
  @IsString()
  @IsNotEmpty()
  name: string;
}
```

### 3. Create Service

```typescript
// example.service.ts
@Injectable()
export class ExampleService {
  constructor(
    @InjectRepository(Example)
    private repo: Repository<Example>,
  ) {}
}
```

### 4. Create Controller

```typescript
// example.controller.ts
@Controller('examples')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class ExampleController {
  @Post()
  @Roles(UserRole.ADMIN)
  create(@Body() dto: CreateExampleDto) {
    return this.service.create(dto);
  }
}
```

## 🐛 Troubleshooting

### Database Connection Issues

```bash
# Check PostgreSQL is running
docker ps

# Check connection settings in .env
cat .env

# Restart database
docker-compose restart postgres
```

### Port Already in Use

```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use different port in .env
PORT=3001
```

### Module Not Found

```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

## 📈 Performance Considerations

- **Database Queries**: TypeORM relations are lazy-loaded by default
- **Password Hashing**: bcrypt with 10 rounds (balanced security/performance)
- **JWT**: Tokens cached on client, validated on each request
- **Synchronize**: Set to `false` in production, use migrations

## 🚀 Deployment

### Production Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Use strong `JWT_SECRET`
- [ ] Set `synchronize: false` in TypeORM
- [ ] Use database migrations
- [ ] Enable HTTPS
- [ ] Configure CORS properly
- [ ] Set up logging
- [ ] Configure rate limiting
- [ ] Enable compression
- [ ] Set up monitoring

### Build for Production

```bash
npm run build
npm run start:prod
```

## 📞 Support

For issues and questions:
- Check Swagger documentation at `/api`
- Review test examples in `*.spec.ts` files
- Check TypeORM logs for database issues

---

**Built with NestJS** ⚡
