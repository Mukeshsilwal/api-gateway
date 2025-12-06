# Multi-stage build for optimal image size
FROM maven:3.9-eclipse-temurin-17-alpine AS build
WORKDIR /app

# Copy shared library first
COPY services/shared-library/pom.xml ./shared-library/pom.xml
COPY services/shared-library/src ./shared-library/src
RUN cd shared-library && mvn clean install -DskipTests

# Copy and build booking service
COPY services/booking-service/pom.xml ./booking-service/pom.xml
COPY services/booking-service/src ./booking-service/src
RUN cd booking-service && mvn clean package -DskipTests

# Runtime stage
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

# Add non-root user
RUN addgroup -S spring && adduser -S spring -G spring
USER spring:spring

# Copy JAR from build stage
COPY --from=build /app/booking-service/target/*.jar app.jar

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=60s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8091/actuator/health || exit 1

# Expose port
EXPOSE 8091

# JVM options for containerized environment
ENV JAVA_OPTS="-Xms512m -Xmx1024m \
  -XX:+UseG1GC \
  -XX:MaxGCPauseMillis=200 \
  -XX:+UseContainerSupport \
  -XX:InitialRAMPercentage=50.0 \
  -XX:MaxRAMPercentage=80.0"

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]