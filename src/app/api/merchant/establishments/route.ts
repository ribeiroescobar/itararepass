import { NextResponse } from "next/server";
import { dbQuery } from "@/lib/db";
import { requireMerchant } from "@/lib/admin";
import { safeUrlOptional } from "@/lib/validation";
import { z } from "zod";

export const runtime = "nodejs";

const schema = z.object({
  name: z.string().min(1).max(120),
  description: z.string().max(1000).optional(),
  address: z.string().max(200).optional(),
  imageUrl: safeUrlOptional,
  category: z.string().max(80).optional(),
  lat: z.number().min(-90).max(90).optional(),
  lng: z.number().min(-180).max(180).optional(),
  ownerUserId: z.string().optional(),
  premiumEnabled: z.boolean().optional(),
});

export async function GET() {
  const auth = await requireMerchant();
  if (!auth.ok) {
    return NextResponse.json({ error: "Sem permissão." }, { status: auth.reason === "forbidden" ? 403 : 401 });
  }

  const query = auth.isMaster
    ? `SELECT id, owner_user_id as "ownerUserId", name, description, address, image_url as "imageUrl",
        category, lat, lng, is_active as "isActive", premium_enabled as "premiumEnabled"
       FROM establishments ORDER BY created_at DESC`
    : `SELECT id, owner_user_id as "ownerUserId", name, description, address, image_url as "imageUrl",
        category, lat, lng, is_active as "isActive", premium_enabled as "premiumEnabled"
       FROM establishments WHERE owner_user_id = $1 ORDER BY created_at DESC`;

  const result = auth.isMaster
    ? await dbQuery(query)
    : await dbQuery(query, [auth.user.id]);

  return NextResponse.json({ establishments: result.rows });
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
  const ownerUserId = auth.isMaster && data.ownerUserId ? data.ownerUserId : auth.user.id;
  const premiumEnabled = auth.isMaster ? data.premiumEnabled ?? false : false;
  const result = await dbQuery(
    `INSERT INTO establishments (
      owner_user_id, name, description, address, image_url, category, lat, lng, premium_enabled
     ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     RETURNING id, owner_user_id as "ownerUserId", name, description, address, image_url as "imageUrl",
      category, lat, lng, is_active as "isActive", premium_enabled as "premiumEnabled"`,
    [
      ownerUserId,
      data.name,
      data.description ?? null,
      data.address ?? null,
      data.imageUrl ?? null,
      data.category ?? null,
      data.lat ?? null,
      data.lng ?? null,
      premiumEnabled,
    ]
  );

  return NextResponse.json({ establishment: result.rows[0] });
}
