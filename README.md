# To-Do List
This is a self-hosted To-Do-List. See also the [Alexa Companion Skill](https://github.com/paranerd/to-do-list-alexa-skill).

## Prerequisites
1. Install MongoDB
    - Check [this guide](https://docs.mongodb.com/manual/installation/) on how to intall.

## Setup
### Run with pm2
1. Install pm2 globally
```
npm i -g pm2
```

2. Update server config
    - Set environment variables in `/server/.env`

3. Update client config
    - Set environment variables in `/client/.env`

4. Start the app
    - From within project root run:
```
npm start --prefix ./client && npm start --prefix ./server
```

### Run with Docker
1. [Install Docker](https://docs.docker.com/get-docker/)

2. [Install Docker Compose](https://docs.docker.com/compose/install/)

3. Update ports in the following files:
    - `docker-compose.yaml`
    - `server/dockerfile` (look for `EXPOSE`)
    - `client/dockerfile` (look for `EXPOSE`)

4. Update config
    - Set environment variables in `/.env`

4. From within project root run:
```
docker-compose build
```

```
docker-compose up -d
```
