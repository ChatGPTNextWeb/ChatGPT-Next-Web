# Vercel Usage Instructions

## How to Create a New Project
After forking this project from Github, you need to create a new Vercel project in Vercel to redeploy it. Follow these steps:

![vercel-create-1](./images/vercel/vercel-create-1.jpg)
1. Go to the Vercel console homepage;
2. Click "Add New";
3. Select "Project".

![vercel-create-2](./images/vercel/vercel-create-2.jpg)
1. In Import Git Repository, search for chatgpt-next-web;
2. Select the newly forked project and click Import.

![vercel-create-3](./images/vercel/vercel-create-3.jpg)
1. On the project configuration page, click Environment Variables to start configuring environment variables;
2. Add environment variables named OPENAI_API_KEY and CODE ([access password](https://github.com/ChatGPTNextWeb/ChatGPT-Next-Web/blob/main/docs/faq-en.md#what-is-the-environment-variable-code-is-it-necessary-to-set-it));
3. Fill in the corresponding values for the environment variables;
4. Click Add to confirm adding the environment variables;
5. Make sure you've added OPENAI_API_KEY, otherwise it won't work;
6. Click Deploy, complete the creation, and wait patiently for about 5 minutes for deployment to complete.

## How to Add a Custom Domain
[TODO]

## How to Change Environment Variables
![vercel-env-edit](./images/vercel/vercel-env-edit.jpg)
1. Go to the Vercel project internal console and click the Settings button at the top;
2. Click Environment Variables on the left;
3. Click the button on the right of an existing entry;
4. Select Edit to make changes, then save.

⚠️️ Note: Every time you modify environment variables, you need to [redeploy the project](#how-to-redeploy) to make the changes take effect!

## How to Redeploy
![vercel-redeploy](./images/vercel/vercel-redeploy.jpg)
1. Go to the Vercel project internal console and click the Deployments button at the top;
2. Select the button on the right of the topmost item in the list;
3. Click Redeploy to start redeployment.
