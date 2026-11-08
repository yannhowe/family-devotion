import { io } from "next/cache";
import { pickVestaboardMessage } from "@/db/vestaboard";

export async function GET(request: Request) {
  await io();
  const url = new URL(request.url);
  try {
    const result = await pickVestaboardMessage({
      topic: url.searchParams.get("topic") ?? undefined,
      reference: url.searchParams.get("reference") ?? undefined,
      size: url.searchParams.get("size") ?? undefined,
    });
    if (!result.ok) {
      return Response.json({ error: result.error }, { status: 404 });
    }
    return Response.json(result.message);
  } catch {
    return Response.json({ error: "The library could not be opened." }, { status: 503 });
  }
}
