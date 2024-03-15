<div align="center">
<img src="./docs/images/icon.svg" alt="icon"/>

<h1 align="center">Avvia Intelligence - Knowledge AI Chat</h1>

![cover](./docs/images/cover.png)

</div>

## Features

- Privacy first, all data stored locally in the browser
- Markdown support: LaTex, mermaid, code highlight, etc.
- Responsive design, dark mode and PWA
- Fast first screen loading speed (~100kb), support streaming response
- New in v2: create, share and debug your chat tools with prompt templates (mask)
- Awesome prompts powered by [awesome-chatgpt-prompts](https://github.com/f/awesome-chatgpt-prompts)
- Automatically compresses chat history to support long conversations while also saving your tokens
- I18n: English, Deutsch

## Get Started

1. Get [OpenAI API Key](https://platform.openai.com/account/api-keys);
2. Install yarn
3. run in shell: <code>yarn install</code>
4. start with <code>yarn run dev</code>
5. Enjoy :)

## FAQ

[English > FAQ](./docs/faq-en.md)

## Access Password

This project provides limited access control. Please add an environment variable named `CODE` on the vercel environment variables page. The value should be passwords separated by comma like this:

```
code1,code2,code3
```

After adding or modifying this environment variable, please redeploy the project for the changes to take effect.

## Environment Variables

### `OPENAI_API_KEY` (required)

Your openai or Avvia Intelligence api key.

### `CODE` (optional)

Access password, separated by comma.

### `BASE_URL` (optional)

> Default: `https://api.openai.com`

> Examples: `http://your-openai-proxy.com`

Override openai api request base url.

### `OPENAI_ORG_ID` (optional)

Specify OpenAI organization ID.

### `HIDE_USER_API_KEY` (optional)

> Default: Empty

If you do not want users to input their own API key, set this value to 1.

### `DISABLE_GPT4` (optional)

> Default: Empty

If you do not want users to use GPT-4, set this value to 1.

### `HIDE_BALANCE_QUERY` (optional)

> Default: Empty

If you do not want users to query balance, set this value to 1.

## Requirements

NodeJS >= 18, Docker >= 20

### Local Development

```shell
# 1. install nodejs and yarn first
# 2. config local env vars in `.env.local`
# 3. run
yarn install
yarn dev
```

### Build Docker Image

Docker credentials can be found in the keypass file.

```shell
# enable multi plattform build
docker buildx create --use
export DOCKER_CLI_EXPERIMENTAL=enabled

# check that the build instance is running
docker buildx inspect --bootstrap

# build and push image
docker buildx build --platform linux/amd64,linux/arm64 -t avviaintelligence/knowledgeai-chat:<version> .
docker push avviaintelligence/knowledgeai-chat:<version>
```


## Deployment

### Docker (Recommended)

```shell
docker pull avviaintelligence/knowledgeai-chat

docker run -d -p 80:3000 \
   -e OPENAI_API_KEY="your Avvia Intelligence API Key" \
   -e BASE_URL="url of Avvia Intelligence OpenAI endpoint, e.g. https://server/openai" \
   -e NEXTAUTH_URL="url where the app is hosted, e.g. https://example:3000" \
   -e OKTA_OAUTH2_CLIENT_ID "okta client id" \
   -e OKTA_OAUTH2_CLIENT_SECRET "okta secret" \
   avviaintelligence/knowledgeai-chat
```

## Translation

If you want to add a new translation, read this [document](./docs/translation.md).


## LICENSE

[MIT](https://opensource.org/license/mit/)
