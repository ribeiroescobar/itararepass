import { NextResponse } from "next/server";
import { getSessionFromCookies } from "@/lib/session";
import { dbQuery } from "@/lib/db";
import { z } from "zod";

export const runtime = "nodejs";

const createSchema = z.object({
  spotId: z.string().min(1),
  insight: z.string().optional(),
  language: z.string().optional(),
  rating: z.number().int().min(0).max(5).optional(),
});

export async function GET() {
  const session = getSessionFromCookies();
  if (!session) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const result = await dbQuery(
    `SELECT spot_id as "spotId", timestamp as "timestamp", insight, language, rating
     FROM checkins WHERE user_id = $1 ORDER BY timestamp DESC`,
    [session.sub]
  );

  return NextResponse.json({ checkins: result.rows });
}

export async function POST(req: Request) {
  const session = getSessionFromCookies();
  if (!session) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
  }

  const { spotId, insight, language, rating } = parsed.data;

  const userRes = await dbQuery<{ name: string }>("SELECT name FROM users WHERE id = $1", [session.sub]);
  const userName = userRes.rows[0]?.name ?? "Visitante";

  await dbQuery(
    `INSERT INTO checkins (user_id, spot_id, insight, language, rating, user_name)
     VALUES ($1, $2, $3, $4, $5, $6)
     ON CONFLICT (user_id, spot_id)
     DO UPDATE SET
       insight = COALESCE(EXCLUDED.insight, checkins.insight),
       language = COALESCE(EXCLUDED.language, checkins.language),
       rating = COALESCE(EXCLUDED.rating, checkins.rating),
       user_name = COALESCE(EXCLUDED.user_name, checkins.user_name),
       timestamp = now()`,
    [
      session.sub,
      spotId,
      insight ?? null,
      language ?? null,
      typeof rating === "number" ? rating : null,
      userName,
    ]
  );

  return NextResponse.json({ ok: true });
}
