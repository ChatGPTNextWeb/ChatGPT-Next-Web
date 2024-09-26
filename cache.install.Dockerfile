FROM sijinhui/node:base AS deps

WORKDIR /app

COPY package.json yarn.lock ./

RUN yarn install
