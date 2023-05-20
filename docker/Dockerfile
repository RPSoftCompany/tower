FROM node:19.8.1

ARG VERSION=3.0.0
LABEL TOWER_VERSION=${VERSION}

ENV NODE_ENV production

RUN mkdir -p /home/tower

WORKDIR /home/tower

RUN groupadd -g 2001 tower \
    && useradd -r -u 2001 -g tower tower

COPY . .

RUN chown -R tower:tower .

USER tower

WORKDIR /home/tower/backend

SHELL ["/bin/bash", "-c"]
ENTRYPOINT ["/bin/bash", "-c", "npm run start:prod"]
