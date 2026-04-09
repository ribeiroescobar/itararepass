import { NextResponse } from "next/server";
import { dbQuery } from "@/lib/db";

export const runtime = "nodejs";

export async function GET() {
  const result = await dbQuery(
    `SELECT id, city_id as "cityId", name, lat, lng, type, image,
      capacity, current_load as "currentLoad", average_rating as "averageRating",
      historical_snippet as "historicalSnippet"
     FROM spots
     WHERE is_active = true
     ORDER BY name ASC`
  );

  return NextResponse.json({ spots: result.rows });
}
