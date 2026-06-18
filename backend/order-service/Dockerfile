FROM openjdk:21-jdk-slim
WORKDIR /app
COPY target/order-service-1.0.0-SNAPSHOT.jar app.jar
EXPOSE 8005
ENTRYPOINT ["java", "-jar", "app.jar"]
