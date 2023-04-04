ARG RESTY_IMAGE_BASE="node"
ARG RESTY_IMAGE_TAG="18-alpine"

FROM ${RESTY_IMAGE_BASE}:${RESTY_IMAGE_TAG} AS base
ENV TZ=Asia/Shanghai

ARG OPENAI_API_KEY
ARG CODE
ARG DOCKER=true

ENV OPENAI_API_KEY="${OPENAI_API_KEY}"
ENV CODE="${CODE}"
ENV DOCKER="${DOCKER}"

FROM ${RESTY_IMAGE_BASE}:${RESTY_IMAGE_TAG} AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install


FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN yarn build


FROM base AS runner
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/.next/server ./.next/server

EXPOSE 3000
CMD ["node","server.js"]
