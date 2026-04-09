import { NextResponse } from "next/server";
import { dbQuery } from "@/lib/db";
import { requireMerchant } from "@/lib/admin";
import { z } from "zod";

export const runtime = "nodejs";

const schema = z.object({
  establishmentId: z.string().min(1),
  title: z.string().min(1),
  discount: z.string().min(1),
  requirementLabel: z.string().optional(),
  requiresProfile: z.boolean().optional(),
  requiresLodging: z.boolean().optional(),
  minAdventureSpots: z.number().int().optional(),
  isPremium: z.boolean().optional(),
  image: z.string().optional(),
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

  const data = parsed.data;
  const ownership = await dbQuery(
    "SELECT owner_user_id FROM establishments WHERE id = $1",
    [data.establishmentId]
  );
  const ownerId = ownership.rows[0]?.owner_user_id;
  if (!ownerId) {
    return NextResponse.json({ error: "Estabelecimento não encontrado." }, { status: 404 });
  }
  if (!auth.isMaster && ownerId !== auth.user.id) {
    return NextResponse.json({ error: "Sem permissão." }, { status: 403 });
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
