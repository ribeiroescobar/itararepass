import { NextResponse } from "next/server";
import { dbQuery } from "@/lib/db";
import { mapUserProfile, type DbUser } from "@/lib/user-mappers";
import { requireAdmin } from "@/lib/admin";

export const runtime = "nodejs";

export async function GET() {
  const admin = await requireAdmin();
  if (!admin.ok) {
    return NextResponse.json({ error: "Sem permissão." }, { status: admin.reason === "forbidden" ? 403 : 401 });
  }

  const result = await dbQuery<DbUser>(
    `SELECT id, email, name, whatsapp, origin_city, age_group, cnpj, business_name, position,
      tipo_usuario, role, approved, created_at, completed, interest, discovery_source, discovery_source_other
     FROM users`
  );

  return NextResponse.json({ users: result.rows.map(mapUserProfile) });
}
