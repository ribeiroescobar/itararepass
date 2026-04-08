import { NextResponse } from "next/server";
import { getSessionFromCookies } from "@/lib/session";
import { dbQuery } from "@/lib/db";
import { z } from "zod";

export const runtime = "nodejs";

const schema = z.object({
  couponId: z.string().min(1),
});

export async function POST(req: Request) {
  const session = getSessionFromCookies();
  if (!session) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
  }

  const { couponId } = parsed.data;

  await dbQuery(
    `INSERT INTO user_coupons (user_id, coupon_id, used, used_at)
     VALUES ($1, $2, true, now())
     ON CONFLICT (user_id, coupon_id)
     DO UPDATE SET used = true, used_at = now()`,
    [session.sub, couponId]
  );

  return NextResponse.json({ ok: true });
}
