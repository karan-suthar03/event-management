# Deployment Guide for Render

## Pre-deployment Checklist

### ✅ Your project is ready for Render deployment!

Your Spring Boot application is well-configured for environment variables and cloud deployment.

## Environment Variables to Set on Render

When deploying on Render, you'll need to set these environment variables in your service settings:

### Required Variables:
- `SPRING_PROFILES_ACTIVE=production`
- `PORT=8080` (automatically set by Render)

### Database Configuration:
- `DATABASE_URL` - Your PostgreSQL connection string
- `DB_USERNAME` - Database username
- `DB_PASSWORD` - Database password

### Security:
- `JWT_SECRET` - A strong secret key for JWT tokens (generate a new one for production)

### Email Configuration:
- `MAIL_HOST=smtp.gmail.com`
- `MAIL_PORT=587`
- `MAIL_USERNAME` - Your Gmail address
- `MAIL_PASSWORD` - Your Gmail app password (not your regular password)

### Admin Configuration:
- `ADMIN_EMAIL` - Admin email address
- `ADMIN_PHONE` - Admin phone number
- `ADMIN_PASSWORD` - Admin password (change from default)

### Twilio (for WhatsApp):
- `TWILIO_ACCOUNT_SID` - Your Twilio Account SID
- `TWILIO_AUTH_TOKEN` - Your Twilio Auth Token
- `TWILIO_WHATSAPP_FROM` - Your Twilio WhatsApp number

### Supabase (for file storage):
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_ANON_KEY` - Your Supabase anon key
- `SUPABASE_SERVICE_KEY` - Your Supabase service key

## Deployment Steps:

1. **Connect your repository** to Render
2. **Choose "Web Service"** as the service type
3. **Select "Docker"** as the environment
4. **Set the Dockerfile path** to `./Dockerfile`
5. **Configure environment variables** from the list above
6. **Set up a PostgreSQL database** (optional, if not using external DB)
7. **Deploy!**

## Health Check:
Your app includes health check endpoints at `/actuator/health` which Render will use to monitor your service.

## Notes:
- The application will run on port 8080 (configured for Render)
- Production profile is automatically activated
- Connection pooling is optimized for cloud deployment
- Logs are configured for production use

## Security Recommendations:
1. Generate a new, strong JWT secret for production
2. Use environment variables for all sensitive data
3. Don't commit any secrets to your repository
4. Use Gmail app passwords (not your regular password) for email
5. Keep your Twilio and Supabase credentials secure
