import { NextResponse } from "next/server";
import { dbQuery } from "@/lib/db";
import { requireAdmin } from "@/lib/admin";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const admin = await requireAdmin();
  if (!admin.ok) {
    return NextResponse.json({ error: "Sem permissão." }, { status: admin.reason === "forbidden" ? 403 : 401 });
  }

  const { searchParams } = new URL(req.url);
  const limit = Number(searchParams.get("limit") || "50");

  const result = await dbQuery(
    `SELECT id, user_name as "userName", spot_id as "spotId", spot_name as "spotName",
      text, photo, rating, created_at as "timestamp"
     FROM comments ORDER BY created_at DESC LIMIT $1`,
    [Number.isFinite(limit) ? limit : 50]
  );

  return NextResponse.json({ comments: result.rows });
}
