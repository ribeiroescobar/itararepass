import { NextResponse } from "next/server";
import { dbQuery } from "@/lib/db";
import { requireMerchant } from "@/lib/admin";
import { z } from "zod";

export const runtime = "nodejs";

const schema = z.object({
  title: z.string().optional(),
  discount: z.string().optional(),
  requirementLabel: z.string().optional().nullable(),
  requiresProfile: z.boolean().optional(),
  requiresLodging: z.boolean().optional(),
  minAdventureSpots: z.number().int().optional().nullable(),
  isPremium: z.boolean().optional(),
  image: z.string().optional().nullable(),
  isActive: z.boolean().optional(),
});

export async function PATCH(req: Request, context: { params: { id: string } }) {
  const auth = await requireMerchant();
  if (!auth.ok) {
    return NextResponse.json({ error: "Sem permissão." }, { status: auth.reason === "forbidden" ? 403 : 401 });
  }

  const { id } = context.params;
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
  }

  const ownership = await dbQuery(
    `SELECT e.owner_user_id
     FROM coupons_catalog c
     JOIN establishments e ON e.id = c.establishment_id
     WHERE c.id = $1`,
    [id]
  );
  const ownerId = ownership.rows[0]?.owner_user_id;
  if (!ownerId) {
    return NextResponse.json({ error: "Cupom não encontrado." }, { status: 404 });
  }
  if (!auth.isMaster && ownerId !== auth.user.id) {
    return NextResponse.json({ error: "Sem permissão." }, { status: 403 });
  }

  const data = parsed.data;
  await dbQuery(
    `UPDATE coupons_catalog SET
      title = COALESCE($1, title),
      discount = COALESCE($2, discount),
      requirement_label = COALESCE($3, requirement_label),
      requires_profile = COALESCE($4, requires_profile),
      requires_lodging = COALESCE($5, requires_lodging),
      min_adventure_spots = COALESCE($6, min_adventure_spots),
      is_premium = COALESCE($7, is_premium),
      image_url = COALESCE($8, image_url),
      is_active = COALESCE($9, is_active),
      updated_at = now()
     WHERE id = $10`,
    [
      data.title ?? null,
      data.discount ?? null,
      data.requirementLabel ?? null,
      typeof data.requiresProfile === "boolean" ? data.requiresProfile : null,
      typeof data.requiresLodging === "boolean" ? data.requiresLodging : null,
      data.minAdventureSpots ?? null,
      typeof data.isPremium === "boolean" ? data.isPremium : null,
      data.image ?? null,
      typeof data.isActive === "boolean" ? data.isActive : null,
      id,
    ]
  );

  return NextResponse.json({ ok: true });
}

export async function DELETE(_: Request, context: { params: { id: string } }) {
  const auth = await requireMerchant();
  if (!auth.ok) {
    return NextResponse.json({ error: "Sem permissão." }, { status: auth.reason === "forbidden" ? 403 : 401 });
  }

  const { id } = context.params;
  const ownership = await dbQuery(
    `SELECT e.owner_user_id
     FROM coupons_catalog c
     JOIN establishments e ON e.id = c.establishment_id
     WHERE c.id = $1`,
    [id]
  );
  const ownerId = ownership.rows[0]?.owner_user_id;
  if (!ownerId) {
    return NextResponse.json({ error: "Cupom não encontrado." }, { status: 404 });
  }
  if (!auth.isMaster && ownerId !== auth.user.id) {
    return NextResponse.json({ error: "Sem permissão." }, { status: 403 });
  }

  await dbQuery("UPDATE coupons_catalog SET is_active = false, updated_at = now() WHERE id = $1", [id]);
  return NextResponse.json({ ok: true });
}
