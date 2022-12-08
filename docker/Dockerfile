FROM ubuntu:20.04

ARG VERSION=1.17.0

LABEL TOWER_VERSION=${VERSION}

ENV NODE_ENV production

RUN apt update && apt install -y wget unzip

RUN mkdir -p /apps/tower

WORKDIR /apps/tower

RUN groupadd -g 2001 tower \
    && useradd -r -u 2001 -g tower tower

RUN chown -R tower:tower .

USER tower

RUN wget -q https://github.com/RPSoftCompany/tower/releases/download/${VERSION}/tower-${VERSION}.zip
RUN unzip tower-${VERSION}.zip
RUN mv tower/* .

RUN chmod 777 ./tower-linux

COPY config.json .
COPY database-config.json_template .
COPY dockerStart.sh .

ENTRYPOINT ["./dockerStart.sh"]
