FROM denoland/deno:1.25.0

ARG GIT_REVISION
ARG report_server_aws_key
ARG report_server_aws_secret
ARG POSTGRES_HOST
ARG POSTGRES_USER
ARG POSTGRES_PWD

ENV DENO_DEPLOYMENT_ID=${GIT_REVISION}
ENV report_server_aws_key=${report_server_aws_key}
ENV report_server_aws_secret=${report_server_aws_secret}
ENV POSTGRES_HOST=${POSTGRES_HOST}
ENV POSTGRES_USER=${POSTGRES_USER}
ENV POSTGRES_PWD=${POSTGRES_PWD}

WORKDIR /app

COPY . .
RUN deno cache main.ts --import-map=import_map.json

EXPOSE 9001

CMD ["run", "-A", "--unstable", "main.ts"]