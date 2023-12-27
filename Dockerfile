#FROM registry.cn-hangzhou.aliyuncs.com/sijinhui/node:18-alpine AS base
FROM node:18-alpine AS base
RUN sed -i 's/dl-cdn.alpinelinux.org/mirrors.ustc.edu.cn/g' /etc/apk/repositories
RUN apk update && apk add --no-cache git tzdata
# 设置时区环境变量
ENV TZ=Asia/Chongqing
# 更新并安装时区工具
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

FROM base AS deps
RUN apk add --no-cache libc6-compat g++ make

WORKDIR /app

COPY package.json ./

RUN yarn config set registry 'https://registry.npmmirror.com/'
RUN yarn config set sharp_binary_host "https://npm.taobao.org/mirrors/sharp"
RUN yarn config set sharp_libvips_binary_host "https://npm.taobao.org/mirrors/sharp-libvips"
RUN # 清理遗留的缓存
RUN yarn cache clean
RUN yarn install

FROM base AS builder

ENV OPENAI_API_KEY=""
ENV GOOGLE_API_KEY=""
ENV CODE=""

WORKDIR /app
COPY . .
COPY --from=deps /app/node_modules ./node_modules

RUN yarn build

FROM base AS runner
WORKDIR /app

RUN apk add proxychains-ng

ENV PROXY_URL=""
ENV OPENAI_API_KEY=""
ENV GOOGLE_API_KEY=""
ENV CODE=""

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/.next/server ./.next/server

RUN rm -f .env

EXPOSE 3000
ENV KEEP_ALIVE_TIMEOUT=30

CMD if [ -n "$PROXY_URL" ]; then \
    export HOSTNAME="127.0.0.1"; \
    protocol=$(echo $PROXY_URL | cut -d: -f1); \
    host=$(echo $PROXY_URL | cut -d/ -f3 | cut -d: -f1); \
    port=$(echo $PROXY_URL | cut -d: -f3); \
    conf=/etc/proxychains.conf; \
    echo "strict_chain" > $conf; \
    echo "proxy_dns" >> $conf; \
    echo "remote_dns_subnet 224" >> $conf; \
    echo "tcp_read_time_out 15000" >> $conf; \
    echo "tcp_connect_time_out 8000" >> $conf; \
    echo "localnet 127.0.0.0/255.0.0.0" >> $conf; \
    echo "localnet ::1/128" >> $conf; \
    echo "[ProxyList]" >> $conf; \
    echo "$protocol $host $port" >> $conf; \
    cat /etc/proxychains.conf; \
    proxychains -f $conf node server.js; \
    else \
    node server.js; \
    fi
