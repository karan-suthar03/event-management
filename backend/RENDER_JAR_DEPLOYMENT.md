# Render Deployment Without Docker (JAR-based)

## 🚀 Deploy to Render (JAR Method - Simpler!)

### Step 1: Update render.yaml for JAR deployment
```yaml
services:
  - type: web
    name: eventify-backend
    env: java
    plan: starter
    region: oregon
    buildCommand: ./mvnw clean package -DskipTests
    startCommand: java -jar target/backend-0.0.1-SNAPSHOT.jar
    healthCheckPath: /actuator/health
    envVars:
      - key: SPRING_PROFILES_ACTIVE
        value: production
      - key: PORT
        value: 8080
      # Add your environment variables here:
      # - key: DATABASE_URL
      #   value: your-postgres-url
      # - key: DB_USERNAME
      #   value: your-db-username
      # - key: DB_PASSWORD
      #   value: your-db-password
      # - key: JWT_SECRET
      #   generateValue: true
      # - key: MAIL_USERNAME
      #   value: your-email@gmail.com
      # - key: MAIL_PASSWORD
      #   value: your-app-password
      # - key: TWILIO_ACCOUNT_SID
      #   value: your-twilio-sid
      # - key: TWILIO_AUTH_TOKEN
      #   value: your-twilio-token
      # - key: SUPABASE_URL
      #   value: your-supabase-url
      # - key: SUPABASE_ANON_KEY
      #   value: your-supabase-anon-key
      # - key: SUPABASE_SERVICE_KEY
      #   value: your-supabase-service-key

# Optional: PostgreSQL database
databases:
  - name: eventify-postgres
    plan: starter
    region: oregon
```

### Step 2: Push Code to Git Repository
```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit your changes
git commit -m "Add Render configuration for JAR deployment"

# Push to your GitHub/GitLab repository
git push origin main
```

### Step 3: Deploy on Render
1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click "New +" → "Web Service"
3. Connect your GitHub/GitLab repository
4. Select your repository
5. Configure the service:
   - **Name**: `eventify-backend`
   - **Region**: `Oregon`
   - **Branch**: `main`
   - **Environment**: `Java`
   - **Build Command**: `./mvnw clean package -DskipTests`
   - **Start Command**: `java -jar target/backend-0.0.1-SNAPSHOT.jar`
   - **Plan**: `Starter` (free tier)

### Step 4: Set Environment Variables
In the Render dashboard, add these environment variables:

**Required:**
```
SPRING_PROFILES_ACTIVE=production
PORT=8080
```

**Database:**
```
DATABASE_URL=postgresql://username:password@host:port/database
DB_USERNAME=your_username
DB_PASSWORD=your_password
```

**Security:**
```
JWT_SECRET=your-32-character-secret-key-here
```

**Email:**
```
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-gmail-app-password
```

**Admin:**
```
ADMIN_EMAIL=admin@yourdomain.com
ADMIN_PHONE=+1234567890
ADMIN_PASSWORD=secure-admin-password
```

**Twilio (Optional):**
```
TWILIO_ACCOUNT_SID=your-twilio-sid
TWILIO_AUTH_TOKEN=your-twilio-token
TWILIO_WHATSAPP_FROM=+14155238886
```

**Supabase (Optional):**
```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-key
```

### Step 5: Create PostgreSQL Database
1. In Render dashboard: "New +" → "PostgreSQL"
2. Name: `eventify-postgres`
3. Plan: `Starter` (free)
4. Region: `Oregon` (same as your web service)
5. Copy the **External Database URL** to your web service as `DATABASE_URL`

### Step 6: Deploy!
1. Click "Create Web Service"
2. Render will:
   - Install Java 17
   - Run Maven build
   - Start your JAR file
3. Monitor the deployment in real-time

## ✅ Advantages of JAR Deployment

- **Faster builds** (~3-5 minutes vs 5-10 for Docker)
- **Smaller memory footprint**
- **Native Java environment**
- **Simpler configuration**
- **Better performance**

## 🔍 Health Check
Render will check `/actuator/health` every 30 seconds

## 📝 Build Process
1. Render detects Java project
2. Installs OpenJDK 17
3. Runs `./mvnw clean package -DskipTests`
4. Starts with `java -jar target/backend-0.0.1-SNAPSHOT.jar`

## 🛠️ Troubleshooting
- **Build fails**: Check Maven wrapper permissions
- **Start fails**: Verify JAR name matches in start command
- **Database issues**: Check DATABASE_URL format
- **Memory issues**: Upgrade to Standard plan if needed

Your application will be available at: `https://eventify-backend.onrender.com`
