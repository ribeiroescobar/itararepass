import { NextResponse } from "next/server";
import { getSessionFromCookies } from "@/lib/session";
import { dbQuery } from "@/lib/db";
import { z } from "zod";

export const runtime = "nodejs";

const schema = z.object({
  couponId: z.string().min(1),
});

export async function POST(req: Request) {
  const session = await getSessionFromCookies();
  if (!session) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }
  if (session.role !== "tourist") {
    return NextResponse.json({ error: "Perfil sem permissão para resgatar benefícios." }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
  }

  const { couponId } = parsed.data;

  const coupon = await dbQuery(
    "SELECT id FROM coupons_catalog WHERE id = $1 AND is_active = true",
    [couponId]
  );
  if (!coupon.rowCount) {
    return NextResponse.json({ error: "Benefício indisponível." }, { status: 404 });
  }

  await dbQuery(
    `INSERT INTO user_coupons (user_id, coupon_id, used, used_at)
     VALUES ($1, $2, true, now())
     ON CONFLICT (user_id, coupon_id)
     DO UPDATE SET used = true, used_at = now()`,
    [session.sub, couponId]
  );

  return NextResponse.json({ ok: true });
}

