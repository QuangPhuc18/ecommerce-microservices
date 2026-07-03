FROM eclipse-temurin:21-jre
WORKDIR /app
COPY order-service/target/*.jar app.jar
EXPOSE 8005
ENTRYPOINT ["java", "-jar", "app.jar"]

