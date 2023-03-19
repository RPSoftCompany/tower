FROM ubuntu:20.04

ARG VERSION=2.0.0

LABEL TOWER_VERSION=${VERSION}

ENV NODE_ENV production
ENV NVM_DIR /home/tower/.nvm

RUN apt update && apt install -y wget unzip git curl

RUN mkdir -p /home/tower

WORKDIR /home/tower

RUN groupadd -g 2001 tower \
    && useradd -r -u 2001 -g tower tower

RUN chown -R tower:tower .

USER tower

RUN git clone https://github.com/RPSoftCompany/tower.git

RUN ( git clone https://github.com/nvm-sh/nvm.git "$NVM_DIR" && \
  cd "$NVM_DIR" && \
  git checkout `git describe --abbrev=0 --tags --match "v[0-9]*" $(git rev-list --tags --max-count=1)` \
  ) && \. "$NVM_DIR/nvm.sh"

WORKDIR /home/tower/tower

RUN [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh" && nvm install node && npm install

WORKDIR /home/tower/tower/server

RUN [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh" && nvm install && npm install
RUN mkdir -p client/ui

WORKDIR /home/tower/tower/ui

RUN [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh" && nvm install && export NODE_ENV=development && npm install
RUN [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh" && nvm use && npm i -g @quasar/cli && npm run build
RUN cp -r ./dist/spa/* ../server/client/ui/

WORKDIR /home/tower/tower/server

COPY config.json .
COPY database-config.json_template .
COPY dockerStart.sh .

ENTRYPOINT ["./dockerStart.sh"]
