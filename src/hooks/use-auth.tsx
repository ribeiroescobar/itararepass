"use client";

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "@/hooks/use-toast";

export type UserRole =
  | "admin_master"
  | "turista"
  | "logista"
  | "logista_pendente"
  | "prefeitura"
  | "prefeitura_pendente";

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  whatsapp?: string;
  originCity?: string;
  ageGroup?: string;
  cnpj?: string;
  businessName?: string;
  position?: string;
  tipo_usuario: UserRole;
  role?: "tourist" | "merchant" | "admin";
  approved: boolean;
  createdAt: number;
  completed?: boolean;
  interest?: string;
  discoverySource?: string;
  discoverySourceOther?: string;
}

interface AuthContextType {
  user: any;
  profile: UserProfile | null;
  isUserLoading: boolean;
  isProfileLoading: boolean;
  isMaster: boolean;
  isAuthorized: (role: "admin" | "merchant") => boolean;
  saveProfile: (data: Partial<UserProfile>) => Promise<void>;
  updateUserStatus: (uid: string, data: Partial<UserProfile>) => Promise<void>;
  login: (email: string, pass: string, onFinally?: () => void) => void;
  register: (input: any, onFinally?: () => void) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);


async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers || {}),
    },
  });
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    const message = data?.error || "Erro inesperado.";
    throw new Error(message);
  }
  return data as T;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isUserLoading, setIsUserLoading] = useState(true);
  const [isProfileLoading, setIsProfileLoading] = useState(true);
  const router = useRouter();

  const isMaster = useMemo(() => profile?.tipo_usuario === "admin_master", [profile?.tipo_usuario]);

  useEffect(() => {
    let active = true;
    setIsUserLoading(true);
    setIsProfileLoading(true);

    fetchJson<{ user: any; profile: UserProfile | null }>("/api/auth/me")
      .then((data) => {
        if (!active) return;
        setUser(data.user);
        setProfile(data.profile);
      })
      .catch(() => {
        if (!active) return;
        setUser(null);
        setProfile(null);
      })
      .finally(() => {
        if (!active) return;
        setIsUserLoading(false);
        setIsProfileLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const finalProfile = useMemo(() => {
    if (!user || !profile) return null;

    let role: "tourist" | "merchant" | "admin" = "tourist";
    if (profile.tipo_usuario?.includes("logista") || profile.role === "merchant") {
      role = "merchant";
    } else if (profile.tipo_usuario?.includes("prefeitura") || profile.role === "admin") {
      role = "admin";
    }

    return { ...profile, role };
  }, [isMaster, user, profile]);

  const isAuthorized = useCallback(
    (requestedRole: "admin" | "merchant") => {
      if (isMaster) return true;
      if (!finalProfile) return false;

      if (finalProfile.role === "merchant" || finalProfile.role === "admin") {
        if (!finalProfile.approved) return false;
      }

      if (requestedRole === "admin") return finalProfile.role === "admin";
      if (requestedRole === "merchant") return finalProfile.role === "merchant";
      return false;
    },
    [isMaster, finalProfile]
  );

  const register = async (input: any, onFinally?: () => void) => {
    const { email, pass, name, role, additional } = input;
    try {
      const data = await fetchJson<{ user: any; profile: UserProfile }>("/api/auth/register", {
        method: "POST",
        body: JSON.stringify({ email, pass, name, role, additional }),
      });
      setUser(data.user);
      setProfile(data.profile);
      if (!data.profile.approved) {
        toast({ title: "Cadastro Recebido", description: "Aguarde a liberação do Administrador." });
      } else {
        toast({ title: "Bem-vindo ao Itararé Pass!" });
        if (data.profile.role === "admin") {
          router.push("/admin/dashboard");
        } else if (data.profile.role === "merchant") {
          router.push("/merchant/dashboard");
        } else {
          router.push("/explore");
        }
      }
    } catch (err: any) {
      if (err?.message?.includes("E-mail já existe")) {
        try {
          await login(email, pass, onFinally);
          return;
        } catch {
          toast({ variant: "destructive", title: "Conta já existe", description: "O e-mail informado já está em uso." });
        }
      } else {
        toast({ variant: "destructive", title: "Erro no Cadastro", description: err.message });
      }
    } finally {
      onFinally?.();
    }
  };

  const login = async (email: string, pass: string, onFinally?: () => void) => {
    try {
      const data = await fetchJson<{ user: any; profile: UserProfile }>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, pass }),
      });
      setUser(data.user);
      setProfile(data.profile);
      toast({ title: "Acesso validado!" });
      if (data.profile.role === "admin") {
        router.push("/admin/dashboard");
      } else if (data.profile.role === "merchant") {
        router.push("/merchant/dashboard");
      } else {
        router.push("/explore");
      }
    } catch (err: any) {
      const msg =
        err.message === "Credenciais inválidas."
          ? "E-mail ou senha incorretos."
          : "Erro ao acessar o portal.";
      toast({ variant: "destructive", title: "Falha na Autenticação", description: msg });
    } finally {
      onFinally?.();
    }
  };

  const saveProfile = async (data: Partial<UserProfile>) => {
    if (!user) return;
    const result = await fetchJson<{ profile: UserProfile }>("/api/profile", {
      method: "PATCH",
      body: JSON.stringify(data),
    });
    setProfile(result.profile);
  };

  const updateUserStatus = async (targetUid: string, data: Partial<UserProfile>) => {
    if (!isMaster) return;
    await fetchJson(`/api/admin/users/${targetUid}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
    toast({ title: "Acesso Liberado!", description: "O usuário já pode acessar o sistema." });
  };

  const logout = async () => {
    await fetchJson("/api/auth/logout", { method: "POST" });
    setUser(null);
    setProfile(null);
    router.replace("/login");
  };

  const value = useMemo(
    () => ({
      user,
      profile: finalProfile,
      isUserLoading,
      isProfileLoading,
      isMaster,
      isAuthorized,
      saveProfile,
      updateUserStatus,
      login,
      register,
      logout,
    }),
    [user, finalProfile, isUserLoading, isProfileLoading, isMaster, isAuthorized]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useItarareAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error("AuthProvider Error");
  return context;
}
