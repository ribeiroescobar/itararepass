import { NextResponse } from "next/server";
import { dbQuery } from "@/lib/db";
import { signSession, verifyPassword } from "@/lib/auth";
import { mapUserProfile, type DbUser } from "@/lib/user-mappers";
import { z } from "zod";

export const runtime = "nodejs";

// Validates login payload.
const schema = z.object({
  email: z.string().email(),
  pass: z.string().min(1),
});

// Exchanges credentials for a session cookie.
export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
  }

  const { email, pass } = parsed.data;
  const emailLower = email.toLowerCase();

  // Load user + password hash for verification.
  const result = await dbQuery<DbUser & { password_hash: string }>(
    `SELECT id, email, password_hash, name, whatsapp, origin_city, age_group, cnpj, business_name, position,
      tipo_usuario, role, approved, created_at, completed, interest, discovery_source, discovery_source_other
     FROM users WHERE email = $1`,
    [emailLower]
  );

  const user = result.rows[0];
  if (!user) {
    return NextResponse.json({ error: "Credenciais inválidas." }, { status: 401 });
  }

  const valid = await verifyPassword(pass, user.password_hash);
  if (!valid) {
    return NextResponse.json({ error: "Credenciais inválidas." }, { status: 401 });
  }

  const token = signSession({ sub: user.id, email: user.email, role: user.role });

  const response = NextResponse.json({
    user: { uid: user.id, email: user.email },
    profile: mapUserProfile(user),
  });

  // HTTP-only session cookie used by server routes.
  response.cookies.set({
    name: "itarare_session",
    value: token,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  return response;
}
