FROM eclipse-temurin:21-jre
WORKDIR /app
COPY saga-orchestrator/target/*.jar app.jar
EXPOSE 8010
ENTRYPOINT ["java", "-jar", "app.jar"]

