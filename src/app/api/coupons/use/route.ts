import { NextResponse } from "next/server";
import { signCouponValidationToken } from "@/lib/auth";
import { dbQuery } from "@/lib/db";
import { getSessionFromCookies } from "@/lib/session";
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
    `SELECT c.id, c.title, c.discount, c.establishment_id as "establishmentId", e.name as "businessName"
     FROM coupons_catalog c
     JOIN establishments e ON e.id = c.establishment_id
     WHERE c.id = $1 AND c.is_active = true AND e.is_active = true`,
    [couponId]
  );
  if (!coupon.rowCount) {
    return NextResponse.json({ error: "Benefício indisponível." }, { status: 404 });
  }

  const couponRow = coupon.rows[0] as {
    id: string;
    title: string;
    discount: string;
    establishmentId: string;
    businessName: string;
  };

  const existing = await dbQuery(
    `SELECT used
     FROM user_coupons
     WHERE user_id = $1 AND coupon_id = $2`,
    [session.sub, couponId]
  );

  if (existing.rows[0]?.used) {
    return NextResponse.json({ error: "Benefício já validado neste estabelecimento." }, { status: 409 });
  }

  await dbQuery(
    `INSERT INTO user_coupons (user_id, coupon_id, used, used_at)
     VALUES ($1, $2, false, null)
     ON CONFLICT (user_id, coupon_id)
     DO UPDATE SET used = user_coupons.used, used_at = user_coupons.used_at`,
    [session.sub, couponId]
  );

  const token = signCouponValidationToken({
    sub: session.sub,
    couponId,
    establishmentId: couponRow.establishmentId,
  });

  return NextResponse.json({
    ok: true,
    token,
    alreadyClaimed: !!existing.rowCount,
    expiresInMinutes: 15,
    coupon: {
      id: couponRow.id,
      title: couponRow.title,
      discount: couponRow.discount,
      businessName: couponRow.businessName,
    },
  });
}
