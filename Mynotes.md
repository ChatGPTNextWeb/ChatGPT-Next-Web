# 1. Environment variables
Update Dockerfile by editing OPENAI_API_KEY and CODE:
- OPENAI_API_KEY: "xxx"
- CODE: "xxx"  // Optional

# 2. How to deploy

## 1). Create Azure Container Registry
Open [Azure Portal](https://portal.azure.com/#home), create a Container registry.

I have: [ChatMossContainerRegistry](https://portal.azure.com/#@xiaolinge360gmail.onmicrosoft.com/resource/subscriptions/900e34fe-4cd6-4fee-8583-080482d4d92f/resourceGroups/ResourceGroupXinglinYu/providers/Microsoft.ContainerRegistry/registries/ChatMossContainerRegistry/accessKey)

In Access keys, Enable `Admin user` to get `Username` and `password`

## 2). Build docker image
Usage:
```shell
docker build -t <ACR>.azurecr.io/<IMAGE NAME>:<TAG> .
docker login <ACR>.azurecr.io --username <USER> --password <PASSWORD>
docker push <ACR>.azurecr.io/<IMAGE NAME>:<TAG> 
``` 
so that
```shell
docker build -t ChatMossContainerRegistry.azurecr.io/next-web-image:v1.1.0 .
docker login ChatMossContainerRegistry.azurecr.io --username ChatMossContainerRegistry --password $password
docker push ChatMossContainerRegistry.azurecr.io/next-web-image:v1.1.0
``` 

## 3). Deploy image to Azure Web App
Open [Azure Portal](https://portal.azure.com/#home), Create an Azure Web App.

I have [zcareers](https://portal.azure.com/#@xiaolinge360gmail.onmicrosoft.com/resource/subscriptions/900e34fe-4cd6-4fee-8583-080482d4d92f/resourceGroups/ResourceGroupXinglinYu/providers/Microsoft.Web/sites/zcareers/appServices)

In `Deployment Center` tab, set `Azure Container Registry` as `Registry source`. 


# 3. Local Development
## 1). install nodejs and yarn first
```shell
npm install --global yarn
yarn --version
node -v
```

## 2). create a new `.env.local` file at project root, and place your api key into it:
```shell
OPENAI_API_KEY=<your api key here>
```

## 3). run
In `JavaScript Debug Terminal`, 
```
yarn install
yarn dev
```

# 4. Projoct analysis

## 1). main file
main file is scripts/fetch-prompts.mjs

## 2). mask role
under app/masks/cn.ts


# 4. Refrence
[Deploy to Azure Web App for Containers](https://learn.microsoft.com/en-us/azure/devops/pipelines/apps/cd/deploy-docker-webapp?view=azure-devops&tabs=python%2Cclassic)
