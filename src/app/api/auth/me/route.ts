import { NextResponse } from "next/server";
import { getSessionFromCookies } from "@/lib/session";
import { dbQuery } from "@/lib/db";
import { mapUserProfile, type DbUser } from "@/lib/user-mappers";

export const runtime = "nodejs";

export async function GET() {
  const session = await getSessionFromCookies();
  if (!session) {
    return NextResponse.json({ user: null, profile: null }, { status: 401 });
  }

  const result = await dbQuery<DbUser>(
    `SELECT id, email, name, whatsapp, origin_city, age_group, cnpj, business_name, position,
      tipo_usuario, role, approved, created_at, completed, interest, discovery_source, discovery_source_other
     FROM users WHERE id = $1`,
    [session.sub]
  );

  const user = result.rows[0];
  if (!user) {
    return NextResponse.json({ user: null, profile: null }, { status: 401 });
  }

  return NextResponse.json({
    user: { uid: user.id, email: user.email },
    profile: mapUserProfile(user),
  });
}
