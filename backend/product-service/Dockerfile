FROM eclipse-temurin:21-jre
WORKDIR /app
COPY product-service/target/*.jar app.jar
EXPOSE 8003
ENTRYPOINT ["java", "-jar", "app.jar"]

