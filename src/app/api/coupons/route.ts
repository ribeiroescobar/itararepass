import { NextResponse } from "next/server";
import { getSessionFromCookies } from "@/lib/session";
import { dbQuery } from "@/lib/db";

export const runtime = "nodejs";

export async function GET() {
  const session = getSessionFromCookies();
  if (!session) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const result = await dbQuery(
    `SELECT coupon_id as "id", used, used_at as "usedAt"
     FROM user_coupons WHERE user_id = $1`,
    [session.sub]
  );

  return NextResponse.json({ coupons: result.rows });
}
