FROM node:20-alpine AS build
WORKDIR /app
# Build frontend
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS production
WORKDIR /app
# Install backend dependencies
COPY server/package*.json ./server/
WORKDIR /app/server
RUN npm ci --only=production
COPY server/ ./
WORKDIR /app
COPY --from=build /app/dist ./dist

WORKDIR /app/server
EXPOSE 3001
ENV PORT=3001
CMD ["node", "index.js"]
