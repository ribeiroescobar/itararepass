import { NextResponse } from "next/server";
import { verifyCouponValidationToken } from "@/lib/auth";
import { requireMerchant } from "@/lib/admin";
import { dbQuery } from "@/lib/db";
import { z } from "zod";

export const runtime = "nodejs";

const schema = z.object({
  token: z.string().min(1),
});

export async function POST(req: Request) {
  const auth = await requireMerchant();
  if (!auth.ok) {
    return NextResponse.json({ error: "Sem permissão." }, { status: auth.reason === "forbidden" ? 403 : 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
  }

  let payload: ReturnType<typeof verifyCouponValidationToken>;
  try {
    payload = verifyCouponValidationToken(parsed.data.token);
  } catch {
    return NextResponse.json({ error: "QR inválido ou expirado." }, { status: 400 });
  }

  const result = payload.claimId
    ? await dbQuery(
        `SELECT
            uc.id as "claimId",
            uc.user_id as "userId",
            uc.coupon_id as "couponId",
            uc.used,
            c.title,
            c.discount,
            c.establishment_id as "establishmentId",
            e.name as "establishmentName",
            e.owner_user_id as "ownerUserId",
            u.name as "touristName"
         FROM user_coupons uc
         JOIN coupons_catalog c ON c.id::text = uc.coupon_id
         JOIN establishments e ON e.id = c.establishment_id
         JOIN users u ON u.id = uc.user_id
         WHERE uc.id = $1 AND c.is_active = true AND e.is_active = true`,
        [payload.claimId]
      )
    : await dbQuery(
        `SELECT
            uc.id as "claimId",
            uc.user_id as "userId",
            uc.coupon_id as "couponId",
            uc.used,
            c.title,
            c.discount,
            c.establishment_id as "establishmentId",
            e.name as "establishmentName",
            e.owner_user_id as "ownerUserId",
            u.name as "touristName"
         FROM user_coupons uc
         JOIN coupons_catalog c ON c.id::text = uc.coupon_id
         JOIN establishments e ON e.id = c.establishment_id
         JOIN users u ON u.id = uc.user_id
         WHERE uc.user_id = $1 AND uc.coupon_id = $2 AND c.is_active = true AND e.is_active = true`,
        [payload.sub, payload.couponId]
      );

  const row = result.rows[0] as
    | {
        claimId: string;
        userId: string;
        couponId: string;
        used: boolean;
        title: string;
        discount: string;
        establishmentId: string;
        establishmentName: string;
        ownerUserId: string;
        touristName: string;
      }
    | undefined;

  if (!row) {
    return NextResponse.json({ error: "Cupom não encontrado para este turista." }, { status: 404 });
  }

  if (payload.establishmentId && row.establishmentId !== payload.establishmentId) {
    return NextResponse.json({ error: "QR incompatível com o estabelecimento do benefício." }, { status: 400 });
  }

  if (row.ownerUserId !== auth.user.id) {
    return NextResponse.json({ error: "Sem permissão para validar este cupom." }, { status: 403 });
  }

  if (row.used) {
    return NextResponse.json(
      {
        error: "Este benefício já foi validado anteriormente.",
        validation: {
          touristName: row.touristName,
          couponTitle: row.title,
          discount: row.discount,
          establishmentName: row.establishmentName,
          alreadyUsed: true,
        },
      },
      { status: 409 }
    );
  }

  await dbQuery(
    `UPDATE user_coupons
     SET used = true, used_at = now()
     WHERE id = $1`,
    [row.claimId]
  );

  return NextResponse.json({
    ok: true,
    validation: {
      touristName: row.touristName,
      couponTitle: row.title,
      discount: row.discount,
      establishmentName: row.establishmentName,
      validatedAt: new Date().toISOString(),
    },
  });
}
