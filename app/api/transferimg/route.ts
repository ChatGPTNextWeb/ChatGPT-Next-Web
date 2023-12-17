import { NextRequest, NextResponse } from "next/server";



async function handle(
  req: NextRequest,
  { params }: { params: { path: string[] } },
) {
    let payload;

    try {
      payload = await new NextResponse(req.body).json();
    } catch {
      return NextResponse.json({ error: "invalid JSON" }, { status: 400 }); 
    }
  
    const imageUrl = payload.imageUrl;
  
    if (!imageUrl) {
      return new NextResponse(JSON.stringify({ error: 'No URL provided', status: 'NotFound' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  
    try {
      const response = await fetch(imageUrl);
      if (!response.ok) {
        throw new Error(`Fetching image failed with status: ${response.status}`);
      }
      const arrayBuffer = await response.arrayBuffer();
  
      const binaryString = new Uint8Array(arrayBuffer).reduce((acc, byte) => acc + String.fromCharCode(byte), '');

      const base64 = btoa(binaryString);

      const nextResponse = new NextResponse(JSON.stringify({ newImageUrl: `data:image/jpeg;base64,${base64}` }), {
        status: 200,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });

  
      return nextResponse;
    } catch (error) {
      return new NextResponse(JSON.stringify({ error: 'Unable to process image', status: 'ServerError' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
}

export const GET = handle;
export const POST = handle;

export const runtime = "edge";
