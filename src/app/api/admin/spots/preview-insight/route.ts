import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin";
import { generateLocationInsight } from "@/ai/flows/generate-location-insight";

export const runtime = "nodejs";

const schema = z.object({
  locationName: z.string().min(1).max(120),
  sourceSnippet: z.string().max(2000).optional(),
  language: z.enum(["pt", "en"]),
});

export async function POST(req: Request) {
  const admin = await requireAdmin();
  if (!admin.ok) {
    return NextResponse.json({ error: "Sem permissao." }, { status: admin.reason === "forbidden" ? 403 : 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados invalidos." }, { status: 400 });
  }

  try {
    const result = await generateLocationInsight(parsed.data);
    return NextResponse.json({ insight: result.insight || "" });
  } catch {
    return NextResponse.json({ error: "Nao foi possivel gerar a previa de IA agora." }, { status: 500 });
  }
}
