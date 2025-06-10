# Render Deployment Instructions

## 🚀 Deploy to Render (Recommended Method)

### Step 1: Push Code to Git Repository
```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit your changes
git commit -m "Add Docker configuration for Render deployment"

# Push to your GitHub/GitLab repository
git push origin main
```

### Step 2: Deploy on Render
1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click "New +" → "Web Service"
3. Connect your GitHub/GitLab repository
4. Select your repository: `event-management` or similar
5. Configure the service:
   - **Name**: `eventify-backend`
   - **Region**: `Oregon` (or your preferred region)
   - **Branch**: `main`
   - **Environment**: `Docker`
   - **Dockerfile Path**: `./Dockerfile`
   - **Plan**: `Starter` (free tier)

### Step 3: Set Environment Variables
In the Render dashboard, add these environment variables:

```
SPRING_PROFILES_ACTIVE=production
PORT=8080

# Database (you'll need to create a PostgreSQL database first)
DATABASE_URL=<your-render-postgres-url>
DB_USERNAME=<your-db-username>
DB_PASSWORD=<your-db-password>

# Security
JWT_SECRET=<generate-a-strong-32-character-secret>

# Email Configuration
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=<your-gmail-address>
MAIL_PASSWORD=<your-gmail-app-password>

# Admin Configuration
ADMIN_EMAIL=<your-admin-email>
ADMIN_PHONE=<your-admin-phone>
ADMIN_PASSWORD=<your-admin-password>

# Twilio (for WhatsApp)
TWILIO_ACCOUNT_SID=<your-twilio-sid>
TWILIO_AUTH_TOKEN=<your-twilio-token>
TWILIO_WHATSAPP_FROM=<your-twilio-whatsapp-number>

# Supabase (for file storage)
SUPABASE_URL=<your-supabase-url>
SUPABASE_ANON_KEY=<your-supabase-anon-key>
SUPABASE_SERVICE_KEY=<your-supabase-service-key>
```

### Step 4: Create PostgreSQL Database (Optional)
If you want to use Render's PostgreSQL:
1. Go to "New +" → "PostgreSQL"
2. Name: `eventify-postgres`
3. Plan: `Starter` (free tier)
4. Copy the connection details to your web service environment variables

### Step 5: Deploy!
1. Click "Create Web Service"
2. Render will automatically build and deploy your application
3. Monitor the build logs
4. Once deployed, test your application at the provided URL

## 🔍 Health Check
Render will automatically use your health endpoint: `/actuator/health`

## 📝 Notes
- **Build time**: ~5-10 minutes for first deployment
- **Auto-deploy**: Enabled by default on git push
- **Logs**: Available in Render dashboard
- **Custom domain**: Can be configured after deployment

## 🛠️ Troubleshooting
If deployment fails:
1. Check the build logs in Render dashboard
2. Verify all environment variables are set
3. Ensure your database is accessible
4. Check the application logs for errors

Your application will be available at: `https://your-service-name.onrender.com`
