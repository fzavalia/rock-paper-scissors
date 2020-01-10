FROM node:12.14.1-alpine AS builder

WORKDIR /app

COPY frontend frontend

COPY backend backend

COPY build.sh build.sh

RUN ./build.sh

FROM node:12.14.1-alpine

WORKDIR /app

COPY --from=builder /app/dist .

CMD [ "node", "server/index.js" ]