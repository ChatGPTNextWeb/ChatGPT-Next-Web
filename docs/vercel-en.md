## Vercel Usage Instructions

## How to Create a New Project

After you fork this project from Github, you need to create a new Vercel project to redeploy it. Please follow the steps below:

![vercel-create-1](./images/vercel/vercel-create-1.jpg)

1. Go to the Vercel dashboard.
2. Click "Add New".
3. Select "Project".

![vercel-create-2](./images/vercel/vercel-create-2.jpg)

1. In the "Import Git Repository" section, search for "chatgpt-next-web".
2. Select the newly forked project and click "Import".

![vercel-create-3](./images/vercel/vercel-create-3.jpg)

1. On the project configuration page, click "Environment Variables" to start configuring environment variables.
2. Add environment variables named "OPENAI_API_KEY" and "CODE" ([Access Password](https://github.com/Yidadaa/ChatGPT-Next-Web/blob/357296986609c14de10bf210871d30e2f67a8784/docs/faq-cn.md#%E7%8E%AF%E5%A2%83%E5%8F%98%E9%87%8F-code-%E6%98%AF%E4%BB%80%E4%B9%88%E5%BF%85%E9%A1%BB%E8%AE%BE%E7%BD%AE%E5%90%97)) respectively.
3. Fill in the corresponding values for the environment variables.
4. Click "Add" to confirm adding the environment variables.
5. Make sure you have added the "OPENAI_API_KEY". Otherwise, it will not work.   
6. Click "Deploy", the creation is complete, please wait patiently for about 5 minutes for the deployment to complete.

## How to Add a Custom Domain

[TODO]

## How to Change Environment Variables

![vercel-env-edit](./images/vercel/vercel-env-edit.jpg)

1. Go to the Vercel project dashboard and click the "Settings" button at the top.
2. Click "Environment Variables" on the left.
3. Click the button to the right of the existing entry.
4. Select "Edit" to edit, and then save.

⚠️ Note: Every time you modify the environment variables, you need to [redeploy the project](#how-to-redeploy) for the changes to take effect!

## How to Redeploy

![vercel-redeploy](./images/vercel/vercel-redeploy.jpg)

1. Go to the Vercel project dashboard and click the "Deployments" button at the top.
2. Select the button to the right of the top item in the list.
3. Click "Redeploy" to redeploy.