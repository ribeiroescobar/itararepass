import { NextResponse } from "next/server";
import { dbQuery } from "@/lib/db";
import { hashPassword, signSession } from "@/lib/auth";
import { mapUserProfile, type DbUser } from "@/lib/user-mappers";
import { z } from "zod";

export const runtime = "nodejs";

const MASTER_EMAILS = [
  "douglasescobarribeiro@gmail.com",
  "douglas@itarare.gov.br",
  "gestor@itarare.gov.br",
];

const schema = z.object({
  email: z.string().email(),
  pass: z.string().min(6),
  name: z.string().min(1),
  role: z.string(),
  additional: z.record(z.any()).optional(),
});

function resolveRole(inputRole: string, email: string) {
  const emailLower = email.toLowerCase();
  if (MASTER_EMAILS.includes(emailLower)) {
    return { tipoUsuario: "admin_master", role: "admin", approved: true, isMaster: true };
  }

  if (inputRole === "turista" || inputRole === "tourist") {
    return { tipoUsuario: "turista", role: "tourist", approved: true, isMaster: false };
  }
  if (inputRole === "logista") {
    return { tipoUsuario: "logista_pendente", role: "merchant", approved: false, isMaster: false };
  }
  if (inputRole === "prefeitura") {
    return { tipoUsuario: "prefeitura_pendente", role: "admin", approved: false, isMaster: false };
  }

  return { tipoUsuario: "turista", role: "tourist", approved: true, isMaster: false };
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
  }

  const { email, pass, name, role, additional } = parsed.data;
  const emailLower = email.toLowerCase();

  const existing = await dbQuery("SELECT id FROM users WHERE email = $1", [emailLower]);
  if (existing.rowCount) {
    return NextResponse.json({ error: "E-mail já existe." }, { status: 409 });
  }

  const roleInfo = resolveRole(role, emailLower);
  const passwordHash = await hashPassword(pass);

  const result = await dbQuery<DbUser>(
    `INSERT INTO users (
      email, password_hash, name, whatsapp, origin_city, age_group, cnpj, business_name,
      position, tipo_usuario, role, approved, completed, interest, discovery_source, discovery_source_other
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8,
      $9, $10, $11, $12, $13, $14, $15, $16
    )
    RETURNING id, email, name, whatsapp, origin_city, age_group, cnpj, business_name, position,
      tipo_usuario, role, approved, created_at, completed, interest, discovery_source, discovery_source_other`,
    [
      emailLower,
      passwordHash,
      roleInfo.isMaster ? (emailLower === "gestor@itarare.gov.br" ? "Gestor Demo" : "Douglas") : name,
      additional?.whatsapp ?? null,
      additional?.originCity ?? null,
      additional?.ageGroup ?? null,
      additional?.cnpj ?? null,
      additional?.businessName ?? null,
      additional?.position ?? null,
      roleInfo.tipoUsuario,
      roleInfo.role,
      roleInfo.approved,
      typeof additional?.completed === "boolean" ? additional.completed : roleInfo.tipoUsuario === "turista",
      additional?.interest ?? null,
      additional?.discoverySource ?? null,
      additional?.discoverySourceOther ?? null,
    ]
  );

  const user = result.rows[0];
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
