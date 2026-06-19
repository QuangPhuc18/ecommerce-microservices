FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app

COPY pom.xml .
COPY config-server config-server/

RUN mvn clean package -pl config-server -am -DskipTests

FROM openjdk:21-jdk-slim
WORKDIR /app
COPY --from=build /app/config-server/target/*.jar app.jar
EXPOSE 8888
ENTRYPOINT ["java", "-jar", "app.jar"]
