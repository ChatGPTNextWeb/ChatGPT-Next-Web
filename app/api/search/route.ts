import { getServerSideConfig } from "@/app/config/server";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "../auth";
import { ModelProvider } from "@/app/constant";

const serverConfig = getServerSideConfig();

async function handle(req: NextRequest) {
  const authResult = auth(req, ModelProvider.GPT);
  if (authResult.error) {
    return NextResponse.json(authResult, {
      status: 401,
    });
  }

  try {
    const tavilyApiKey = serverConfig.tavilyApiKey;
    const maxReturns = serverConfig.tavilyMaxReturns
      ? parseInt(serverConfig.tavilyMaxReturns, 10)
      : 10;

    if (!tavilyApiKey) {
      return NextResponse.json(
        {
          error: true,
          message: "Tavily API key not configured",
        },
        {
          status: 401,
        },
      );
    }

    const body = await req.json();
    const { query } = body;

    if (!query) {
      return NextResponse.json(
        {
          error: true,
          message: "Search query is required",
        },
        {
          status: 400,
        },
      );
    }
    const response = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${tavilyApiKey}`,
      },
      body: JSON.stringify({
        query: query,
        max_results: maxReturns,
      }),
    });

    if (!response.ok) {
      throw new Error(
        `Tavily API request failed with status ${response.status}`,
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("[Tavily] search error:", error);
    return NextResponse.json(
      {
        error: true,
        message: "Failed to process search request",
      },
      {
        status: 500,
      },
    );
  }
}

export const POST = handle;

export const runtime = "edge";
