# Build Angular client
FROM node:12 AS ui-build
WORKDIR /app
COPY client/ ./
RUN npm install
RUN npm run build

# Build server and move Angular to /dist
FROM node:12 AS server-build
WORKDIR /app
COPY --from=ui-build /app/dist/to-do ./dist
COPY server/ ./
RUN npm install

# Set environment variables
ENV DOCKER=true
ENV PRODUCTION=true
ENV PORT=8080

# Listen on port 8080
EXPOSE 8080

# Start server
CMD ["node", "index.js"]
