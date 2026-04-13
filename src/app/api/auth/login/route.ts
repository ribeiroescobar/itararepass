import { NextResponse } from "next/server";
import { dbQuery } from "@/lib/db";
import { signSession, verifyPassword } from "@/lib/auth";
import { mapUserProfile, type DbUser } from "@/lib/user-mappers";
import { z } from "zod";

export const runtime = "nodejs";

const schema = z.object({
  email: z.string().email(),
  pass: z.string().min(1),
  portal: z.enum(["tourist", "merchant", "admin"]).optional(),
});

function isPortalAllowed(portal: "tourist" | "merchant" | "admin" | undefined, user: DbUser) {
  if (!portal) return true;

  if (portal === "tourist") {
    return user.role === "tourist" && user.tipo_usuario === "turista";
  }

  if (portal === "merchant") {
    return user.role === "merchant" || user.tipo_usuario.includes("logista");
  }

  if (portal === "admin") {
    return user.tipo_usuario === "admin_master" || user.role === "admin" || user.tipo_usuario.includes("prefeitura");
  }

  return false;
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados invalidos." }, { status: 400 });
  }

  const { email, pass, portal } = parsed.data;
  const emailLower = email.toLowerCase();

  const result = await dbQuery<DbUser & { password_hash: string }>(
    `SELECT id, email, password_hash, name, whatsapp, origin_city, age_group, cnpj, business_name, position,
      tipo_usuario, role, approved, created_at, completed, interest, discovery_source, discovery_source_other
     FROM users WHERE email = $1`,
    [emailLower]
  );

  const user = result.rows[0];
  if (!user) {
    return NextResponse.json({ error: "Credenciais invalidas." }, { status: 401 });
  }

  const valid = await verifyPassword(pass, user.password_hash);
  if (!valid) {
    return NextResponse.json({ error: "Credenciais invalidas." }, { status: 401 });
  }

  if (!isPortalAllowed(portal, user)) {
    const portalMessages = {
      tourist: "Este acesso e exclusivo para turistas. Use o portal correto da sua conta.",
      merchant: "Este acesso e exclusivo para comerciantes. Use o portal comercial.",
      admin: "Este acesso e exclusivo para prefeitura e administradores. Use o portal administrativo.",
    } as const;

    const message = portal ? portalMessages[portal] : "Portal invalido.";
    return NextResponse.json({ error: message }, { status: 403 });
  }

  const token = signSession({ sub: user.id, email: user.email, role: user.role });

  const response = NextResponse.json({
    user: { uid: user.id, email: user.email },
    profile: mapUserProfile(user),
  });

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
