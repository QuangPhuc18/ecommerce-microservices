FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app

COPY pom.xml .
COPY shared-lib shared-lib/
COPY order-service order-service/

RUN mvn clean package -pl order-service -am -DskipTests

FROM openjdk:21-jdk-slim
WORKDIR /app
COPY --from=build /app/order-service/target/*.jar app.jar
EXPOSE 8005
ENTRYPOINT ["java", "-jar", "app.jar"]
