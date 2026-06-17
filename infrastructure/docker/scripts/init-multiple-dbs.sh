#!/bin/bash
set -e

if [ -n "$POSTGRES_MULTIPLE_DBS" ]; then
  for db in $(echo "$POSTGRES_MULTIPLE_DBS" | tr ',' ' '); do
    psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "postgres" <<-EOSQL
      SELECT 'CREATE DATABASE $db'
      WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = '$db')\gexec
EOSQL
  done
fi
