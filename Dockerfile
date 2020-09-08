FROM node:12

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./

RUN npm install

# Bundle app source
COPY . .

# Map port
EXPOSE 8088

# Start server
CMD [ "node", "server.js" ]
