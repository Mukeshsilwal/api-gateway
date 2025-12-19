FROM eclipse-temurin:17-jdk-alpine AS builder
WORKDIR /app

COPY mvnw .
COPY .mvn/wrapper .mvn/wrapper
COPY pom.xml ./pom.xml
COPY services/auth-service/pom.xml ./services/auth-service/pom.xml


RUN chmod +x mvnw && ./mvnw -N install -DskipTests

# Install local shared library so the module is resolvable during service dependency resolution
COPY shared/common/pom.xml ./shared/common/pom.xml
COPY shared/common/src ./shared/common/src
RUN ./mvnw -f shared/common/pom.xml -DskipTests install -B

RUN ./mvnw -f services/auth-service/pom.xml dependency:go-offline -B
COPY services/auth-service/src ./services/auth-service/src

RUN ./mvnw -f services/auth-service/pom.xml clean package -DskipTests

FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

RUN apk add --no-cache wget
RUN addgroup -S spring && adduser -S spring -G spring
USER spring:spring

COPY --from=builder /app/services/auth-service/target/*.jar app.jar

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=3s --start-period=60s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8080/actuator/health || exit 1

ENTRYPOINT ["java", \
    "-XX:+UseContainerSupport", \
    "-XX:MaxRAMPercentage=75.0", \
    "-jar", \
    "app.jar"]
