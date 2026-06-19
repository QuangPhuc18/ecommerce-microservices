FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app

COPY pom.xml .
COPY shared-lib shared-lib/
COPY analytics-service analytics-service/

RUN mvn clean package -pl analytics-service -am -DskipTests

FROM openjdk:21-jdk-slim
WORKDIR /app
COPY --from=build /app/analytics-service/target/*.jar app.jar
EXPOSE 8009
ENTRYPOINT ["java", "-jar", "app.jar"]
