import { NextResponse } from "next/server";
import { dbQuery } from "@/lib/db";

export const runtime = "nodejs";

export async function GET() {
  const result = await dbQuery(
    `SELECT id, name, description, address, image_url as "imageUrl", category, lat, lng
     FROM establishments
     WHERE is_active = true
     ORDER BY created_at DESC`
  );

  return NextResponse.json({ establishments: result.rows });
}
