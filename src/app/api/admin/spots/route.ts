import { NextResponse } from "next/server";
import { dbQuery } from "@/lib/db";
import { requireAdmin } from "@/lib/admin";
import { safeUrlOptional } from "@/lib/validation";
import { z } from "zod";

export const runtime = "nodejs";

const schema = z.object({
  id: z.string().min(1).max(120),
  cityId: z.string().max(120).optional(),
  name: z.string().min(1).max(120),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  type: z.string().max(80),
  image: safeUrlOptional,
  capacity: z.number().int().min(0).optional(),
  currentLoad: z.number().int().min(0).optional(),
  averageRating: z.number().min(0).max(5).optional(),
  historicalSnippet: z.string().max(2000).optional(),
  isActive: z.boolean().optional(),
});

export async function POST(req: Request) {
  const admin = await requireAdmin();
  if (!admin.ok) {
    return NextResponse.json({ error: "Sem permissão." }, { status: admin.reason === "forbidden" ? 403 : 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
  }

  const data = parsed.data;

  await dbQuery(
    `INSERT INTO spots (
      id, city_id, name, lat, lng, type, image, capacity, current_load, average_rating, historical_snippet, is_active
     ) VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12
     )
     ON CONFLICT (id)
     DO UPDATE SET
      city_id = EXCLUDED.city_id,
      name = EXCLUDED.name,
      lat = EXCLUDED.lat,
      lng = EXCLUDED.lng,
      type = EXCLUDED.type,
      image = EXCLUDED.image,
      capacity = EXCLUDED.capacity,
      current_load = EXCLUDED.current_load,
      average_rating = EXCLUDED.average_rating,
      historical_snippet = EXCLUDED.historical_snippet,
      is_active = EXCLUDED.is_active,
      updated_at = now()`,
    [
      data.id,
      data.cityId ?? "itarare",
      data.name,
      data.lat,
      data.lng,
      data.type,
      data.image ?? null,
      data.capacity ?? 0,
      data.currentLoad ?? 0,
      data.averageRating ?? 0,
      data.historicalSnippet ?? null,
      typeof data.isActive === "boolean" ? data.isActive : true,
    ]
  );

  return NextResponse.json({ ok: true });
}

export async function GET() {
  const admin = await requireAdmin();
  if (!admin.ok) {
    return NextResponse.json({ error: "Sem permissão." }, { status: admin.reason === "forbidden" ? 403 : 401 });
  }

  const result = await dbQuery(
    `SELECT id, city_id as "cityId", name, lat, lng, type, image,
      capacity, current_load as "currentLoad", average_rating as "averageRating",
      historical_snippet as "historicalSnippet", is_active as "isActive"
     FROM spots
     ORDER BY name ASC`
  );

  return NextResponse.json({ spots: result.rows });
}
