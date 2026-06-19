FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app

COPY pom.xml .
COPY shared-lib shared-lib/
COPY chat-service chat-service/

RUN mvn clean package -pl chat-service -am -DskipTests

FROM openjdk:21-jdk-slim
WORKDIR /app
COPY --from=build /app/chat-service/target/*.jar app.jar
EXPOSE 8007
ENTRYPOINT ["java", "-jar", "app.jar"]
