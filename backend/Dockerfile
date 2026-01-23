FROM python:3.11-slim

RUN apt-get update && apt-get install -y \
    postgresql \
    postgresql-contrib \
    supervisor \
    curl \
    gnupg \
    && rm -rf /var/lib/apt/lists/*

RUN mkdir -p /var/lib/postgresql/data && \
    chown -R postgres:postgres /var/lib/postgresql && \
    chmod 700 /var/lib/postgresql/data

RUN PG_VERSION=$(ls /usr/lib/postgresql/ | head -1) && \
    ln -s /usr/lib/postgresql/${PG_VERSION}/bin/postgres /usr/local/bin/postgres && \
    ln -s /usr/lib/postgresql/${PG_VERSION}/bin/initdb /usr/local/bin/initdb && \
    ln -s /usr/lib/postgresql/${PG_VERSION}/bin/pg_ctl /usr/local/bin/pg_ctl && \
    ln -s /usr/lib/postgresql/${PG_VERSION}/bin/psql /usr/local/bin/psql

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

RUN mkdir -p /data && \
    if [ -d "data" ]; then cp -r data/* /data/ 2>/dev/null || true; fi

COPY supervisord.conf /etc/supervisor/conf.d/supervisord.conf
COPY startup.sh /startup.sh
RUN chmod +x /startup.sh

RUN mkdir -p /docker-entrypoint-initdb.d
COPY db_init/ /docker-entrypoint-initdb.d/

ENV DB_HOST=localhost
ENV DB_PORT=5432
ENV DB_NAME=cio_dashboard
ENV DB_USER=cio_user
ENV DB_PASSWORD=strong_password_change_me

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=30s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:8080/api/health || exit 1

CMD ["/startup.sh"]
