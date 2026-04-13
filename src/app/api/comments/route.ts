import { NextResponse } from "next/server";
import { getSessionFromCookies } from "@/lib/session";
import { dbQuery } from "@/lib/db";
import { z } from "zod";

export const runtime = "nodejs";

const createSchema = z.object({
  spotId: z.string().min(1),
  spotName: z.string().optional(),
  text: z.string().optional(),
  photo: z.string().nullable().optional(),
  rating: z.number().int().min(0).max(5).optional(),
});

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const spotId = searchParams.get("spotId");
  if (!spotId) {
    return NextResponse.json({ error: "spotId é obrigatório." }, { status: 400 });
  }

  const result = await dbQuery(
    `SELECT id, user_name as "userName", spot_id as "spotId", spot_name as "spotName",
      text, photo, rating, created_at as "timestamp"
     FROM comments WHERE spot_id = $1
     ORDER BY created_at DESC`,
    [spotId]
  );

  return NextResponse.json({ comments: result.rows });
}

export async function POST(req: Request) {
  const session = await getSessionFromCookies();
  if (!session) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
  }

  const { spotId, spotName, text, photo, rating } = parsed.data;

  const userRes = await dbQuery<{ name: string }>("SELECT name FROM users WHERE id = $1", [session.sub]);
  const userName = userRes.rows[0]?.name ?? "Visitante";

  const result = await dbQuery(
    `INSERT INTO comments (user_id, spot_id, spot_name, text, photo, rating, user_name)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING id, user_name as "userName", spot_id as "spotId", spot_name as "spotName",
      text, photo, rating, created_at as "timestamp"`,
    [
      session.sub,
      spotId,
      spotName ?? null,
      text ?? null,
      photo ?? null,
      typeof rating === "number" ? rating : null,
      userName,
    ]
  );

  return NextResponse.json({ comment: result.rows[0] });
}

