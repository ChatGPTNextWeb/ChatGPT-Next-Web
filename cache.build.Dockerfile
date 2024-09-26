FROM sijinhui/chatgpt-next-web:installcache AS deps

FROM sijinhui/node:base AS builder

RUN apk add --no-cache git libc6-compat

ENV OPENAI_API_KEY=""
ENV GOOGLE_API_KEY=""
ENV CODE=""

WORKDIR /app
COPY . .
COPY --from=deps /app/node_modules ./node_modules
# 避免下面那个报错
# RUN mkdir -p "/app/node_modules/tiktoken" && mkdir -p "/app/node_modules/sharp"
# RUN yarn add sharp
# ENV NEXT_SHARP_PATH /app/node_modules/sharp
RUN yarn build
