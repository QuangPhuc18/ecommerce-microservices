FROM eclipse-temurin:21-jre
WORKDIR /app
COPY analytics-service/target/*.jar app.jar
EXPOSE 8009
ENTRYPOINT ["java", "-jar", "app.jar"]

