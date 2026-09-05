# ---------------------------------------------------
# Stage 1: Build the Spring Boot app using Maven
# ---------------------------------------------------
FROM maven:3.9-eclipse-temurin-21 AS build

# Set working directory inside the container
WORKDIR /app

# Copy all backend source code into the container
COPY . .

# Build the jar file, skipping tests to keep the build fast
RUN mvn clean package -DskipTests

# ---------------------------------------------------
# Stage 2: Run the app using a lightweight JRE image
# ---------------------------------------------------
FROM eclipse-temurin:21-jre-jammy

# Set working directory inside the container
WORKDIR /app

# Create a non-root user to run the app (better security than running as root)
RUN useradd -r deployguard

# Copy only the built jar file from Stage 1 (keeps final image small)
COPY --from=build /app/target/*.jar app.jar

# Switch to the non-root user
USER deployguard

# Expose the port Spring Boot runs on
EXPOSE 8080

# Start the Spring Boot application
CMD ["java", "-jar", "app.jar"]