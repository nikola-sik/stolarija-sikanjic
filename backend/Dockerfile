# ==============================================================================
# Stage 1: Build sa Maven + JDK
# ==============================================================================
FROM maven:3.9-eclipse-temurin-21 AS builder
WORKDIR /build

# Prvo kopiramo samo pom.xml - tako Docker keširaš dependencies layer
# i ne preuzimaš ih ponovo pri svakoj promjeni koda.
COPY pom.xml ./
RUN mvn dependency:go-offline -B

# Sad kopiramo source i buildamo
COPY src ./src
RUN mvn package -DskipTests -B

# ==============================================================================
# Stage 2: Runtime sa samo JRE (mnogo manja slika)
# ==============================================================================
FROM eclipse-temurin:21-jre-jammy
WORKDIR /app

# Non-root user za security
RUN useradd --create-home --shell /bin/bash spring
USER spring

# Kopiramo samo JAR iz builder stage-a
COPY --from=builder --chown=spring:spring /build/target/*.jar app.jar

EXPOSE 8080

# JVM tuning za container okruženje
# MaxRAMPercentage 75% - daj JVM-u 75% dostupne RAM (Railway 512MB → 384MB heap)
# G1GC - moderni garbage collector za web aplikacije
# ExitOnOutOfMemoryError - container restartuje umjesto da visi
ENV JAVA_OPTS="-XX:MaxRAMPercentage=75.0 -XX:+UseG1GC -XX:+ExitOnOutOfMemoryError"

# Healthcheck (Railway koristi vlastiti, ali korisno za druge platforme)
HEALTHCHECK --interval=30s --timeout=5s --start-period=60s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8080/actuator/health || exit 1

ENTRYPOINT ["sh", "-c", "exec java $JAVA_OPTS -jar app.jar"]
