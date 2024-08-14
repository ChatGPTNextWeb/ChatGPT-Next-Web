FROM hub.si.icu/library/node:22.1-alpine AS base
RUN sed -i 's/dl-cdn.alpinelinux.org/mirrors.ustc.edu.cn/g' /etc/apk/repositories
RUN apk add --no-cache tzdata
# 设置时区环境变量
ENV TZ=Asia/Chongqing
# 更新并安装时区工具
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

RUN yarn config set registry 'https://registry.npmmirror.com' ; \
    yarn config set sharp_binary_host "https://cdn.npmmirror.com/binaries/sharp" ; \
    yarn config set sharp_libvips_binary_host "https://cdn.npmmirror.com/binaries/sharp-libvips"
ENV PRISMA_ENGINES_MIRROR=https://registry.npmmirror.com/-/binary/prisma

FROM base AS deps

WORKDIR /app

COPY package.json yarn.lock ./

RUN yarn install
