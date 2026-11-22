# שלב 1: בניית האתר (Angular)
FROM node:24-slim AS client
WORKDIR /src/client
COPY client/package.json client/package-lock.json ./
RUN npm ci
COPY client/ ./
RUN npm run build

# שלב 2: בניית השרת (.NET), עם האתר הבנוי מהשלב הקודם
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS server
WORKDIR /src/server
COPY server/Server.csproj ./
RUN dotnet restore
COPY server/ ./
COPY --from=client /src/client/dist /src/client/dist
RUN dotnet publish -c Release -o /app --no-restore -p:SkipClientBuild=true

# שלב 3: הרצה. רק מה שצריך כדי להריץ, בלי כלי הבנייה
FROM mcr.microsoft.com/dotnet/aspnet:10.0
WORKDIR /app
COPY --from=server /app ./
# Render קובע את הפורט במשתנה PORT. בלעדיו משתמשים ב־8080
ENTRYPOINT ["sh", "-c", "ASPNETCORE_HTTP_PORTS=${PORT:-8080} exec dotnet Server.dll"]
