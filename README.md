# To-Do List
This is a self-hosted To-Do-List. See also the [Alexa Companion Skill](https://github.com/paranerd/to-do-list-alexa-skill).

## Setup
### Run with PM2
1. Install MongoDB
    - Check [this guide](https://docs.mongodb.com/manual/installation/) on how to intall.

2. Install PM2 globally
```
npm i -g pm2
```

3. Update server config
    - Set environment variables in `/server/.env`

4. Update client config
    - Set environment variables in `/client/.env`

5. Install dependencies
```
npm --prefix ./client i
```

```
npm --prefix ./server i
```

6. Build the client
```
npm run-script --prefix ./client build
```

7. Start the app
    - From within project root run:
```
npm start --prefix ./client && npm start --prefix ./server
```

### Run with Docker
1. [Install Docker](https://docs.docker.com/get-docker/)

2. [Install Docker Compose](https://docs.docker.com/compose/install/)

3. Update config
    - Set environment variables in `/.env`

4. From within project root run:
```
sudo docker-compose build
```

```
sudo docker-compose up -d
```

## Update
### Update with PM2
1. Pull updates from GitHub

2. Apply update
```
npm run-script --prefix ./client update
```

This rebuilds the client and then restarts the service in PM2

### Update with Docker
1. Pull updates from GitHub

2. Apply update
    - From within project root call
```
sudo docker-compose down && sudo docker-compose build && sudo docker-compose up -d
```

## First start
Go to `[to-do-list-url]/setup` to create the admin user.

After creating you will automatically be logged in.