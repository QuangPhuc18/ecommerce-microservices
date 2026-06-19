FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app

COPY pom.xml .
COPY search-service search-service/

RUN mvn clean package -pl search-service -am -DskipTests

FROM openjdk:21-jdk-slim
WORKDIR /app
COPY --from=build /app/search-service/target/*.jar app.jar
EXPOSE 8004
ENTRYPOINT ["java", "-jar", "app.jar"]
