# Cloudflare Pages Deployment Guide

## How to create a new project

Fork this project on GitHub, then log in to dash.cloudflare.com and go to Workers & Pages.

1. Click "Create application", then select "Pages" tab.
2. Choose "Connect to Git".
3. Connect Cloudflare Pages to your GitHub account.
4. Select the forked project.
5. Click "Begin setup".
6. For "Project name" and "Production branch", use the default values or change them as needed.
7. In "Build Settings", choose the "Framework presets" option and select "Next.js".
8. Do not change the default command which shown as following:
   ```
   npx @cloudflare/next-on-pages@1
   ```
9. For "Build output directory", use the default value and do not modify it.
10. Do not modify "Root Directory".
11. For "Environment variables", click ">" and then "Add variable". Fill in the following information:

    - `NODE_VERSION=22`
    - `NEXT_TELEMETRY_DISABLE=1`
    - `OPENAI_API_KEY=your_own_API_key`
    - `YARN_VERSION=1`

    Optionally fill in the following based on your needs:

    - `CODE= Optional, access passwords, multiple passwords can be separated by commas`
    - `OPENAI_ORG_ID= Optional, specify the organization ID in OpenAI`
    - `HIDE_USER_API_KEY=1 Optional, do not allow users to enter their own API key`
    - `DISABLE_GPT4=1 Optional, do not allow users to use GPT-4`
    - `ENABLE_BALANCE_QUERY=1 Optional, allow users to query balance`
    - `DISABLE_FAST_LINK=1 Optional, disable parse settings from url`
    - `OPENAI_SB=1 Optional，use the third-party OpenAI-SB API`

12. Click "Save and Deploy".
13. Click "Cancel deployment" because you need to fill in Compatibility flags.
14. Go to "Build settings", "Functions", and find "Compatibility flags".
15. Fill in "nodejs_compat" for both "Configure Production compatibility flag" and "Configure Preview compatibility flag".
16. Go to "Deployments" and click "Retry deployment".
17. Enjoy.
