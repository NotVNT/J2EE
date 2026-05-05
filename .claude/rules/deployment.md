---
title: Deployment & Docker
description: Docker multi-stage build, memory optimization, and deployment strategy
applyTo: ["Dockerfile", "docker-compose.yml"]
---

# Deployment & Docker

## Docker Build Strategy

**Target**: Render free tier (500MB RAM limit)

**Approach**: Multi-stage build with aggressive JVM tuning

## Dockerfile Structure

### Stage 1: Build JAR

```dockerfile
FROM maven:3.9-eclipse-temurin-21 as builder

WORKDIR /app
COPY pom.xml .
RUN mvn dependency:resolve
COPY src ./src
RUN mvn clean package -DskipTests
```

**Purpose**: 
- Build JAR using Maven in full JDK environment
- Result: `target/moneymanager-*.jar`

### Stage 2: Runtime Image

```dockerfile
FROM eclipse-temurin:21-jre-alpine

WORKDIR /app
COPY --from=builder /app/target/moneymanager-*.jar app.jar

# JVM tuning for 350MB max heap
ENV JAVA_OPTS="-XX:TieredStopAtLevel=1 -XX:+UseSerialGC -Xmx350m -XX:CICompilerCount=2"

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
```

**JVM Parameters Explained**:
- `XX:TieredStopAtLevel=1`: Disable C2 compiler (saves memory)
- `+UseSerialGC`: Single-threaded garbage collection (saves memory)
- `Xmx350m`: Max heap size 350MB (under 500MB limit)
- `XX:CICompilerCount=2`: Limit compiler threads

**Base Image**: Alpine Linux JRE (compact, ~100MB)

## Build & Run Commands

### Local Build

```bash
# From project root
docker build -t moneymanager-backend .
```

### Local Run

```bash
# With .env file
docker run -p 8080:8080 --env-file .env moneymanager-backend

# Or specify environment variables individually
docker run -p 8080:8080 \
  -e SPRING_DATASOURCE_URL=jdbc:mysql://host.docker.internal:3306/moneymanager \
  -e SPRING_DATASOURCE_USERNAME=root \
  -e SPRING_DATASOURCE_PASSWORD=password \
  moneymanager-backend
```

### Production Build

```bash
# Push to container registry
docker tag moneymanager-backend gcr.io/PROJECT_ID/moneymanager-backend:latest
docker push gcr.io/PROJECT_ID/moneymanager-backend:latest

# Or Docker Hub
docker tag moneymanager-backend username/moneymanager-backend:latest
docker push username/moneymanager-backend:latest
```

## Deployment Platforms

### Render (Recommended for Free Tier)

**Setup**:
1. Connect GitHub repository
2. Create new "Web Service"
3. Set build command: `mvn package -DskipTests`
4. Set start command: `java $JAVA_OPTS -jar target/moneymanager-*.jar`
5. Set environment variables (add all from `.env`)
6. Set instance type: Free tier (512MB RAM)

**Deployment**:
- Automatic on git push
- Zero-downtime restarts available (paid tier)

### Docker Compose (Local Development/Testing)

```yaml
version: '3.8'

services:
  db:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: password
      MYSQL_DATABASE: moneymanager
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql

  backend:
    build: .
    ports:
      - "8080:8080"
    environment:
      SPRING_DATASOURCE_URL: jdbc:mysql://db:3306/moneymanager
      SPRING_DATASOURCE_USERNAME: root
      SPRING_DATASOURCE_PASSWORD: password
      JWT_SECRET: dev-secret
      # ... other variables
    depends_on:
      - db

  frontend:
    build: ./Frontend
    ports:
      - "3000:3000"
    environment:
      VITE_API_BASE_URL: http://backend:8080/api/v1.0
    depends_on:
      - backend

volumes:
  mysql_data:
```

**Run**:
```bash
docker-compose up
```

## Environment Variables in Production

**Critical variables** (must be set):
- `SPRING_DATASOURCE_URL` - Database connection
- `SPRING_DATASOURCE_USERNAME` - DB user
- `SPRING_DATASOURCE_PASSWORD` - DB password
- `JWT_SECRET` - Token signing key (generate random strong string)
- `PAYOS_*` - Payment gateway credentials
- `BREVO_*` - Email service credentials
- `GEMINI_API_KEY` - AI service key

**Recommended values**:
- Generate `JWT_SECRET` with: `openssl rand -base64 32`
- Use strong database password
- Never commit secrets to git

## Health Checks

### Built-in Endpoints

```bash
# Health check
curl http://localhost:8080/health

# Status check  
curl http://localhost:8080/status
```

**Configure in deployment platform**:
- Health check path: `/health`
- Interval: 30 seconds
- Timeout: 5 seconds

## Database Migration

### Initial Setup

```bash
# Run locally for initial schema creation
mvn spring-boot:run

# Or in Docker (Hibernate auto-create)
docker run --env-file .env moneymanager-backend
```

### Schema Updates

**Approach**: Use Flyway or Liquibase (optional)

**Or rely on Hibernate** (simpler, less control):
- Keep `spring.jpa.hibernate.ddl-auto=update`
- Manually review generated SQL
- Backup database before deployment

## Performance Tuning

### Memory Usage

**Measurement**:
```bash
# Check container memory usage
docker stats moneymanager-backend
```

**Optimization**:
- Monitor heap size: Keep under 350MB
- Adjust `-Xmx` if experiencing OOM
- Reduce connection pool size if necessary

### Database Performance

- Add indexes (see database-schema.md)
- Enable query caching (Redis optional)
- Monitor slow queries in logs

### Frontend Optimization

- Vite production build uses code splitting
- Enable gzip compression in nginx (if using reverse proxy)
- Set cache headers for static assets

## Monitoring & Logging

### Application Logs

```bash
# View logs from running container
docker logs <container_id>

# Follow logs in real-time
docker logs -f <container_id>
```

### Error Monitoring

Integrate with service (optional):
- Sentry: Application error tracking
- Datadog: Infrastructure monitoring
- CloudWatch: AWS-specific logging

### Key Metrics to Monitor

- Response times
- Error rates
- Database connection pool
- Memory usage
- CPU utilization

## Security Best Practices

1. **Never commit `.env` files** - Add to `.gitignore`
2. **Use secrets management** - Render's environment variables, AWS Secrets Manager, etc.
3. **Enable HTTPS** - Use reverse proxy or platform's SSL
4. **Rotate JWT secret** - If compromised, regenerate and redeploy
5. **Database encryption** - Enable MySQL SSL connections
6. **API key rotation** - Periodically rotate PayOS, Gemini, Brevo keys
7. **Backup database** - Automated daily backups

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Out of memory errors | Increase `-Xmx` but stay under 400m |
| Database connection errors | Verify connection string and credentials |
| JWT errors on restart | Ensure `JWT_SECRET` is consistent across restarts |
| Payment webhooks failing | Check webhook URL is accessible publicly |
| Slow startup (>30s) | Normal on first cold start, reduce on subsequent starts |
