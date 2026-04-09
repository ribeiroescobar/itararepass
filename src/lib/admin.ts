import "server-only";
import { dbQuery } from "@/lib/db";
import { getSessionFromCookies } from "@/lib/session";

type SessionUser = {
  id: string;
  email: string;
  role: "tourist" | "merchant" | "admin";
  approved: boolean;
  tipo_usuario: string;
};

async function getSessionUser() {
  const session = getSessionFromCookies();
  if (!session) return { ok: false as const, reason: "unauthorized" };

  const userRes = await dbQuery<SessionUser>(
    "SELECT id, email, role, approved, tipo_usuario FROM users WHERE id = $1",
    [session.sub]
  );

  const user = userRes.rows[0];
  if (!user) return { ok: false as const, reason: "unauthorized" };

  return { ok: true as const, session, user };
}

export async function requireAdmin() {
  const sessionUser = await getSessionUser();
  if (!sessionUser.ok) return sessionUser;

  const { user } = sessionUser;
  const isMaster = user.tipo_usuario === "admin_master";
  const isAdmin = user.role === "admin" && user.approved;

  if (!isMaster && !isAdmin) {
    return { ok: false as const, reason: "forbidden" };
  }

  return { ok: true as const, session: sessionUser.session, isMaster, user };
}

export async function requireAdminMaster() {
  const sessionUser = await getSessionUser();
  if (!sessionUser.ok) return sessionUser;

  const { user } = sessionUser;
  const isMaster = user.tipo_usuario === "admin_master";

  if (!isMaster) {
    return { ok: false as const, reason: "forbidden" };
  }

  return { ok: true as const, session: sessionUser.session, isMaster, user };
}

export async function requireMerchant() {
  const sessionUser = await getSessionUser();
  if (!sessionUser.ok) return sessionUser;

  const { user } = sessionUser;
  const isMaster = user.tipo_usuario === "admin_master";
  const isMerchant = user.role === "merchant" && user.approved;

  if (!isMaster && !isMerchant) {
    return { ok: false as const, reason: "forbidden" };
  }

  return { ok: true as const, session: sessionUser.session, isMaster, user };
}
