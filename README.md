# To-Do List

## Prerequisites
### Set up push notifications
```
npm install -g web-push
```
```
web-push generate-vapid-keys
```

Rename config/vapid.sample.json to config/vapid.json and enter your VAPID details

## Run with pm2
```
npm start
```

## Run with Docker
[Install Docker Compose](https://docs.docker.com/compose/install/)

```
docker-compose build
```

```
docker-compose up -d
```
