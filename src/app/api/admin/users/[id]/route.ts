import { NextResponse } from "next/server";
import { dbQuery } from "@/lib/db";
import { mapUserProfile, type DbUser } from "@/lib/user-mappers";
import { requireAdminMaster } from "@/lib/admin";
import { z } from "zod";

export const runtime = "nodejs";

const schema = z.object({
  approved: z.boolean().optional(),
  role: z.enum(["tourist", "merchant", "admin"]).optional(),
  tipo_usuario: z.string().optional(),
});

export async function PATCH(req: Request, context: { params: Promise<{ id: string }> }) {
  const admin = await requireAdminMaster();
  if (!admin.ok) {
    return NextResponse.json({ error: "Sem permissão." }, { status: admin.reason === "forbidden" ? 403 : 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
  }

  const { id } = await context.params;
  const fields = parsed.data;

  const result = await dbQuery<DbUser>(
    `UPDATE users SET
      approved = COALESCE($1, approved),
      role = COALESCE($2, role),
      tipo_usuario = COALESCE($3, tipo_usuario)
     WHERE id = $4
     RETURNING id, email, name, whatsapp, origin_city, age_group, cnpj, business_name, position,
      tipo_usuario, role, approved, created_at, completed, interest, discovery_source, discovery_source_other`,
    [
      typeof fields.approved === "boolean" ? fields.approved : null,
      fields.role ?? null,
      fields.tipo_usuario ?? null,
      id,
    ]
  );

  const user = result.rows[0];
  if (!user) {
    return NextResponse.json({ error: "Usuário não encontrado." }, { status: 404 });
  }

  return NextResponse.json({ user: mapUserProfile(user) });
}
