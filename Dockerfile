FROM node:12.14.1-alpine AS builder

WORKDIR /app

COPY frontend frontend

WORKDIR /app/frontend

RUN npm install

RUN npm run build

RUN ls

WORKDIR /app

COPY backend backend

WORKDIR /app/backend

RUN npm install

RUN npm run build

RUN ls

WORKDIR /app

RUN mkdir dist

RUN cp -r backend/build dist/server

RUN cp -r backend/node_modules dist/node_modules

RUN cp -r frontend/build dist/server/public

FROM node:12.14.1-alpine

WORKDIR /app

COPY --from=builder /app/dist .

CMD [ "node", "server/index.js" ]