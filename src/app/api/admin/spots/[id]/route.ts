import { NextResponse } from "next/server";
import { dbQuery } from "@/lib/db";
import { requireAdmin } from "@/lib/admin";
import { safeUrlNullable } from "@/lib/validation";
import { z } from "zod";

export const runtime = "nodejs";

const schema = z.object({
  cityId: z.string().max(120).optional(),
  name: z.string().max(120).optional(),
  lat: z.number().min(-90).max(90).optional(),
  lng: z.number().min(-180).max(180).optional(),
  type: z.string().max(80).optional(),
  image: safeUrlNullable,
  capacity: z.number().int().min(0).optional(),
  currentLoad: z.number().int().min(0).optional(),
  averageRating: z.number().min(0).max(5).optional(),
  historicalSnippet: z.string().max(2000).optional().nullable(),
  isActive: z.boolean().optional(),
});

export async function PATCH(req: Request, context: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  if (!admin.ok) {
    return NextResponse.json({ error: "Sem permissao." }, { status: admin.reason === "forbidden" ? 403 : 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados invalidos." }, { status: 400 });
  }

  const { id } = await context.params;
  const data = parsed.data;

  await dbQuery(
    `UPDATE spots SET
      city_id = COALESCE($1, city_id),
      name = COALESCE($2, name),
      lat = COALESCE($3, lat),
      lng = COALESCE($4, lng),
      type = COALESCE($5, type),
      image = COALESCE($6, image),
      capacity = COALESCE($7, capacity),
      current_load = COALESCE($8, current_load),
      average_rating = COALESCE($9, average_rating),
      historical_snippet = COALESCE($10, historical_snippet),
      is_active = COALESCE($11, is_active),
      updated_at = now()
     WHERE id = $12`,
    [
      data.cityId ?? null,
      data.name ?? null,
      data.lat ?? null,
      data.lng ?? null,
      data.type ?? null,
      data.image ?? null,
      data.capacity ?? null,
      data.currentLoad ?? null,
      data.averageRating ?? null,
      data.historicalSnippet ?? null,
      typeof data.isActive === "boolean" ? data.isActive : null,
      id,
    ]
  );

  return NextResponse.json({ ok: true });
}

export async function DELETE(_: Request, context: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  if (!admin.ok) {
    return NextResponse.json({ error: "Sem permissao." }, { status: admin.reason === "forbidden" ? 403 : 401 });
  }

  const { id } = await context.params;
  const existing = await dbQuery(`SELECT id, is_active as "isActive" FROM spots WHERE id = $1`, [id]);
  const spot = existing.rows[0] as { id: string; isActive: boolean } | undefined;

  if (!spot) {
    return NextResponse.json({ error: "Local nao encontrado." }, { status: 404 });
  }

  if (spot.isActive !== false) {
    return NextResponse.json({ error: "Desative o local antes de excluir permanentemente." }, { status: 409 });
  }

  try {
    await dbQuery("DELETE FROM spots WHERE id = $1", [id]);
  } catch {
    return NextResponse.json(
      { error: "Nao foi possivel excluir este local porque ele possui registros vinculados." },
      { status: 409 }
    );
  }

  return NextResponse.json({ ok: true });
}
