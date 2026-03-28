# Bước 1: Build file JAR từ source code
FROM maven:3.9.6-eclipse-temurin-21 AS build
WORKDIR /app
# Copy file cấu hình maven và source code vào container
COPY pom.xml .
COPY src ./src
# Chạy lệnh build (bỏ qua test để deploy nhanh hơn)
RUN mvn clean package -DskipTests

# Bước 2: Chạy ứng dụng từ file JAR đã build
FROM eclipse-temurin:21-jre
WORKDIR /app
# Lấy file jar đã được build từ Bước 1
COPY --from=build /app/target/moneymanager-0.0.1-SNAPSHOT.jar app.jar
# Mở port 8080 (hoặc PORT do Render cấp)
EXPOSE 8080
# Lệnh khởi chạy server (Tự động nhận biến môi trường PORT của Render nếu có)
ENTRYPOINT ["sh", "-c", "java -Dserver.port=${PORT:-8080} -jar app.jar"]
