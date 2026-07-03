FROM eclipse-temurin:21-jre
WORKDIR /app
COPY payment-service/target/*.jar app.jar
EXPOSE 8006
ENTRYPOINT ["java", "-jar", "app.jar"]

