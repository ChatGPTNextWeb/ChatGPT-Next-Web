# Frequently Asked Questions

## How to get help quickly?

1. Ask ChatGPT / Bing / Baidu / Google, etc.
2. Ask online friends. Please provide background information and a detailed description of the problem. High-quality questions are more likely to get useful answers.

# Deployment Related Questions

For detailed tutorials on various deployment methods, please refer to: [link](https://rptzik3toh.feishu.cn/docx/XtrdduHwXoSCGIxeFLlcEPsdn8b)  

## Why does the Docker deployment version always prompt for updates

The Docker version is equivalent to the stable version, and the latest Docker is always consistent with the latest release version. Currently, our release frequency is once every one to two days, so the Docker version will always be one to two days behind the latest commit, which is expected.

## How to deploy on Vercel

1. Register a Github account and fork this project.
2. Register Vercel (mobile phone verification required, Chinese number can be used), and connect your Github account.
3. Create a new project on Vercel, select the project you forked on Github, fill in the required environment variables, and start deploying. After deployment, you can access your project through the domain provided by Vercel. (Requires proxy in mainland China)

- If you need to access it directly in China: At your DNS provider, add a CNAME record for the domain name, pointing to cname.vercel-dns.com. Then set up your domain access on Vercel.

## How to modify Vercel environment variables

- Enter the Vercel console page;
- Select your chatgpt-next-web project;
- Click on the Settings option at the top of the page;
- Find the Environment Variables option in the sidebar;
- Modify the corresponding values as needed.

## What is the environment variable CODE? Is it necessary to set it?

This is your custom access password, you can choose:

1. Do not set it, delete the environment variable. Be cautious: anyone can access your project at this time.
2. When deploying the project, set the environment variable CODE (supports multiple passwords, separated by commas). After setting the access password, users need to enter the access password in the settings page to use it. See [related instructions](https://github.com/Yidadaa/ChatGPT-Next-Web#access-password)

## Why doesn't the version I deployed have streaming response

> Related discussion: [#386](https://github.com/Yidadaa/ChatGPT-Next-Web/issues/386)

If you use nginx reverse proxy, you need to add the following code to the configuration file:

```
# No caching, support streaming output
proxy_cache off;  # Turn off caching
proxy_buffering off;  # Turn off proxy buffering
chunked_transfer_encoding on;  # Turn on chunked transfer encoding
tcp_nopush on;  # Turn on TCP NOPUSH option, disable Nagle algorithm
tcp_nodelay on;  # Turn on TCP NODELAY option, disable delay ACK algorithm
keepalive_timeout 300;  # Set keep-alive timeout to 65 seconds
```

If you are deploying on netlify, this issue is still waiting to be resolved, please be patient.

## I've deployed, but it's not accessible

Please check and troubleshoot the following issues:

- Is the service started?
- Is the port correctly mapped?
- Is the firewall port open?
- Is the route to the server okay?
- Is the domain name resolved correctly?

## What is a proxy and how do I use it?

Due to OpenAI's IP restrictions, China and some other countries/regions cannot directly connect to the OpenAI API and need to use a proxy. You can use a proxy server (forward proxy), or a pre-configured OpenAI API reverse proxy.

- Example of forward proxy: scientific internet access VPN. In the case of docker deployment, set the environment variable HTTP_PROXY to your proxy address (for example: 10.10.10.10:8002).
- Example of reverse proxy: you can use someone else's built-in proxy address, or set it up through Cloudflare for free. Set the project environment variable BASE_URL to your proxy address.

## Can I deploy on a domestic server?

You can, but you need to solve the following problems:

- You need a proxy to connect to websites like github and openAI;
- If you set up domain name resolution on a domestic server, you need to go through the process of domain name registration;
- Domestic policies restrict proxy access to foreign networks/ChatGPT related applications, which may lead to blocking.

## Why do I get network errors after Docker deployment?

See discussion: [link](https://github.com/Yidadaa/ChatGPT-Next-Web/issues/1569) 

# Usage Related Issues

## Why does it keep prompting "Something went wrong, please try again later"?

There could be many reasons. Please troubleshoot them in order:

- Please check if your code version is the latest version. Update to the latest version and try again;
- Please check if your api key is set correctly. The environment variable name must be in all uppercase with an underscore;
- Please check if your api key is valid;
- If you have gone through the above steps and still cannot determine the problem, please submit a new issue in the issue section and attach the runtime log of vercel or the log of docker running.

## Why is the ChatGPT reply garbled?

In the settings interface - model settings section, there is an item called `temperature`. If this value is greater than 1, it may cause the reply to be garbled. Setting it back to 1 or less will solve the issue.

## When using it, it prompts "Unauthorized state, please enter the access code in the settings page"?

The project has set an access password through the environment variable CODE. The first time you use it, you need to go to the settings and enter the access code to use it.

## When using it, it prompts "You exceeded your current quota, ..."

There is a problem with the API KEY. Insufficient balance.

## When using it, it prompts "Error: Loading CSS chunk xxx failed..."

In order to reduce the white screen time on the first screen, chunk compilation is enabled by default. The technical principle is as follows:

- [Next.js Lazy Loading](https://nextjs.org/docs/app/building-your-application/optimizing/lazy-loading)  
- [Stack Overflow: Disable Chunk Code Splitting](https://stackoverflow.com/questions/55993890/how-can-i-disable-chunkcode-splitting-with-webpack4)  
- [Vercel Issue 38507](https://github.com/vercel/next.js/issues/38507)  
- [Stack Overflow: Disable Chunk Code Splitting](https://stackoverflow.com/questions/55993890/how-can-i-disable-chunkcode-splitting-with-webpack4)  

However, Next.js's compatibility is relatively poor, which can cause this error on older browsers. You can turn off chunk compilation during compilation.

For the Vercel platform, add `DISABLE_CHUNK=1` to the environment variables and redeploy.
For self-compiled deployment projects, use `DISABLE_CHUNK=1 yarn build` to build during construction.
For Docker users, chunk compilation is completed during Docker packaging, so this feature is not supported for the time being.

Note: If you disable this feature, users will load all resources on the first visit to the website. If the user's network condition is poor, it may cause a long white screen, which will affect the user experience. Please consider this carefully.

## When using it, it prompts "NotFoundError: Failed to execute 'removeChild' on 'Node': The node...."
Please disable the browser's own automatic translation function and disable all automatic translation plugins.

# Network Service Related Questions

## What is Cloudflare?

Cloudflare (CF) is a network service provider offering CDN, domain management, static page hosting, edge computing function deployment, and more. Common use cases: purchase and/or host your domain (resolution, dynamic domain, etc.), apply CDN to your server (can hide IP to avoid being blocked), deploy websites (CF Pages). CF offers most services for free.

## What is Vercel?

Vercel is a global cloud platform designed to help developers build and deploy modern web applications more quickly. This project and many web applications can be deployed on Vercel with a single click for free. No need to understand code, Linux, have a server, pay, or set up an OpenAI API proxy. The downside is that you need to bind a domain name to access it without restrictions in China.

## How to obtain a domain name?

1. Register with a domain provider, such as Namesilo (supports Alipay) or Cloudflare for international providers, and Wanwang for domestic providers in China.
2. Free domain name providers: eu.org (second-level domain), etc.
3. Ask friends for a free second-level domain.

## How to obtain a server

- Examples of international server providers: Amazon Web Services, Google Cloud, Vultr, Bandwagon, Hostdare, etc.
  International server considerations: Server lines affect access speed in China; CN2 GIA and CN2 lines are recommended. If the server has difficulty accessing in China (serious packet loss, etc.), you can try using a CDN (from providers like Cloudflare).
- Domestic server providers: Alibaba Cloud, Tencent, etc.
  Domestic server considerations: Domain name resolution requires filing; domestic server bandwidth is relatively expensive; accessing foreign websites (Github, OpenAI, etc.) requires a proxy.

# OpenAI-related Questions

## How to register an OpenAI account?

Go to chat.openai.com to register. You will need:

- A good VPN (OpenAI only allows native IP addresses of supported regions)
- A supported email (e.g., Gmail or a company/school email, not Outlook or QQ email)
- A way to receive SMS verification (e.g., SMS-activate website)

## How to activate OpenAI API? How to check API balance?

Official website (requires VPN): https://platform.openai.com/account/usage
Some users have set up a proxy to check the balance without a VPN; ask online friends for access. Please verify the source is reliable to avoid API Key leakage.

## Why doesn't my new OpenAI account have an API balance?

(Updated April 6th) Newly registered accounts usually display API balance within 24 hours. New accounts are currently given a $5 balance.

## How to recharge OpenAI API?

OpenAI only accepts credit cards from designated regions (Chinese credit cards cannot be used). If the credit cards from your region is not supported, some options include:

1. Depay virtual credit card
2. Apply for a foreign credit card
3. Find someone online to top up

## How to use the Azure OpenAI interface

Please refer to: [#371](https://github.com/Yidadaa/ChatGPT-Next-Web/issues/371)

## Why is my Token consumed so fast?

> Related discussion: [#518](https://github.com/Yidadaa/ChatGPT-Next-Web/issues/518)

- If you have GPT-4 access and use GPT-4 API regularly, your bill will increase rapidly since GPT-4 pricing is about 15 times higher than GPT-3.5;
- If you are using GPT-3.5 and not using it frequently, but still find your bill increasing fast, please troubleshoot immediately using these steps:
  - Check your API key consumption record on the OpenAI website; if your token is consumed every hour and each time consumes tens of thousands of tokens, your key must have been leaked. Please delete it and regenerate it immediately. **Do not check your balance on random websites.**
  - If your password is short, such as 5 characters or fewer, the cost of brute-forcing is very low. It is recommended to search docker logs to confirm whether someone has tried a large number of password combinations. Keyword: got access code
- By following these two methods, you can locate the reason for your token's rapid consumption:
  - If the OpenAI consumption record is abnormal but the Docker log has no issues, it means your API key has been leaked;
  - If the Docker log shows a large number of got access code brute-force attempts, your password has been cracked.
| Model | User input (Prompt) billing | Model output (Completion) billing | Maximum number of tokens per interaction |
|----|----|----|----|
| gpt-3.5-turbo | $0.0005 / 1k tokens | $0.0015 / 1k tokens | 16384 |
| gpt-4 | $0.030 / 1k tokens | $0.060 / 1k tokens | 8192 |
| gpt-4-turbo | $0.010 / 1k tokens | $0.030 / 1k tokens | 128000 |
| gpt-4o | $0.005 / 1k tokens | $0.015 / 1k tokens | 128000 |