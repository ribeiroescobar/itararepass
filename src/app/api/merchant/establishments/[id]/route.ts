import { NextResponse } from "next/server";
import { dbQuery } from "@/lib/db";
import { requireMerchant } from "@/lib/admin";
import { safeUrlNullable } from "@/lib/validation";
import { z } from "zod";

export const runtime = "nodejs";

const schema = z.object({
  name: z.string().max(120).optional(),
  description: z.string().max(1000).optional().nullable(),
  address: z.string().max(200).optional().nullable(),
  imageUrl: safeUrlNullable,
  category: z.string().max(80).optional().nullable(),
  lat: z.number().min(-90).max(90).optional().nullable(),
  lng: z.number().min(-180).max(180).optional().nullable(),
  isActive: z.boolean().optional(),
  premiumEnabled: z.boolean().optional(),
});

export async function PATCH(req: Request, context: { params: Promise<{ id: string }> }) {
  const auth = await requireMerchant();
  if (!auth.ok) {
    return NextResponse.json({ error: "Sem permissão." }, { status: auth.reason === "forbidden" ? 403 : 401 });
  }

  const { id } = await context.params;
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
  }

  const ownershipCheck = await dbQuery(
    "SELECT owner_user_id FROM establishments WHERE id = $1",
    [id]
  );
  const ownerId = ownershipCheck.rows[0]?.owner_user_id;
  if (!ownerId) {
    return NextResponse.json({ error: "Estabelecimento não encontrado." }, { status: 404 });
  }
  if (!auth.isMaster && ownerId !== auth.user.id) {
    return NextResponse.json({ error: "Sem permissão." }, { status: 403 });
  }

  const data = parsed.data;
  const premiumEnabled = auth.isMaster ? data.premiumEnabled : null;
  await dbQuery(
    `UPDATE establishments SET
      name = COALESCE($1, name),
      description = COALESCE($2, description),
      address = COALESCE($3, address),
      image_url = COALESCE($4, image_url),
      category = COALESCE($5, category),
      lat = COALESCE($6, lat),
      lng = COALESCE($7, lng),
      is_active = COALESCE($8, is_active),
      premium_enabled = COALESCE($9, premium_enabled),
      updated_at = now()
     WHERE id = $10`,
    [
      data.name ?? null,
      data.description ?? null,
      data.address ?? null,
      data.imageUrl ?? null,
      data.category ?? null,
      data.lat ?? null,
      data.lng ?? null,
      typeof data.isActive === "boolean" ? data.isActive : null,
      typeof premiumEnabled === "boolean" ? premiumEnabled : null,
      id,
    ]
  );

  return NextResponse.json({ ok: true });
}

export async function DELETE(_: Request, context: { params: Promise<{ id: string }> }) {
  const auth = await requireMerchant();
  if (!auth.ok) {
    return NextResponse.json({ error: "Sem permissão." }, { status: auth.reason === "forbidden" ? 403 : 401 });
  }

  const { id } = await context.params;
  const ownershipCheck = await dbQuery(
    "SELECT owner_user_id FROM establishments WHERE id = $1",
    [id]
  );
  const ownerId = ownershipCheck.rows[0]?.owner_user_id;
  if (!ownerId) {
    return NextResponse.json({ error: "Estabelecimento não encontrado." }, { status: 404 });
  }
  if (!auth.isMaster && ownerId !== auth.user.id) {
    return NextResponse.json({ error: "Sem permissão." }, { status: 403 });
  }

  await dbQuery("UPDATE establishments SET is_active = false, updated_at = now() WHERE id = $1", [id]);
  return NextResponse.json({ ok: true });
}
