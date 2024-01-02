# Frequently Asked Questions

## How to get help quickly?

1. Ask ChatGPT / Bing / Baidu / Google, etc.
2. Ask online friends. Please provide background information and a detailed description of the problem. High-quality questions are more likely to get useful answers.

# Deployment Related Questions

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

## You may encounter an "Error: Loading CSS chunk xxx failed..."

To reduce the initial white screen time, Next.js enables chunking by default. You can find the technical details here:

- https://nextjs.org/docs/app/building-your-application/optimizing/lazy-loading
- https://stackoverflow.com/questions/55993890/how-can-i-disable-chunkcode-splitting-with-webpack4
- https://github.com/vercel/next.js/issues/38507
- https://stackoverflow.com/questions/55993890/how-can-i-disable-chunkcode-splitting-with-webpack4

However, Next.js has limited compatibility with older browsers, which can result in this error.

You can disable chunking during building.

For Vercel platform, you can add `DISABLE_CHUNK=1` to the environment variables and redeploy.
For self-deployed projects, you can use `DISABLE_CHUNK=1 yarn build` during the build process.
For Docker users, as the build is already completed during packaging, disabling this feature is currently not supported.

Note that when you disable this feature, all resources will be loaded on the user's first visit. This may result in a longer white screen time if the user has a poor network connection, affecting the user experience. Please consider this when making a decision.

# Usage Related Questions

## Why does it always prompt "An error occurred, please try again later"

There could be many reasons, please check the following in order:

- First, check if your code version is the latest version, update to the latest version and try again;
- Check if the api key is set correctly, the environment variable name must be uppercase with underscores;
- Check if the api key is available;
- If you still cannot determine the problem after going through the above steps, please submit a new issue in the issue area and attach the runtime log of vercel or the log of docker runtime.

## Why does ChatGPT's reply get garbled

In the settings page - model settings, there is an item called `temperature`. If this value is greater than 1, it may cause garbled replies. Adjust it back to within 1.

## It prompts "Now it's unauthorized, please enter the access password on the settings page" when using?

The project has set an access password through the environment variable CODE. When using it for the first time, you need to go to settings and enter the access code to use.

## It prompts "You exceeded your current quota, ..." when using?

The API KEY is problematic. Insufficient balance.

## What is a proxy and how to use it?

Due to IP restrictions of OpenAI, China and some other countries/regions cannot directly connect to OpenAI API and need to go through a proxy. You can use a proxy server (forward proxy) or a pre-configured OpenAI API reverse proxy.

- Forward proxy example: VPN ladder. In the case of docker deployment, set the environment variable HTTP_PROXY to your proxy address (http://address:port).
- Reverse proxy example: You can use someone else's proxy address or set it up for free through Cloudflare. Set the project environment variable BASE_URL to your proxy address.

## Can I deploy it on a server in China?

It is possible but there are issues to be addressed:

- Proxy is required to connect to websites such as Github and OpenAI;
- Domain name resolution requires filing for servers in China;
- Chinese policy restricts proxy access to foreign websites/ChatGPT-related applications, which may be blocked.

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

## How to access the GPT-4 API?

(Updated April 6th) Access to the GPT-4 API requires a separate application. Go to the following address and enter your information to join the waitlist (prepare your OpenAI organization ID): https://openai.com/waitlist/gpt-4-api
Wait for email updates afterwards.

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
