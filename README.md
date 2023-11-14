<div align="center">
<h1 align="center">VariantGPT Web UI</h1>

Chat Application using GPT in Azure Open AI Service

</div>

ChatGPT alternative behind authentication for internal use for Variant.

Hosted solution on Azure on European servers. Login using Azure AD. No prompts
are tracked or stored. Microsoft retains data for 30 days for
[moderation purposes](https://learn.microsoft.com/en-us/legal/cognitive-services/openai/data-privacy#how-is-data-retained-and-what-customer-controls-are-available)
in the same server region.

Client is hosted on Vercel servers in Paris with SSL communication.

## Get Started

### Environment Variables

See [.env.example](./.env.example)

### Local Development

1. Install latest nodejs and yarn.
2. Install required package: `yarn install`
3. Run development environment
   - create a new file named `.env.local` in the project root directory to
     define necessary environment variables
   - start developing: `yarn dev`

### Deployment

Build and run: `yarn build && yarn start`

## Credits

This repo is forked from https://github.com/linjungz/azure-chatgpt-ui which
again is forked from https://github.com/Yidadaa/ChatGPT-Next-Web.

Licensed as Anti-996, which is based on MIT.
