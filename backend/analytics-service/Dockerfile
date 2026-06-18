FROM openjdk:21-jdk-slim
WORKDIR /app
COPY target/analytics-service-1.0.0-SNAPSHOT.jar app.jar
EXPOSE 8009
ENTRYPOINT ["java", "-jar", "app.jar"]
