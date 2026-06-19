FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app

COPY pom.xml .
COPY shared-lib shared-lib/
COPY user-service user-service/

RUN mvn clean package -pl user-service -am -DskipTests

FROM openjdk:21-jdk-slim
WORKDIR /app
COPY --from=build /app/user-service/target/*.jar app.jar
EXPOSE 8002
ENTRYPOINT ["java", "-jar", "app.jar"]
