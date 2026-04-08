import { NextResponse } from "next/server";
import { dbQuery } from "@/lib/db";
import { requireAdmin } from "@/lib/admin";

export const runtime = "nodejs";

export async function GET() {
  const admin = await requireAdmin();
  if (!admin.ok) {
    return NextResponse.json({ error: "Sem permissão." }, { status: admin.reason === "forbidden" ? 403 : 401 });
  }

  const result = await dbQuery(
    `SELECT id, user_id as "userId", user_name as "userName", spot_id as "spotId",
      timestamp, rating, insight
     FROM checkins
     ORDER BY timestamp DESC`
  );

  return NextResponse.json({ checkins: result.rows });
}
