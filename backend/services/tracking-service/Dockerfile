FROM eclipse-temurin:21-jdk-alpine AS builder
WORKDIR /app

COPY mvnw .
COPY .mvn/wrapper .mvn/wrapper
COPY pom.xml ./pom.xml
COPY services/tracking-service/pom.xml ./services/tracking-service/pom.xml

RUN chmod +x mvnw && ./mvnw -N install -DskipTests

# Install local shared library
COPY shared/common/pom.xml ./shared/common/pom.xml
COPY shared/common/src ./shared/common/src
RUN ./mvnw -f shared/common/pom.xml -DskipTests install -B

# Install shared-events library
COPY shared/events/pom.xml ./shared/events/pom.xml
COPY shared/events/src ./shared/events/src
RUN ./mvnw -f shared/events/pom.xml -DskipTests install -B || echo "shared-events build failed or skipped"

RUN ./mvnw -f services/tracking-service/pom.xml dependency:go-offline -B
COPY services/tracking-service/src ./services/tracking-service/src

RUN ./mvnw -f services/tracking-service/pom.xml clean package -DskipTests

FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

RUN apk add --no-cache wget
RUN addgroup -S spring && adduser -S spring -G spring
USER spring:spring

COPY --from=builder /app/services/tracking-service/target/*.jar app.jar

EXPOSE 8088

HEALTHCHECK --interval=30s --timeout=3s --start-period=60s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:8088/tracking-service/actuator/health || exit 1

ENTRYPOINT ["java", \
    "-XX:+UseContainerSupport", \
    "-XX:MaxRAMPercentage=75.0", \
    "-jar", \
    "app.jar"]
