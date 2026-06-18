FROM openjdk:21-jdk-slim
WORKDIR /app
COPY target/chat-service-1.0.0-SNAPSHOT.jar app.jar
EXPOSE 8007
ENTRYPOINT ["java", "-jar", "app.jar"]
