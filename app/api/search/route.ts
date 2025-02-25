import { getServerSideConfig } from "@/app/config/server";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "../auth";
import { ModelProvider } from "@/app/constant";
import { tavily } from "@tavily/core";

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
    const tvly = tavily({ apiKey: tavilyApiKey });
    const response = await tvly.search(query, {
      maxResults: maxReturns,
    });

    return NextResponse.json(response);
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
