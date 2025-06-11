# Security Configuration Guide

## 🔐 Environment Variables Setup

Before running the application, you need to set up environment variables to keep your credentials secure.

### Backend Configuration

1. **Copy the environment template:**
   ```bash
   cp .env.example .env
   ```

2. **Update the `.env` file with your actual credentials:**

   ```bash
   # Database Configuration (Supabase PostgreSQL)
   SPRING_DATASOURCE_URL=jdbc:postgresql://your-db-host:5432/your-database
   SPRING_DATASOURCE_USERNAME=your_db_username
   SPRING_DATASOURCE_PASSWORD=your_actual_db_password

   # JWT Configuration - Generate a secure random string (at least 32 characters)
   JWT_SECRET=your-actual-secure-jwt-secret-key-here

   # Admin Contact Information
   ADMIN_EMAIL=your-actual-email@domain.com
   ADMIN_PHONE=your-actual-phone-number

   # Email Configuration (Gmail App Password)
   SPRING_MAIL_USERNAME=your-actual-email@gmail.com
   SPRING_MAIL_PASSWORD=your-actual-gmail-app-password

   # Twilio Configuration
   TWILIO_ACCOUNT_SID=your-actual-twilio-account-sid
   TWILIO_AUTH_TOKEN=your-actual-twilio-auth-token
   TWILIO_WHATSAPP_FROM=your-actual-twilio-whatsapp-number

   # Supabase Configuration
   SUPABASE_URL=https://your-actual-project-id.supabase.co
   SUPABASE_ANON_KEY=your-actual-supabase-anon-key
   SUPABASE_SERVICE_KEY=your-actual-supabase-service-key
   ```

### Frontend Configuration

1. **Create environment file for frontend:**
   ```bash
   cd frontend
   cp .env.example .env
   ```

2. **Update frontend `.env` file:**
   ```bash
   # For local development
   VITE_API_BASE_URL=http://localhost:8080

   # For production (replace with your actual backend URL)
   # VITE_API_BASE_URL=https://your-backend-domain.com
   ```

## 🚨 Important Security Notes

### What NOT to commit to Git:
- ❌ Real database passwords
- ❌ JWT secrets
- ❌ Email passwords/app passwords
- ❌ Twilio credentials
- ❌ Supabase keys
- ❌ Any `.env` files with real credentials

### What IS safe to commit:
- ✅ `.env.example` files (with placeholder values)
- ✅ `application.properties` (using environment variable references)
- ✅ Configuration templates

## 🔑 How to Generate Secure Secrets

### JWT Secret
Generate a secure random string for JWT:
```bash
# Option 1: Using OpenSSL
openssl rand -base64 32

# Option 2: Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Option 3: Online generator (use a reputable one)
# Visit: https://www.allkeysgenerator.com/Random/Security-Encryption-Key-Generator.aspx
```

### Gmail App Password
1. Enable 2-factor authentication on your Gmail account
2. Go to: https://support.google.com/accounts/answer/185833
3. Generate an App Password for "Mail"
4. Use this 16-character password (not your regular Gmail password)

## 🌐 Deployment Security

### For Production Deployment:
1. Use environment variables on your hosting platform
2. Never hardcode production credentials
3. Use different credentials for development and production
4. Regularly rotate your secrets

### Platform-specific Environment Variables:
- **Render/Heroku**: Set in dashboard under "Environment Variables"
- **Railway**: Use `railway variables set KEY=value`
- **Vercel**: Set in project settings under "Environment Variables"
- **AWS/GCP**: Use their respective secret management services

## 🔍 Verification Checklist

Before pushing to Git, verify:
- [ ] No real passwords in `application.properties`
- [ ] No hardcoded API URLs in frontend code
- [ ] `.env` files are in `.gitignore`
- [ ] All credentials use environment variables
- [ ] `.env.example` files have placeholder values only

## 🚀 Running the Application

### Backend:
```bash
cd backend
# Set environment variables or create .env file first
./mvnw spring-boot:run
```

### Frontend:
```bash
cd frontend
# Set environment variables or create .env file first
npm install
npm run dev
```

## ⚠️ If You Accidentally Committed Credentials

1. **Immediately change all exposed credentials**
2. **Remove from Git history:**
   ```bash
   # Remove sensitive file from Git history
   git filter-branch --force --index-filter \
   "git rm --cached --ignore-unmatch path/to/sensitive/file" \
   --prune-empty --tag-name-filter cat -- --all
   
   # Force push to remote
   git push origin --force --all
   ```
3. **Revoke and regenerate all exposed keys**
4. **Consider the credentials compromised permanently**
