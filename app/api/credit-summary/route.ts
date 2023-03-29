import { NextRequest } from "next/server";
export async function POST(req: NextRequest) {
    try {
      let apiKey = process.env.OPENAI_API_KEY;
      const userApiKey = req.headers.get("token");
      if (userApiKey) {
        apiKey = userApiKey;
      }
  
      const res = await fetch("https://api.openai.com/dashboard/billing/credit_grants", {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          method: "GET"
      });
      console.log(res.body)
      return new Response(res.body);
    } catch (error) {
      console.error("[TOKEN]", error);
    }
  }