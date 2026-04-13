import "server-only";
import { dbQuery } from "@/lib/db";
import { getSessionFromCookies } from "@/lib/session";

// Minimal fields needed to verify admin/merchant access.
type SessionUser = {
  id: string;
  email: string;
  role: "tourist" | "merchant" | "admin";
  approved: boolean;
  tipo_usuario: string;
};

// Loads the user tied to the session cookie.
async function getSessionUser() {
  const session = await getSessionFromCookies();
  if (!session) return { ok: false as const, reason: "unauthorized" };

  const userRes = await dbQuery<SessionUser>(
    "SELECT id, email, role, approved, tipo_usuario FROM users WHERE id = $1",
    [session.sub]
  );

  const user = userRes.rows[0];
  if (!user) return { ok: false as const, reason: "unauthorized" };

  return { ok: true as const, session, user };
}

// Admins are approved users or the master user.
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

// Only the master admin is allowed.
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

// Merchants are approved users; master admin has full access too.
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
