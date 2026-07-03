FROM eclipse-temurin:21-jre
WORKDIR /app
COPY search-service/target/*.jar app.jar
EXPOSE 8004
ENTRYPOINT ["java", "-jar", "app.jar"]

