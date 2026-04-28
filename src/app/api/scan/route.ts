import { NextResponse } from "next/server";
import { z } from "zod";

import { scanRepo } from "@/server/github/scanRepo";

const QuerySchema = z.object({
  repo: z.string().min(1),
});

export async function GET(req: Request) {
  const url = new URL(req.url);
  const parsed = QuerySchema.safeParse({
    repo: url.searchParams.get("repo"),
  });

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Invalid query. Expected ?repo=owner/repo",
      },
      { status: 400 },
    );
  }

  try {
    const result = await scanRepo(parsed.data.repo);
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    const status =
      typeof err === "object" && err && "status" in err && typeof (err as any).status === "number"
        ? (err as any).status
        : 500;

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
