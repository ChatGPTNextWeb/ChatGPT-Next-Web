export function cloudflareAIGatewayUrl(fetchUrl: string) {
  // rebuild fetchUrl, if using cloudflare ai gateway
  // document: https://developers.cloudflare.com/ai-gateway/providers/openai/

  const paths = fetchUrl.split('/');
  if (paths[2] === 'gateway.ai.cloudflare.com') {
    // is cloudflare.com ai gateway
    // https://gateway.ai.cloudflare.com/v1/{account_id}/{gateway_id}/azure-openai/{resource_name}/{deployment_name}/chat/completions?api-version=2023-05-15'
    if (paths[6] === 'azure-openai') {
      // is azure gateway
      return paths.slice(0, 8).concat(paths.slice(-3)).join('/'); // rebuild ai gateway azure_url
    }
    // https://gateway.ai.cloudflare.com/v1/{account_id}/{gateway_id}/openai/chat/completions
    if (paths[6] === 'openai') {
      // is openai gateway
      return paths.slice(0, 7).concat(paths.slice(-2)).join('/'); // rebuild ai gateway openai_url
    }
    // https://gateway.ai.cloudflare.com/v1/{account_id}/{gateway_id}/anthropic/v1/messages \
    if (paths[6] === 'anthropic') {
      // is anthropic gateway
      return paths.slice(0, 7).concat(paths.slice(-2)).join('/'); // rebuild ai gateway anthropic_url
    }
    // TODO: Amazon Bedrock, Groq, HuggingFace...
  }
  return fetchUrl;
}
