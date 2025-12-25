FROM eclipse-temurin:21-jdk-alpine AS builder
WORKDIR /app
COPY mvnw .
COPY .mvn/wrapper .mvn/wrapper
COPY pom.xml ./pom.xml
COPY services/sos-service/pom.xml ./services/sos-service/pom.xml
RUN chmod +x mvnw && ./mvnw -N install -DskipTests
COPY shared/common/pom.xml ./shared/common/pom.xml
COPY shared/common/src ./shared/common/src
RUN ./mvnw -f shared/common/pom.xml -DskipTests install -B
RUN ./mvnw -f services/sos-service/pom.xml dependency:go-offline -B
COPY services/sos-service/src ./services/sos-service/src
RUN ./mvnw -f services/sos-service/pom.xml clean package -DskipTests

FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
RUN apk add --no-cache wget
RUN addgroup -S spring && adduser -S spring -G spring
USER spring:spring
COPY --from=builder /app/services/sos-service/target/*.jar app.jar
EXPOSE 8093
HEALTHCHECK --interval=30s --timeout=3s --start-period=60s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8093/actuator/health || exit 1
ENTRYPOINT ["java", "-XX:+UseContainerSupport", "-XX:MaxRAMPercentage=75.0", "-jar", "app.jar"]
