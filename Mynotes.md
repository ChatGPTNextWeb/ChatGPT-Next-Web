# 1. How to local develop

## 1). Clone code from github
```
git clone xxx
git checkout -b user_name/branch_name origin/zhixing
```

## 2). Install nodejs and yarn
```shell
npm install --global yarn
yarn --version
node -v
```

## 3). Update backend server address
Open `app/config/server.ts`, update `placeholder` value like
```ts
    config.zBotServiceUrl = "placeholder";
    config.speechSubscriptionKey = "placeholder";
```
where `placeholder` can be replaced, you can get its value from Azure Key Vault

## 3). Set up local develop environment -- TODO: not worked
Create a new `.env.local` file at project root, and place your api key into it:
```shell
OPENAI_API_KEY=<your api key here>
```
you can refer the `env.template` to set other env variables.

## 4). Run
From `Terminal -> New Terminal`, to open terminal window, 

and click `+`, to add a `JavaScript Debug Terminal` window, run command: 
```shell
yarn install
yarn dev
```

you should see portal in pop-up brower page.


# 2. How to deploy

## 1). Create Azure Container Registry
Open [Azure Portal](https://portal.azure.com/#home), create a Container registry.

I have: [ZCareersContainerRegistry](https://portal.azure.com/#@xinglinyuoutlook.onmicrosoft.com/resource/subscriptions/c58b3ecb-c919-4f67-a314-d9d69695de4d/resourceGroups/ZCareersResourceGroup/providers/Microsoft.ContainerRegistry/registries/ZCareersContainerRegistry/accessKey)

In `Access keys`, Enable `Admin user` to get `Username` and `password`

## 2). Build docker image
Usage:
```shell
docker build . -t <ACR>.azurecr.io/<IMAGE NAME>:<TAG>
docker login <ACR>.azurecr.io --username <USER> --password <PASSWORD>
docker push <ACR>.azurecr.io/<IMAGE NAME>:<TAG> 
``` 
so that
```shell
docker build . -t ZCareersContainerRegistry.azurecr.io/zbotportal-image:v1.0.0
docker push ZCareersContainerRegistry.azurecr.io/zbotportal-image:v1.0.0
``` 
if need login, using
```shell
az login
```
or 
```shell
docker login ZCareersContainerRegistry.azurecr.io --username ZCareersContainerRegistry --password $password
```

## 3). Deploy image to Azure Web App
Open [Azure Portal](https://portal.azure.com/#home), Create an Azure Web App.

I have [zcareers](https://portal.azure.com/#@xiaolinge360gmail.onmicrosoft.com/resource/subscriptions/900e34fe-4cd6-4fee-8583-080482d4d92f/resourceGroups/ResourceGroupXinglinYu/providers/Microsoft.Web/sites/zcareers/appServices)

In `Deployment Center` tab, set `Azure Container Registry` as `Registry source`. 

In `Configuration`, and these env variables:
  - `OPENAI_API_KEY`
  - `ZBotServiceUrl`: TBD


# 3. Projoct analysis

- main file: `scripts/fetch-prompts.mjs`
- mask role: `app/masks/cn.ts`
- user-settings: `app/user-setting/`
- backend client: `app/zbotservice/`

# 4. Refrence
[Deploy to Azure Web App for Containers](https://learn.microsoft.com/en-us/azure/devops/pipelines/apps/cd/deploy-docker-webapp?view=azure-devops&tabs=python%2Cclassic)
