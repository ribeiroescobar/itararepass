import { NextResponse } from "next/server";
import { dbQuery } from "@/lib/db";
import { requireAdmin } from "@/lib/admin";
import { z } from "zod";

export const runtime = "nodejs";

const schema = z.object({
  id: z.string().min(1),
  cityId: z.string().optional(),
  name: z.string().min(1),
  lat: z.number(),
  lng: z.number(),
  type: z.string(),
  image: z.string().optional(),
  capacity: z.number().int().optional(),
  currentLoad: z.number().int().optional(),
  averageRating: z.number().optional(),
  historicalSnippet: z.string().optional(),
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
