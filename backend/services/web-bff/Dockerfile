FROM eclipse-temurin:21-jdk-alpine AS builder
WORKDIR /app

COPY mvnw .
COPY .mvn/wrapper .mvn/wrapper
COPY pom.xml ./pom.xml
COPY services/web-bff/pom.xml ./services/web-bff/pom.xml



RUN chmod +x mvnw && ./mvnw -N install -DskipTests

# Install local shared library if needed by this module
COPY shared/common/pom.xml ./shared/common/pom.xml
COPY shared/common/src ./shared/common/src
RUN ./mvnw -f shared/common/pom.xml -DskipTests install -B

RUN ./mvnw -f services/web-bff/pom.xml dependency:go-offline -B
COPY services/web-bff/src ./services/web-bff/src

RUN ./mvnw -f services/web-bff/pom.xml clean package -DskipTests

FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

RUN apk add --no-cache wget
RUN addgroup -S spring && adduser -S spring -G spring
USER spring:spring

COPY --from=builder /app/services/web-bff/target/*.jar app.jar

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=3s --start-period=60s --retries=3 \
  CMD sh -c 'wget --no-verbose --tries=1 --spider "http://localhost:${SERVER_PORT:-8080}/actuator/health" || exit 1'

ENTRYPOINT ["java", \
  "-XX:+UseContainerSupport", \
  "-XX:MaxRAMPercentage=75.0", \
  "-jar", \
  "app.jar"]
