FROM node:22-alpine

ARG VERSION=3.6.0
LABEL TOWER_VERSION=${VERSION}

RUN mkdir -p /home/tower

WORKDIR /home/tower

RUN addgroup -S tower && adduser -D -G tower tower

COPY ui ui
COPY backend backend

RUN chown -R tower:tower .

USER tower

RUN ls -lha

WORKDIR /home/tower/ui
RUN yarn install

WORKDIR /home/tower/backend
RUN yarn install

ENV NODE_ENV=production

WORKDIR /home/tower/ui
RUN yarn run build

WORKDIR /home/tower/backend
RUN yarn run build


WORKDIR /home/tower

RUN mv backend/.env_template backend/.env
RUN mkdir -p backend/client
RUN cp -R ui/dist/spa/* backend/client/

WORKDIR /home/tower/backend

SHELL ["/bin/sh", "-c"]
ENTRYPOINT ["/bin/sh", "-c", "npm run start:prod"]
