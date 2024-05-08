#!/bin/bash
set -e
# 加速
yarn config set registry 'https://registry.npmmirror.com/'
yarn config set sharp_binary_host "https://npm.taobao.org/mirrors/sharp"
yarn config set sharp_libvips_binary_host "https://npm.taobao.org/mirrors/sharp-libvips"
# 官方
#yarn config delete registry
#yarn config delete sharp_binary_host
#yarn config delete sharp_libvips_binary_host

yarn cache clean
yarn install
#if command -v cnpm &> /dev/null
#then
#    echo "cnpm 已安装"
#else
#    npm i cnpm
#fi
#
#cnpm i
yarn run build

mkdir -p "./node_modules/tiktoken"
export OUT_DIR="out"

mkdir -p ${OUT_DIR}

rsync -az --delete ./.next/standalone/ ${OUT_DIR}
rsync -az --delete ./public/ ${OUT_DIR}/public
rsync -az --delete ./.next/static/ ${OUT_DIR}/.next/static
rsync -az --delete ./.next/server/ ${OUT_DIR}/.next/server
rsync -az --delete ./.next/server/ ${OUT_DIR}/.next/server
rsync -az --delete "./node_modules/tiktoken/" ${OUT_DIR}/node_modules/tiktoken

docker network ls | grep -qw chatgpt-ns || docker network create chatgpt-ns

# 检查构建器是否已存在
if ! docker buildx inspect mybuilder &> /dev/null; then
    docker buildx create --use --name=mybuilder
fi
#docker build -t registry.cn-hangzhou.aliyuncs.com/si-private/chatgpt-next-web:temp -f Dockerfile.linux-build .
docker buildx build --platform linux/amd64 -t registry.cn-hangzhou.aliyuncs.com/si-private/chatgpt-next-web:temp -f Dockerfile.linux-build --load .

docker tag registry.cn-hangzhou.aliyuncs.com/si-private/chatgpt-next-web:temp registry.cn-hangzhou.aliyuncs.com/si-private/chatgpt-next-web:latest
docker tag registry.cn-hangzhou.aliyuncs.com/si-private/chatgpt-next-web:temp registry.cn-hangzhou.aliyuncs.com/si-private/chatgpt-next-web:test
