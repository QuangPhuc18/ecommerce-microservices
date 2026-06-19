FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app

COPY pom.xml .
COPY shared-lib shared-lib/
COPY payment-service payment-service/

RUN mvn clean package -pl payment-service -am -DskipTests

FROM openjdk:21-jdk-slim
WORKDIR /app
COPY --from=build /app/payment-service/target/*.jar app.jar
EXPOSE 8006
ENTRYPOINT ["java", "-jar", "app.jar"]
