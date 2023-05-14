# Cloudflare Pages Deployment Guide

## How to create a new project
Fork this project on GitHub, then log in to dash.cloudflare.com and go to Pages.

1. Click "Create a project".
2. Choose "Connect to Git".
3. Connect Cloudflare Pages to your GitHub account.
4. Select the forked project.
5. Click "Begin setup".
6. For "Project name" and "Production branch", use the default values or change them as needed.
7. In "Build Settings", choose the "Framework presets" option and select "Next.js".
8. Do not use the default "Build command" due to a node:buffer bug. Instead, use the following command:
    ```
    npx https://prerelease-registry.devprod.cloudflare.dev/next-on-pages/runs/4930842298/npm-package-next-on-pages-230 --experimental-minify
    ```
9. For "Build output directory", use the default value and do not modify it.
10. Do not modify "Root Directory".
11. For "Environment variables", click ">" and then "Add variable". Fill in the following information:
    - `NODE_VERSION=20.1`
    - `NEXT_TELEMETRY_DISABLE=1`
    - `OPENAI_API_KEY=your_own_API_key`
    - `YARN_VERSION=1.22.19`
    - `PHP_VERSION=7.4`

    Optionally fill in the following based on your needs:

    - `CODE= Optional, access passwords, multiple passwords can be separated by commas`
    - `OPENAI_ORG_ID= Optional, specify the organization ID in OpenAI`
    - `HIDE_USER_API_KEY=1 Optional, do not allow users to enter their own API key`
    - `DISABLE_GPT4=1 Optional, do not allow users to use GPT-4`
    
12. Click "Save and Deploy".
13. Click "Cancel deployment" because you need to fill in Compatibility flags.
14. Go to "Build settings", "Functions", and find "Compatibility flags".
15. Fill in "nodejs_compat" for both "Configure Production compatibility flag" and "Configure Preview compatibility flag".
16. Go to "Deployments" and click "Retry deployment".
17. Enjoy.