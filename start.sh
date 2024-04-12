#!/bin/bash

# 加速
#yarn config set registry 'https://registry.npmmirror.com/'
#yarn config set sharp_binary_host "https://npm.taobao.org/mirrors/sharp"
#yarn config set sharp_libvips_binary_host "https://npm.taobao.org/mirrors/sharp-libvips"
# 官方
yarn config delete registry
yarn config delete sharp_binary_host
yarn config delete sharp_libvips_binary_host

#yarn cache clean
yarn install
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
