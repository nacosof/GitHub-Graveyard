import { NextResponse } from "next/server";
import { z } from "zod";

import { discoverDeadCandidates } from "@/server/github/discover";

const QuerySchema = z.object({
  q: z.string().optional(),
  perPage: z.coerce.number().int().min(1).max(20).optional(),
  page: z.coerce.number().int().min(1).max(50).optional(),
});

export async function GET(req: Request) {
  const url = new URL(req.url);
  const parsed = QuerySchema.safeParse({
    q: url.searchParams.get("q") ?? undefined,
    perPage: url.searchParams.get("perPage") ?? undefined,
    page: url.searchParams.get("page") ?? undefined,
  });

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid query" }, { status: 400 });
  }

  try {
    const res = await discoverDeadCandidates({
      query: parsed.data.q,
      perPage: parsed.data.perPage,
      page: parsed.data.page,
    });
    return NextResponse.json(res);
  } catch (err) {
    const status =
      typeof err === "object" && err && "status" in err && typeof (err as any).status === "number"
        ? (err as any).status
        : 500;

    const message = err instanceof Error ? err.message : "Unknown error";

    if (message.toLowerCase().includes("quota exhausted")) {
      return NextResponse.json(
        {
          error:
            "GitHub Search API quota exhausted. Add GITHUB_TOKEN in .env.local (see .env.example) and retry later.",
        },
        { status: 429 },
      );
    }

    if (status === 403 || status === 429) {
      return NextResponse.json(
        {
          error:
            "GitHub API rate limit. Add GITHUB_TOKEN in .env.local (see .env.example) and restart dev server.",
        },
        { status },
      );
    }

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
