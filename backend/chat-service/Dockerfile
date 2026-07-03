FROM eclipse-temurin:21-jre
WORKDIR /app
COPY chat-service/target/*.jar app.jar
EXPOSE 8007
ENTRYPOINT ["java", "-jar", "app.jar"]

