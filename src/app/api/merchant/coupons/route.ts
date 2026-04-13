import { NextResponse } from "next/server";
import { dbQuery } from "@/lib/db";
import { requireMerchant } from "@/lib/admin";
import { safeUrlOptional } from "@/lib/validation";
import { z } from "zod";

export const runtime = "nodejs";

const schema = z.object({
  establishmentId: z.string().min(1),
  title: z.string().min(1).max(120),
  discount: z.string().min(1).max(60),
  requirementLabel: z.string().max(120).optional(),
  requiresProfile: z.boolean().optional(),
  requiresLodging: z.boolean().optional(),
  minAdventureSpots: z.number().int().min(0).optional(),
  isPremium: z.boolean().optional(),
  image: safeUrlOptional,
});

export async function GET() {
  const auth = await requireMerchant();
  if (!auth.ok) {
    return NextResponse.json({ error: "Sem permissao." }, { status: auth.reason === "forbidden" ? 403 : 401 });
  }

  const query = auth.isMaster
    ? `SELECT c.id, c.establishment_id as "establishmentId", c.title, c.discount,
        c.requirement_label as "requirementLabel", c.requires_profile as "requiresProfile",
        c.requires_lodging as "requiresLodging", c.min_adventure_spots as "minAdventureSpots",
        c.is_premium as "isPremium", c.image_url as "image", c.is_active as "isActive",
        e.name as "establishmentName", e.owner_user_id as "ownerUserId"
       FROM coupons_catalog c
       JOIN establishments e ON e.id = c.establishment_id
       ORDER BY c.created_at DESC`
    : `SELECT c.id, c.establishment_id as "establishmentId", c.title, c.discount,
        c.requirement_label as "requirementLabel", c.requires_profile as "requiresProfile",
        c.requires_lodging as "requiresLodging", c.min_adventure_spots as "minAdventureSpots",
        c.is_premium as "isPremium", c.image_url as "image", c.is_active as "isActive",
        e.name as "establishmentName", e.owner_user_id as "ownerUserId"
       FROM coupons_catalog c
       JOIN establishments e ON e.id = c.establishment_id
       WHERE e.owner_user_id = $1
       ORDER BY c.created_at DESC`;

  const result = auth.isMaster ? await dbQuery(query) : await dbQuery(query, [auth.user.id]);
  return NextResponse.json({ coupons: result.rows });
}

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

  const data = parsed.data;
  const ownership = await dbQuery(
    "SELECT owner_user_id, premium_enabled FROM establishments WHERE id = $1",
    [data.establishmentId]
  );
  const ownerId = ownership.rows[0]?.owner_user_id;
  const premiumEnabled = ownership.rows[0]?.premium_enabled;
  if (!ownerId) {
    return NextResponse.json({ error: "Estabelecimento não encontrado." }, { status: 404 });
  }
  if (!auth.isMaster && ownerId !== auth.user.id) {
    return NextResponse.json({ error: "Sem permissão." }, { status: 403 });
  }
  if (data.isPremium && !auth.isMaster && !premiumEnabled) {
    return NextResponse.json({ error: "Recurso premium não liberado para este estabelecimento." }, { status: 403 });
  }

  const result = await dbQuery(
    `INSERT INTO coupons_catalog (
      establishment_id, title, discount, requirement_label,
      requires_profile, requires_lodging, min_adventure_spots, is_premium, image_url
     ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     RETURNING id`,
    [
      data.establishmentId,
      data.title,
      data.discount,
      data.requirementLabel ?? null,
      data.requiresProfile ?? false,
      data.requiresLodging ?? false,
      data.minAdventureSpots ?? null,
      data.isPremium ?? false,
      data.image ?? null,
    ]
  );

  return NextResponse.json({ id: result.rows[0].id });
}
