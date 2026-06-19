FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app

COPY pom.xml .
COPY shared-lib shared-lib/
COPY notification-service notification-service/

RUN mvn clean package -pl notification-service -am -DskipTests

FROM openjdk:21-jdk-slim
WORKDIR /app
COPY --from=build /app/notification-service/target/*.jar app.jar
EXPOSE 8008
ENTRYPOINT ["java", "-jar", "app.jar"]
