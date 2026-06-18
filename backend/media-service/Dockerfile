FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
# Tạo thư mục chứa ảnh
RUN mkdir -p /app/uploads
COPY target/*.jar app.jar
EXPOSE 8083
ENTRYPOINT ["java", "-jar", "app.jar"]
