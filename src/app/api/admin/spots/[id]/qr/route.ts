import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { dbQuery } from "@/lib/db";
import { signSpotValidationToken } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET(_: Request, context: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin();
  if (!auth.ok) {
    return NextResponse.json({ error: "Sem permissao." }, { status: auth.reason === "forbidden" ? 403 : 401 });
  }

  const { id } = await context.params;
  const spotResult = await dbQuery<{ id: string; name: string; is_active: boolean }>(
    `SELECT id, name, is_active
     FROM spots
     WHERE id = $1`,
    [id]
  );

  const spot = spotResult.rows[0];
  if (!spot) {
    return NextResponse.json({ error: "Local nao encontrado." }, { status: 404 });
  }

  return NextResponse.json({
    token: signSpotValidationToken(spot.id),
    spot: {
      id: spot.id,
      name: spot.name,
      isActive: spot.is_active,
    },
  });
}
