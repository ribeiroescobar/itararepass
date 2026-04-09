import { NextResponse } from "next/server";
import { dbQuery } from "@/lib/db";

export const runtime = "nodejs";

export async function GET() {
  const result = await dbQuery(
    `SELECT c.id, c.title, c.discount, c.requirement_label as "requirementLabel",
      c.requires_profile as "requiresProfile", c.requires_lodging as "requiresLodging",
      c.min_adventure_spots as "minAdventureSpots", c.is_premium as "isPremium",
      COALESCE(c.image_url, e.image_url) as "image",
      e.id as "establishmentId", e.name as "businessName", e.address, e.image_url as "businessImage"
     FROM coupons_catalog c
     JOIN establishments e ON e.id = c.establishment_id
     WHERE c.is_active = true AND e.is_active = true
     ORDER BY c.created_at DESC`
  );

  return NextResponse.json({ coupons: result.rows });
}
