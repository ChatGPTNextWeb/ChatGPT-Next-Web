export const onRequest: PagesFunction<any> = async (context) => {
  return new Response("hello world");
};
