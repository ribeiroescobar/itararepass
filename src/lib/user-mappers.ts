import "server-only";

export type DbUser = {
  id: string;
  email: string;
  name: string;
  whatsapp: string | null;
  origin_city: string | null;
  age_group: string | null;
  cnpj: string | null;
  business_name: string | null;
  position: string | null;
  tipo_usuario: string;
  role: "tourist" | "merchant" | "admin";
  approved: boolean;
  created_at: string;
  completed: boolean;
  interest: string | null;
  discovery_source: string | null;
  discovery_source_other: string | null;
};

export function mapUserProfile(row: DbUser) {
  return {
    uid: row.id,
    email: row.email,
    name: row.name,
    whatsapp: row.whatsapp ?? undefined,
    originCity: row.origin_city ?? undefined,
    ageGroup: row.age_group ?? undefined,
    cnpj: row.cnpj ?? undefined,
    businessName: row.business_name ?? undefined,
    position: row.position ?? undefined,
    tipo_usuario: row.tipo_usuario,
    role: row.role,
    approved: row.approved,
    createdAt: new Date(row.created_at).getTime(),
    completed: row.completed,
    interest: row.interest ?? undefined,
    discoverySource: row.discovery_source ?? undefined,
    discoverySourceOther: row.discovery_source_other ?? undefined,
  };
}
