FROM eclipse-temurin:21-jdk-alpine AS builder
WORKDIR /app

COPY mvnw .
COPY .mvn/wrapper .mvn/wrapper
COPY pom.xml ./pom.xml
COPY services/bus-service/pom.xml ./services/bus-service/pom.xml


RUN chmod +x mvnw && ./mvnw -N install -DskipTests

# Ensure local modules that are dependencies (e.g. shared-library) are
# available in the builder local repo before resolving service deps.
COPY shared/common/pom.xml ./shared/common/pom.xml
COPY shared/common/src ./shared/common/src
RUN ./mvnw -f shared/common/pom.xml -DskipTests install -B

# Install shared-events library if it exists (for event-driven arch)
COPY shared/events/pom.xml ./shared/events/pom.xml
COPY shared/events/src ./shared/events/src
RUN ./mvnw -f shared/events/pom.xml -DskipTests install -B || echo "shared-events build failed or skipped"

RUN ./mvnw -f services/bus-service/pom.xml dependency:go-offline -B

COPY services/bus-service/src ./services/bus-service/src

RUN ./mvnw -f services/bus-service/pom.xml clean package -DskipTests

FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

RUN apk add --no-cache wget
RUN addgroup -S spring && adduser -S spring -G spring
USER spring:spring

COPY --from=builder /app/services/bus-service/target/*.jar app.jar

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=3s --start-period=60s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8080/actuator/health || exit 1

ENTRYPOINT ["java", \
  "-XX:+UseContainerSupport", \
  "-XX:MaxRAMPercentage=75.0", \
  "-jar", \
  "app.jar"]
