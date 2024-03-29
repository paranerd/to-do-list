# To-Do List

[![build](https://github.com/paranerd/to-do-list/actions/workflows/main.yml/badge.svg)](https://github.com/paranerd/to-do-list/actions/workflows/main.yml)
[![GitHub tag (latest SemVer)](https://img.shields.io/github/v/tag/paranerd/to-do-list?label=Current%20Version&logo=github)](https://github.com/paranerd/to-do-list/tags)
[![Docker Image Size (latest semver)](https://shields.api-test.nl:/docker/image-size/paranerd/to-do-list?label=Image%20Size&logo=docker)](https://hub.docker.com/repository/docker/paranerd/to-do-list)

This is a self-hosted To-Do-List. See also the [Alexa Companion Skill](https://github.com/paranerd/alexa-skill-shopping-list).

## Run with Docker
1. [Install Docker](https://docs.docker.com/get-docker/)

1. [Install Docker Compose](https://docs.docker.com/compose/install/)

1. Create a folder (e.g. `to-do-list`)
1. Add a `docker-compose.yaml`:

```yaml
version: "3"
services:
  server:
    image: paranerd/to-do-list
    container_name: to-do-list
    restart: unless-stopped
    depends_on:
      - mongo
    volumes:
      - /path/to/config:/app/config
    ports:
      - 8080:8080
  mongo:
    container_name: to-do-list-db
    restart: unless-stopped
    image: mongo
    volumes:
      - to-do-list-data:/data/db

volumes:
  to-do-list-data:
```

1. Update the volume path as well as the host port.

## First start
Go to `[to-do-list-url]/setup` to create the admin user.

After creating you will automatically be logged in.
