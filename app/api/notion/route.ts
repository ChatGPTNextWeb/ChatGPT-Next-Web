import { Client } from "@notionhq/client";
import { NextRequest, NextResponse } from "next/server";
import { markdownToBlocks } from "@tryfabric/martian";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const { notionIntegrate, database_id, topic, mdText } = JSON.parse(body);

  if (!(notionIntegrate && database_id && topic && mdText))
    return NextResponse.json({
      error:
        "Request body must contains notionIntegrateToken and notionDatabaseID",
    });

  const notionService = new Client({
    auth: notionIntegrate,
  });

  const blocks = markdownToBlocks(mdText);
  console.log(blocks);

  const res = await notionService.pages.create({
    parent: {
      database_id,
    },
    properties: {
      Name: {
        title: [
          {
            type: "text",
            text: {
              content: topic,
              link: null,
            },
            plain_text: topic,
          },
        ] as any,
      },
    },
    children: blocks as any,
  });
  return NextResponse.json(res);
}
