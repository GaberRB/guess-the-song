# ── Estágio 1: build ──────────────────────────────────────────────────────────
FROM maven:3.9.6-eclipse-temurin-17 AS build
WORKDIR /app

# Copia o pom.xml primeiro para aproveitar o cache de dependências
COPY pom.xml .
RUN mvn dependency:go-offline -q

# Copia o código-fonte e gera o JAR
COPY src ./src
RUN mvn package -DskipTests -q

# ── Estágio 2: runtime ────────────────────────────────────────────────────────
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

# Copia apenas o JAR gerado no estágio anterior
COPY --from=build /app/target/*.jar app.jar

# O banco SQLite será salvo em /data (mapeado como volume)
VOLUME ["/data"]

EXPOSE 8081

ENTRYPOINT ["java", "-jar", "app.jar", "--spring.datasource.url=jdbc:sqlite:/data/guessthesong.db"]
