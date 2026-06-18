FROM openjdk:21-jdk-slim
WORKDIR /app
COPY target/notification-service-1.0.0-SNAPSHOT.jar app.jar
EXPOSE 8008
ENTRYPOINT ["java", "-jar", "app.jar"]
