FROM eclipse-temurin:21-jdk-alpine AS builder
WORKDIR /app

COPY mvnw .
COPY .mvn .mvn
COPY pom.xml .

# Copy all source code including shared libraries and modules
COPY shared shared
COPY modules modules
COPY monolith-app monolith-app

# Build the application from the root to ensure all dependencies are resolved correctly
RUN chmod +x mvnw && ./mvnw clean package -DskipTests

FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

RUN apk add --no-cache wget
RUN addgroup -S spring && adduser -S spring -G spring
USER spring:spring

# Copy the built jar from monolith-app target
COPY --from=builder /app/monolith-app/target/*.jar app.jar

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=3s --start-period=60s --retries=3 \
  CMD sh -c 'wget --no-verbose --tries=1 --spider "http://localhost:${SERVER_PORT:-8080}/actuator/health" || exit 1'

ENTRYPOINT ["java", \
  "-XX:+UseContainerSupport", \
  "-XX:MaxRAMPercentage=75.0", \
  "-jar", \
  "app.jar"]
