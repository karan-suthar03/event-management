# Use OpenJDK 17 with Alpine for smaller image size
FROM openjdk:17-jdk-alpine

# Set working directory
WORKDIR /app

# Install maven
RUN apk add --no-cache maven

# Copy pom.xml first for better Docker layer caching
COPY pom.xml .

# Download dependencies (this layer will be cached if pom.xml doesn't change)
RUN mvn dependency:go-offline -B

# Copy source code
COPY src ./src

# Build the application (skip tests for faster builds on Render)
RUN mvn clean package -DskipTests

# Expose the port that Render will use
EXPOSE 8080

# Set active profile to production
ENV SPRING_PROFILES_ACTIVE=production

# Run the JAR file
CMD ["java", "-jar", "target/backend-0.0.1-SNAPSHOT.jar"]
