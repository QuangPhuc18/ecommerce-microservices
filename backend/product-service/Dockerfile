FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app

COPY pom.xml .
COPY shared-lib shared-lib/
COPY product-service product-service/

RUN mvn clean package -pl product-service -am -DskipTests

FROM openjdk:21-jdk-slim
WORKDIR /app
COPY --from=build /app/product-service/target/*.jar app.jar
EXPOSE 8003
ENTRYPOINT ["java", "-jar", "app.jar"]
