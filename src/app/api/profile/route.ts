import { NextResponse } from "next/server";
import { getSessionFromCookies } from "@/lib/session";
import { dbQuery } from "@/lib/db";
import { mapUserProfile, type DbUser } from "@/lib/user-mappers";
import { z } from "zod";

export const runtime = "nodejs";

const schema = z.object({
  name: z.string().optional(),
  whatsapp: z.string().optional(),
  originCity: z.string().optional(),
  ageGroup: z.string().optional(),
  cnpj: z.string().optional(),
  businessName: z.string().optional(),
  position: z.string().optional(),
  completed: z.boolean().optional(),
  interest: z.string().optional(),
  discoverySource: z.string().optional(),
  discoverySourceOther: z.string().optional(),
});

export async function PATCH(req: Request) {
  const session = getSessionFromCookies();
  if (!session) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
  }

  const fields = parsed.data;

  const result = await dbQuery<DbUser>(
    `UPDATE users SET
      name = COALESCE($1, name),
      whatsapp = COALESCE($2, whatsapp),
      origin_city = COALESCE($3, origin_city),
      age_group = COALESCE($4, age_group),
      cnpj = COALESCE($5, cnpj),
      business_name = COALESCE($6, business_name),
      position = COALESCE($7, position),
      completed = COALESCE($8, completed),
      interest = COALESCE($9, interest),
      discovery_source = COALESCE($10, discovery_source),
      discovery_source_other = COALESCE($11, discovery_source_other)
     WHERE id = $12
     RETURNING id, email, name, whatsapp, origin_city, age_group, cnpj, business_name, position,
      tipo_usuario, role, approved, created_at, completed, interest, discovery_source, discovery_source_other`,
    [
      fields.name ?? null,
      fields.whatsapp ?? null,
      fields.originCity ?? null,
      fields.ageGroup ?? null,
      fields.cnpj ?? null,
      fields.businessName ?? null,
      fields.position ?? null,
      typeof fields.completed === "boolean" ? fields.completed : null,
      fields.interest ?? null,
      fields.discoverySource ?? null,
      fields.discoverySourceOther ?? null,
      session.sub,
    ]
  );

  const user = result.rows[0];
  if (!user) {
    return NextResponse.json({ error: "Usuário não encontrado." }, { status: 404 });
  }

  return NextResponse.json({ profile: mapUserProfile(user) });
}
