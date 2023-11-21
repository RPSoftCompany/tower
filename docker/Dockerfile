FROM node:21-alpine3.18

ARG VERSION=3.1.0
LABEL TOWER_VERSION=${VERSION}

RUN mkdir -p /home/tower

WORKDIR /home/tower

RUN addgroup -S tower && adduser -D -G tower tower

COPY . .
RUN chown -R tower:tower .

USER tower

RUN cd ui && npm --production=false ci
RUN cd backend && npm --production=false ci

ENV NODE_ENV production

RUN npm run build:ui
RUN npm run build:backend
RUN mv backend/.env_template backend/.env
RUN mkdir -p backend/client
RUN cp -R ui/dist/spa/* backend/client/

WORKDIR /home/tower/backend

SHELL ["/bin/sh", "-c"]
ENTRYPOINT ["/bin/sh", "-c", "npm run start:prod"]
