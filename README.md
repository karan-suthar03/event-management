# Event Management System

A comprehensive event management system with admin dashboard, event creation, offering management, and WhatsApp notifications.

## 🚨 SECURITY FIRST - BEFORE YOU START

**IMPORTANT:** This repository now uses environment variables for all sensitive data. You MUST configure environment variables before running the application.

### Quick Security Setup:

1. **Read the security guide:** See `SECURITY.md` for detailed instructions
2. **Copy environment templates:**
   ```bash
   cp .env.example .env
   cd frontend && cp .env.example .env
   ```
3. **Update with your actual credentials**

## 🏗️ Project Structure

```
├── backend/           # Spring Boot backend
├── frontend/          # React frontend
├── .env.example       # Environment template
├── .env.production    # Production template (DO NOT COMMIT WITH REAL VALUES)
└── SECURITY.md        # Security configuration guide
```

## ⚙️ Technologies Used

### Backend
- **Spring Boot 3.2.1** - Java framework
- **PostgreSQL** - Database (Supabase)
- **JWT** - Authentication
- **Twilio** - WhatsApp notifications
- **Spring Mail** - Email notifications

### Frontend
- **React 18** - Frontend framework
- **Vite** - Build tool
- **React Router** - Routing
- **Axios** - HTTP client

## 🚀 Getting Started

### Prerequisites
- Java 17+
- Node.js 16+
- PostgreSQL database (or Supabase account)

### 1. Environment Setup

**Backend Configuration:**
```bash
# Copy and configure environment variables
cp .env.example .env

# Edit .env with your actual credentials
# See SECURITY.md for detailed instructions
```

**Frontend Configuration:**
```bash
cd frontend
cp .env.example .env

# Edit frontend/.env
echo "VITE_API_BASE_URL=http://localhost:8080" > .env
```

### 2. Database Setup

Configure your PostgreSQL database or use Supabase:
- Update `SPRING_DATASOURCE_*` variables in `.env`
- The application will auto-create tables on first run

### 3. External Services (Optional)

**Email notifications:**
- Gmail App Password (see SECURITY.md)
- Update `SPRING_MAIL_*` variables

**WhatsApp notifications:**
- Twilio account and WhatsApp sandbox
- Update `TWILIO_*` variables

**File storage:**
- Supabase storage
- Update `SUPABASE_*` variables

### 4. Running the Application

**Backend:**
```bash
cd backend
./mvnw spring-boot:run
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

**Access the application:**
- Frontend: http://localhost:5173
- Backend API: http://localhost:8080

## 📝 Features

### Public Features
- View events and offerings
- Request services for events
- Contact form

### Admin Features
- Dashboard with analytics
- Event management (CRUD)
- Offering management
- Request management
- WhatsApp and email notifications
- File upload for event images

## 🔐 Authentication

Default admin credentials for development:
- Username: `admin`
- Password: `admin123`

**⚠️ Change default credentials in production!**

## 🌐 Deployment

### Environment Variables for Production

Set these in your hosting platform (Render, Heroku, etc.):

```bash
# Database
SPRING_DATASOURCE_URL=your_production_db_url
SPRING_DATASOURCE_USERNAME=your_db_user
SPRING_DATASOURCE_PASSWORD=your_db_password

# Security
JWT_SECRET=your_secure_jwt_secret_32_chars_minimum

# Email
SPRING_MAIL_USERNAME=your_email@gmail.com
SPRING_MAIL_PASSWORD=your_gmail_app_password

# Admin
ADMIN_EMAIL=your_admin@domain.com
ADMIN_PHONE=your_phone_number

# Optional services
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Frontend Deployment

Update `VITE_API_BASE_URL` to your production backend URL:
```bash
VITE_API_BASE_URL=https://your-backend-domain.com
```

## 📚 API Documentation

### Authentication Endpoints
- `POST /api/auth/login` - Admin login
- `GET /api/auth/me` - Get current admin
- `POST /api/auth/validate` - Validate token

### Event Endpoints
- `GET /api/events` - Get all events
- `POST /api/events` - Create event (admin)
- `PUT /api/events/{id}` - Update event (admin)
- `DELETE /api/events/{id}` - Delete event (admin)

### Offering Endpoints
- `GET /api/offerings` - Get all offerings
- `POST /api/offerings` - Create offering (admin)
- `POST /api/offerings/{id}/request` - Request offering

## 🛠️ Development

### Backend Development
```bash
cd backend
./mvnw spring-boot:run -Dspring-boot.run.profiles=dev
```

### Frontend Development
```bash
cd frontend
npm run dev
```

### Building for Production
```bash
# Backend
cd backend
./mvnw clean package

# Frontend
cd frontend
npm run build
```

## 🐛 Troubleshooting

### Common Issues

1. **Database connection error:**
   - Check `SPRING_DATASOURCE_*` environment variables
   - Ensure database is running and accessible

2. **JWT token errors:**
   - Verify `JWT_SECRET` is set and at least 32 characters
   - Check token expiration (24 hours default)

3. **Email not working:**
   - Use Gmail App Password, not regular password
   - Enable 2FA on Gmail account first

4. **CORS errors:**
   - Ensure frontend URL is in CORS configuration
   - Check `VITE_API_BASE_URL` in frontend

## 📄 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make changes
4. Ensure no credentials are committed
5. Submit a pull request

## ⚠️ Security Notice

- Never commit `.env` files with real credentials
- Use environment variables for all sensitive data
- Regularly rotate secrets and API keys
- See `SECURITY.md` for comprehensive security guidelines
