FROM eclipse-temurin:21-jdk-alpine AS builder
WORKDIR /app
COPY mvnw .
COPY .mvn/wrapper .mvn/wrapper
COPY pom.xml ./pom.xml
COPY gateway/pom.xml ./gateway/pom.xml
RUN chmod +x mvnw && ./mvnw -N install -DskipTests
COPY shared/common/pom.xml ./shared/common/pom.xml
COPY shared/common/src ./shared/common/src
RUN ./mvnw -f shared/common/pom.xml -DskipTests install -B
RUN ./mvnw -f gateway/pom.xml dependency:go-offline -B
COPY gateway/src ./gateway/src
RUN ./mvnw -f gateway/pom.xml clean package -DskipTests

FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
RUN apk add --no-cache wget
RUN addgroup -S spring && adduser -S spring -G spring
USER spring:spring
COPY --from=builder /app/gateway/target/*.jar app.jar
EXPOSE 8222
HEALTHCHECK --interval=30s --timeout=3s --start-period=60s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8222/actuator/health || exit 1
ENTRYPOINT ["java", "-XX:+UseContainerSupport", "-XX:MaxRAMPercentage=75.0", "-jar", "app.jar"]
