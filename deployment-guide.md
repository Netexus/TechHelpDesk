# TechHelpDesk Production Deployment Guide

## Overview
This guide configures a NestJS + Angular + PostgreSQL application for production deployment on Railway (backend) and Vercel (frontend).

**Current URLs:**
- Frontend: https://techhelpfrontend.vercel.app
- Backend: https://techhelpdesk-production-5771.up.railway.app
- Database: Supabase PostgreSQL

---

## 1. Create Environment Files for Frontend

### Create `Frontend/src/environments/environment.ts`:
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000'
};
```

### Create `Frontend/src/environments/environment.prod.ts`:
```typescript
export const environment = {
  production: true,
  apiUrl: 'https://techhelpdesk-production-5771.up.railway.app'
};
```

---

## 2. Update Frontend Services to Use Environment

### Update `Frontend/src/app/services/auth.ts`:

Add this import at the top:
```typescript
import { environment } from '../../environments/environment';
```

Change line 7 from:
```typescript
private apiUrl = 'http://localhost:3000/auth';
```

To:
```typescript
private apiUrl = `${environment.apiUrl}/auth`;
```

### Update `Frontend/src/app/services/ticket.ts`:

Add this import at the top:
```typescript
import { environment } from '../../environments/environment';
```

Change lines 7-8 from:
```typescript
private apiUrl = 'http://localhost:3000/tickets';
```

To:
```typescript
private apiUrl = `${environment.apiUrl}/tickets`;
private categoriesUrl = `${environment.apiUrl}/categories`;
```

And change line 29 from:
```typescript
return this.http.get('http://localhost:3000/categories');
```

To:
```typescript
return this.http.get(this.categoriesUrl);
```

### Update `Frontend/src/app/pages/admin/categories/categories.ts`:

Add this import at the top:
```typescript
import { environment } from '../../../environments/environment';
```

Add this property after line 13:
```typescript
private apiUrl = `${environment.apiUrl}/categories`;
```

Change lines 27 and 36 from:
```typescript
this.http.get('http://localhost:3000/categories')
this.http.post('http://localhost:3000/categories', this.newCategory)
```

To:
```typescript
this.http.get(this.apiUrl)
this.http.post(this.apiUrl, this.newCategory)
```

### Update `Frontend/src/app/pages/admin/users/users.ts`:

Add this import at the top:
```typescript
import { environment } from '../../../environments/environment';
```

Add this property after line 13:
```typescript
private apiUrl = `${environment.apiUrl}/users`;
```

Change lines 27 and 36 from:
```typescript
this.http.get('http://localhost:3000/users')
this.http.post('http://localhost:3000/users', this.newUser)
```

To:
```typescript
this.http.get(this.apiUrl)
this.http.post(this.apiUrl, this.newUser)
```

---

## 3. Configure angular.json for Production Builds

In `Frontend/angular.json`, verify the production configuration includes `fileReplacements`. It should look like this:

```json
{
  "projects": {
    "Frontend": {
      "architect": {
        "build": {
          "configurations": {
            "production": {
              "fileReplacements": [
                {
                  "replace": "src/environments/environment.ts",
                  "with": "src/environments/environment.prod.ts"
                }
              ],
              "budgets": [
                {
                  "type": "initial",
                  "maximumWarning": "500kB",
                  "maximumError": "1MB"
                },
                {
                  "type": "anyComponentStyle",
                  "maximumWarning": "4kB",
                  "maximumError": "8kB"
                }
              ],
              "outputHashing": "all"
            }
          }
        }
      }
    }
  }
}
```

---

## 4. Update Backend CORS Configuration

Replace the entire `Backend/src/main.ts` file with:

```typescript
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // CORS configuration for production
  app.enableCors({
    origin: [
      'http://localhost:4200',
      'https://techhelpfrontend.vercel.app',
      'https://*.vercel.app'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalInterceptors(new TransformInterceptor());
  app.useGlobalFilters(new HttpExceptionFilter());

  // Serve static files only in development
  if (process.env.NODE_ENV !== 'production') {
    app.useStaticAssets(join(__dirname, '..', 'coverage', 'lcov-report'), {
      prefix: '/coverage/',
    });
  }

  // Swagger/OpenAPI Configuration
  const config = new DocumentBuilder()
    .setTitle('TechHelpDesk API')
    .setDescription('API documentation for TechHelpDesk ticket management system.')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter your JWT token from /auth/login',
      },
      'JWT-auth',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  const port = process.env.PORT || 3000;
  await app.listen(port, '0.0.0.0');
  
  console.log(`🚀 Application running on port: ${port}`);
  console.log(`📚 API Docs: https://techhelpdesk-production-5771.up.railway.app/api`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
}
bootstrap();
```

---

## 5. Configure Railway Environment Variables

In Railway Dashboard → Your Backend Service → Variables, ensure you have:

```
DATABASE_URL=postgresql://postgres.xxxxx:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres
NODE_ENV=production
PORT=3000
JWT_SECRET=your-super-secure-secret-key-minimum-32-characters
```

**Important:** Replace `JWT_SECRET` with a secure random string (minimum 32 characters).

---

## 6. Verify Vercel Configuration

Ensure `Frontend/vercel.json` exists with:

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

In Vercel Dashboard → Your Project → Settings → Build & Development Settings:

```
Framework Preset: Angular
Build Command: npm run build
Output Directory: dist/Frontend/browser
Root Directory: Frontend
```

---

## 7. Deploy Changes

### Backend:
```bash
cd Backend
git add .
git commit -m "Configure CORS and environment for production"
git push
```

### Frontend:
```bash
cd Frontend
git add .
git commit -m "Add production environment configuration"
git push
```

Both Railway and Vercel will automatically redeploy.

---

## 8. Verification Steps

### Step 1: Verify Backend is Running
Open: https://techhelpdesk-production-5771.up.railway.app/api

You should see Swagger documentation.

### Step 2: Check Railway Logs
In Railway Dashboard:
1. Click on your backend service
2. Go to Deployments → Click on latest deployment
3. Check logs for:
   ```
   🚀 Application running on port: 3000
   ✅ DATABASE CONNECTED SUCCESSFULLY
   ```

### Step 3: Test Frontend
1. Open: https://techhelpfrontend.vercel.app
2. Try logging in with demo credentials:
   - Admin: `admin@techhelpdesk.com` / `admin123`
   - Technician: `tech@techhelpdesk.com` / `tech123`
   - Client: `client@techhelpdesk.com` / `client123`

### Step 4: Check Browser Console
Open DevTools (F12) → Console and Network tabs:
- Should have no CORS errors
- API calls should go to `https://techhelpdesk-production-5771.up.railway.app`

---

## 9. Troubleshooting

### If Login Fails:
Check if users exist in Supabase:
1. Go to Supabase → Table Editor → `user` table
2. Verify demo users exist
3. If not, run the seeder locally or create users manually

### If CORS Errors Appear:
1. Verify backend CORS configuration includes Vercel URL
2. Redeploy backend in Railway
3. Clear browser cache (Ctrl + Shift + R)

### If Frontend Shows 404:
1. Verify `vercel.json` exists in Frontend root
2. Redeploy in Vercel

---

## 10. Final Checklist

```
✅ environment.ts created (localhost:3000)
✅ environment.prod.ts created (railway URL)
✅ angular.json configured with fileReplacements
✅ All services use environment.apiUrl
✅ CORS updated in backend
✅ JWT_SECRET added in Railway
✅ NODE_ENV=production in Railway
✅ DATABASE_URL configured in Railway
✅ vercel.json exists in Frontend
✅ Git push backend
✅ Git push frontend
✅ Backend deployed and running
✅ Frontend deployed
✅ Swagger accessible
✅ Login works
✅ No CORS errors
```

---

## URLs Summary

```
🌐 Frontend: https://techhelpfrontend.vercel.app
🔧 Backend API: https://techhelpdesk-production-5771.up.railway.app
📚 API Docs: https://techhelpdesk-production-5771.up.railway.app/api
🗄️ Database: Supabase (PostgreSQL)
```

---

## Additional Notes

- The app uses JWT authentication
- Database connection uses SSL (required for Supabase)
- Synchronize is disabled in production (use migrations for schema changes)
- Swagger documentation is available in production for API testing
