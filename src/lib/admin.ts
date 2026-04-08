import "server-only";
import { dbQuery } from "@/lib/db";
import { getSessionFromCookies } from "@/lib/session";

const MASTER_EMAILS = [
  "douglasescobarribeiro@gmail.com",
  "douglas@itarare.gov.br",
  "gestor@itarare.gov.br",
];

export async function requireAdmin() {
  const session = getSessionFromCookies();
  if (!session) return { ok: false as const, reason: "unauthorized" };

  const userRes = await dbQuery<{
    email: string;
    role: "tourist" | "merchant" | "admin";
    approved: boolean;
  }>("SELECT email, role, approved FROM users WHERE id = $1", [session.sub]);

  const user = userRes.rows[0];
  if (!user) return { ok: false as const, reason: "unauthorized" };

  const isMaster = MASTER_EMAILS.includes(user.email.toLowerCase());
  const isAdmin = user.role === "admin" && user.approved;

  if (!isMaster && !isAdmin) {
    return { ok: false as const, reason: "forbidden" };
  }

  return { ok: true as const, session, isMaster };
}
