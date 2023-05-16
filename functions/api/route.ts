export const onRequest: PagesFunction<{}> = async (context) => {
  // context.request.url
  return new Response(context.request.url);
};
