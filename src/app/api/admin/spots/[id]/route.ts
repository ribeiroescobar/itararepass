import { NextResponse } from "next/server";
import { dbQuery } from "@/lib/db";
import { requireAdmin } from "@/lib/admin";
import { z } from "zod";

export const runtime = "nodejs";

const schema = z.object({
  cityId: z.string().optional(),
  name: z.string().optional(),
  lat: z.number().optional(),
  lng: z.number().optional(),
  type: z.string().optional(),
  image: z.string().optional().nullable(),
  capacity: z.number().int().optional(),
  currentLoad: z.number().int().optional(),
  averageRating: z.number().optional(),
  historicalSnippet: z.string().optional().nullable(),
  isActive: z.boolean().optional(),
});

export async function PATCH(req: Request, context: { params: { id: string } }) {
  const admin = await requireAdmin();
  if (!admin.ok) {
    return NextResponse.json({ error: "Sem permissão." }, { status: admin.reason === "forbidden" ? 403 : 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
  }

  const { id } = context.params;
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

export async function DELETE(_: Request, context: { params: { id: string } }) {
  const admin = await requireAdmin();
  if (!admin.ok) {
    return NextResponse.json({ error: "Sem permissão." }, { status: admin.reason === "forbidden" ? 403 : 401 });
  }

  const { id } = context.params;
  await dbQuery("UPDATE spots SET is_active = false, updated_at = now() WHERE id = $1", [id]);
  return NextResponse.json({ ok: true });
}
