FROM node:20.5.0-alpine3.18

ARG VERSION=3.0.0
LABEL TOWER_VERSION=${VERSION}

ENV NODE_ENV production

RUN mkdir -p /home/tower

WORKDIR /home/tower

RUN addgroup -S tower && adduser -D -G tower tower

USER tower

COPY . .

WORKDIR /home/tower/backend

SHELL ["/bin/sh", "-c"]
ENTRYPOINT ["/bin/sh", "-c", "npm run start:prod"]
