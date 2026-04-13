import { NextResponse } from "next/server";
import { getSessionFromCookies } from "@/lib/session";
import { verifySpotValidationToken } from "@/lib/auth";
import { dbQuery } from "@/lib/db";
import { z } from "zod";

export const runtime = "nodejs";

const schema = z.object({
  token: z.string().min(1),
  spotId: z.string().min(1),
});

export async function POST(req: Request) {
  const session = await getSessionFromCookies();
  if (!session) {
    return NextResponse.json({ error: "Nao autorizado." }, { status: 401 });
  }
  if (session.role !== "tourist") {
    return NextResponse.json({ error: "Perfil sem permissao para check-in." }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados invalidos." }, { status: 400 });
  }

  let payload: { spotId: string };
  try {
    payload = verifySpotValidationToken(parsed.data.token);
  } catch {
    return NextResponse.json({ error: "QR do local invalido." }, { status: 400 });
  }

  if (payload.spotId !== parsed.data.spotId) {
    return NextResponse.json({ error: "QR nao corresponde a este local." }, { status: 400 });
  }

  const spotResult = await dbQuery("SELECT id, is_active FROM spots WHERE id = $1", [parsed.data.spotId]);
  const spot = spotResult.rows[0];
  if (!spot) {
    return NextResponse.json({ error: "Local nao encontrado." }, { status: 404 });
  }
  if (spot.is_active === false) {
    return NextResponse.json({ error: "Este local esta desativado no sistema." }, { status: 409 });
  }

  return NextResponse.json({ ok: true, spotId: parsed.data.spotId });
}
