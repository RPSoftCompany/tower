#!/bin/bash

#
# Copyright RPSoft 2019,2023. All Rights Reserved.
# This file is part of RPSoft Tower.
#
# Tower is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation; either version 3 of the License, or
# (at your option) any later version.
#
# Tower is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.
#
# You should have received a copy of the GNU General Public License
# along with Tower. If not, see http:www.gnu.org/licenses/gpl-3.0.html.
#

# =============================
# secret
# =============================

__SECRET=${TOWER_SECRET}
if [ ! -z "${__SECRET}" ]
then
  export NON_SAFE="true"

  echo $__SECRET > secret
fi

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

__AUDIT_TTL=${AUDIT_TTL}
if [ -z "${__AUDIT_TTL}" ]
then
  __AUDIT_TTL="30"
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
sed -i s/\$FULL_ENCRYPTION/"${__FULL_ENCRYPTION}"/g config.json
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

exec node .
