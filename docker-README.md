## 使用docker，运行ChatGPT Next Web

```bash
docker run -d -p 3000:3000 \
  -e OPENAI_API_KEY="" \
  -e CODE="" \
  --name chatgpt_next_web \
  yidadaa/chatgpt-next-web
```


## 更新ChatGPT Next Web

从dockerhub更新ChatGPT Next Web
```bash
docker pull yidadaa/chatgpt-next-web
```

## 本地构建ChatGPT Next Web

如何使用docker，在本地构建ChatGPT Next Web的镜像

### 普通构建
```bash
docker build -t yidadaa/chatgpt-next-web .
```

### 参数级构建
```bash
docker build -t yidadaa/chatgpt-next-web \
  --build-arg OPENAI_API_KEY=$(OPENAI_API_KEY) \
  --build-arg CODE=$(CODE) \
  .
```


## 使用docker compose构建
```bash
docker compose build
```


## 使用docker composey运行

修改`docker-compose.env`的环境变量，再执行

```bash
docker compose up -d
```
