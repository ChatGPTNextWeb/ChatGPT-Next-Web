<div align="center">
<img src="./docs/images/head-cover.png" alt="icon"/>

<h1 align="center">NextChat (ChatGPT Next Web)</h1>





[web-url]: https://chatgpt.nextweb.fun
[download-url]: https://github.com/Yidadaa/ChatGPT-Next-Web/releases
[Web-image]: https://img.shields.io/badge/Web-PWA-orange?logo=microsoftedge
[Windows-image]: https://img.shields.io/badge/-Windows-blue?logo=windows
[MacOS-image]: https://img.shields.io/badge/-MacOS-black?logo=apple
[Linux-image]: https://img.shields.io/badge/-Linux-333?logo=ubuntu


![cover](./docs/images/cover.png)

</div>



## Access Password


This project provides limited access control. Please add an environment variable named `CODE` on the vercel environment variables page. The value should be passwords separated by comma like this:

```
code1,code2,code3
```

After adding or modifying this environment variable, please redeploy the project for the changes to take effect.

### `CODE` (optional)

Access password, separated by comma.

### `OPENAI_API_KEY` (required)

Your openai api key, join multiple api keys with comma.


## Requirements

NodeJS >= 18, Docker >= 20

## Development



Before starting development, you must create a new `.env.local` file at project root, and place your api key into it:

```
OPENAI_API_KEY=<your api key here>

# if you are not able to access openai service, use this BASE_URL
BASE_URL=https://chatgpt1.nextweb.fun/api/proxy
```

### Local Development

```shell
# 1. install nodejs and yarn first
# 2. config local env vars in `.env.local`
# 3. run
yarn install
yarn dev
```


## Screenshots

![Settings](./docs/images/settings.png)


## Check screen aspect ratio
+ 375 x 667
+ 414 x 896
+ 390 x 844 
+ 430 x 932 
+ 412 x 915
+ 360 x 740
+ 412 x 915
+ 768 x 1024
+ 820 x 1180
+ 1024 x 1366
+ 912 x 1368
+ 540 x 720 ( err)
+ 280 x 653 (err) 
+ 853 x 1280 
+ 412 x 914
+ 1024 x 600
+ 1280 x 800
+ 360 x 640
+ 600 x 1020  (err)
+ 360 x 640 
+ 320 x 658 (err)
+ 712 x 1138
+ 384 x 640
+ 360 x 640 
+ 600 x 960  (err)
+ 393 x 786
+ 411 x 731
+ 360 x 640 
+ 375 x 812
+ 412 x 982 




