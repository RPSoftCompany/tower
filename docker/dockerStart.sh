#!/bin/bash

# =============================
# config.json
# =============================

__HOST=${HOST}
if [ -z "${__HOST}" ]
then
  __HOST="0.0.0.0"
fi

__PORT=${PORT}
if [ -z "${__PORT}" ]
then
  __PORT="5000"
fi

__LOG_LEVEL=${LOG_LEVEL}
if [ -z "${__LOG_LEVEL}" ]
then
  __LOG_LEVEL="error"
fi

__EXPLORER=${EXPLORER}
if [ -z "${__EXPLORER}" ]
then
  __EXPLORER="true"
fi

__NON_SAFE=${NON_SAFE}
if [ -z "${__NON_SAFE}" ]
then
  __NON_SAFE="false"
fi

__FULL_ENCRYPTION=${FULL_ENCRYPTION}
if [ -z "${__FULL_ENCRYPTION}" ]
then
  __FULL_ENCRYPTION="false"
fi

__TOKEN_HEADERS=${TOKEN_HEADERS}
if [ -z "${__TOKEN_HEADERS}" ]
then
  __TOKEN_HEADERS="[]"
fi

sed -i s/\$HOST/"${__HOST}"/g config.json
sed -i s/\$PORT/"${__PORT}"/g config.json
sed -i s/\$LOG_LEVEL/"${__LOG_LEVEL}"/g config.json
sed -i s/\$EXPLORER/"${__EXPLORER}"/g config.json
sed -i s/\$NON_SAFE/"${__NON_SAFE}"/g config.json
sed -i s/\FULL_ENCRYPTION/"${__FULL_ENCRYPTION}"/g config.json
sed -i s/\$TOKEN_HEADERS/"${__TOKEN_HEADERS}"/g config.json

# =============================
# database-config.json_template
# =============================

__DATABASE=${DATABASE}
if [ -z "${__DATABASE}" ]
then
  __DATABASE="mongodb://localhost:27017/production"
fi

awk -v database="${__DATABASE}" '{sub(/\$DATABASE/, database)}1' database-config.json_template > database-config.json

exec ./tower-linux