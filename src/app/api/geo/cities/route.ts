import { NextResponse } from "next/server";
import { z } from "zod";
import { BRAZIL_STATES } from "@/lib/brazil-states";

export const runtime = "nodejs";

const schema = z.object({
  uf: z.string().length(2),
});

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const parsed = schema.safeParse({
    uf: searchParams.get("uf")?.toUpperCase(),
  });

  if (!parsed.success) {
    return NextResponse.json({ error: "UF invalida." }, { status: 400 });
  }

  const { uf } = parsed.data;
  const isKnownState = BRAZIL_STATES.some((state) => state.code === uf);
  if (!isKnownState) {
    return NextResponse.json({ error: "UF invalida." }, { status: 400 });
  }

  try {
    const response = await fetch(
      `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${uf}/municipios?orderBy=nome`,
      {
        next: { revalidate: 60 * 60 * 24 * 30 },
      }
    );

    if (!response.ok) {
      throw new Error("IBGE request failed");
    }

    const cities = (await response.json()) as Array<{ nome: string }>;

    return NextResponse.json({
      cities: cities.map((city) => city.nome),
    });
  } catch {
    return NextResponse.json({ error: "Nao foi possivel carregar as cidades." }, { status: 502 });
  }
}
