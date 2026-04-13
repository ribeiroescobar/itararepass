"use client";

import React, { useState, useEffect } from "react";
import { useItarare } from "@/hooks/use-itarare";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Mail, Lock, Loader2, ArrowLeft, Zap, UserPlus } from "lucide-react";
import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const FlagBR = () => (
  <svg width="20" height="14" viewBox="0 0 20 14" fill="none" xmlns="http://www.w3.org/2000/svg" className="rounded-sm shadow-sm flag-svg">
    <rect width="20" height="14" fill="#009739"/><path d="M10 2L18 7L10 12L2 7L10 2Z" fill="#FEDD00"/><circle cx="10" cy="7" r="3" fill="#012169"/>
  </svg>
);

const FlagUS = () => (
  <svg width="20" height="14" viewBox="0 0 20 14" fill="none" xmlns="http://www.w3.org/2000/svg" className="rounded-sm shadow-sm flag-svg">
    <rect width="20" height="14" fill="#FFFFFF"/><rect width="20" height="1.07" fill="#B22234"/><rect y="2.15" width="20" height="1.07" fill="#B22234"/><rect y="4.30" width="20" height="1.07" fill="#B22234"/><rect y="6.46" width="20" height="1.07" fill="#B22234"/><rect y="8.61" width="20" height="1.07" fill="#B22234"/><rect y="10.76" width="20" height="1.07" fill="#B22234"/><rect y="12.92" width="20" height="1.07" fill="#B22234"/><rect width="8.6" height="7.53" fill="#3C3B6E"/><circle cx="1" cy="1" r="0.2" fill="white"/><circle cx="3" cy="1" r="0.2" fill="white"/><circle cx="5" cy="1" r="0.2" fill="white"/><circle cx="7" cy="1" r="0.2" fill="white"/>
  </svg>
);

export default function AdminAuthPage() {
  const { login, register, isUserLoading, user, profile, language, setLanguage, t } = useItarare();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isActionLoading, setIsActionLoading] = useState(false);

  useEffect(() => {
    if (user && profile && profile.role === "admin") {
      router.push(profile.approved || profile.tipo_usuario === "admin_master" ? "/admin/dashboard" : "/profile");
    }
  }, [user, profile, router]);

  const handleAuth = async (e: React.FormEvent, mode: "login" | "register") => {
    e.preventDefault();
    setIsActionLoading(true);
    if (mode === "login") {
      login(email, password, () => setIsActionLoading(false), { portal: "admin" });
    } else {
      register({ email, pass: password, name, role: "prefeitura", additional: {} }, () => setIsActionLoading(false));
    }
  };

  const demoLabel = language === "pt" ? "Demonstracao" : "Demo";
  const quickAccessLabel = language === "pt" ? "Acesso Rapido Demo" : "Quick Demo Access";
  const nameLabel = language === "pt" ? "Nome do Responsavel" : "Responsible Person";
  const namePlaceholder = language === "pt" ? "Ex: Secretaria de Turismo" : "Ex: Tourism Secretariat";
  const passwordLabel = language === "pt" ? "Defina uma Senha" : "Create a Password";
  const registerLabel = language === "pt" ? "Criar Conta Institucional" : "Create Institutional Account";

  return (
    <div className="min-h-screen bg-[#0d1a14] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-6 left-6 flex items-center gap-3 z-50">
        <div className="flex items-center gap-1 bg-black/60 p-1 rounded-xl border border-white/5 h-11 shadow-2xl">
          <button onClick={() => setLanguage("pt")} className={`px-2 h-9 rounded-lg transition-all flex items-center gap-2 ${language === "pt" ? "bg-white/10 ring-1 ring-white/20" : "opacity-40"}`}>
            <FlagBR /><span className="text-[10px] font-black text-white">PT</span>
          </button>
          <button onClick={() => setLanguage("en")} className={`px-2 h-9 rounded-lg transition-all flex items-center gap-2 ${language === "en" ? "bg-white/10 ring-1 ring-white/20" : "opacity-40"}`}>
            <FlagUS /><span className="text-[10px] font-black text-white">EN</span>
          </button>
        </div>
      </div>

      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md space-y-8 relative z-10 pt-20 sm:pt-0">
        <button onClick={() => router.push("/login")} className="flex items-center gap-2 text-[10px] font-black text-white/40 uppercase tracking-widest hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" /> {t("back_to_portal")}
        </button>

        <div className="flex flex-col items-center text-center space-y-4">
          <Logo />
          <div>
            <h1 className="text-3xl font-black text-white uppercase italic tracking-tighter">{t("admin_portal_title")}</h1>
            <p className="text-[10px] text-blue-400 font-bold uppercase tracking-[0.3em]">{t("restricted_access_admin")}</p>
          </div>
        </div>

        <Card className="bg-white/5 border-blue-500/20 p-2 rounded-[3rem] shadow-2xl backdrop-blur-xl">
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid grid-cols-2 bg-black/40 rounded-[2rem] m-2 h-14">
              <TabsTrigger value="login" className="rounded-[1.5rem] font-black uppercase text-[10px] tracking-widest">{t("login_tab")}</TabsTrigger>
              <TabsTrigger value="register" className="rounded-[1.5rem] font-black uppercase text-[10px] tracking-widest">{t("register_tab")}</TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="p-6 pt-2 space-y-6">
              <form onSubmit={(e) => handleAuth(e, "login")} className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-[9px] font-black text-white/40 uppercase tracking-widest ml-1">{t("label_institutional_email")}</Label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                    <Input type="email" required placeholder="ex: nome@itarare.gov.br" value={email} onChange={(e) => setEmail(e.target.value)} className="bg-black/40 border-white/5 rounded-2xl h-14 pl-12 text-white" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-[9px] font-black text-white/40 uppercase tracking-widest ml-1">{t("label_password")}</Label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                    <Input type="password" required placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className="bg-black/40 border-white/5 rounded-2xl h-14 pl-12 text-white" />
                  </div>
                </div>
                <Button disabled={isActionLoading || isUserLoading} type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black h-14 rounded-2xl text-xs uppercase tracking-widest">
                  {isActionLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : t("btn_access_system")}
                </Button>
              </form>

              <div className="relative">
                <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-white/5" /></div>
                <div className="relative flex justify-center text-[9px] font-black uppercase"><span className="bg-[#16261e] px-4 text-white/20">{demoLabel}</span></div>
              </div>
              <Button onClick={() => login("gestor@itarare.gov.br", "itarare2025", () => setIsActionLoading(false), { portal: "admin" })} variant="outline" className="w-full border-blue-500/20 bg-blue-500/10 hover:bg-blue-500/20 rounded-2xl h-12 text-[10px] font-black uppercase text-blue-400">
                <Zap className="w-3 h-3 mr-2 fill-blue-400" /> {quickAccessLabel}
              </Button>
            </TabsContent>

            <TabsContent value="register" className="p-6 pt-2 space-y-6">
              <form onSubmit={(e) => handleAuth(e, "register")} className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-[9px] font-black text-white/40 uppercase tracking-widest ml-1">{nameLabel}</Label>
                  <Input required placeholder={namePlaceholder} value={name} onChange={(e) => setName(e.target.value)} className="bg-black/40 border-white/5 rounded-2xl h-14 px-5 text-white" />
                </div>
                <div className="space-y-2">
                  <Label className="text-[9px] font-black text-white/40 uppercase tracking-widest ml-1">{t("label_institutional_email")}</Label>
                  <Input type="email" required placeholder="contato@itarare.gov.br" value={email} onChange={(e) => setEmail(e.target.value)} className="bg-black/40 border-white/5 rounded-2xl h-14 px-5 text-white" />
                </div>
                <div className="space-y-2">
                  <Label className="text-[9px] font-black text-white/40 uppercase tracking-widest ml-1">{passwordLabel}</Label>
                  <Input type="password" required placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className="bg-black/40 border-white/5 rounded-2xl h-14 px-5 text-white" />
                </div>
                <Button disabled={isActionLoading || isUserLoading} type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black h-14 rounded-2xl text-xs uppercase tracking-widest">
                  {isActionLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><UserPlus className="w-4 h-4 mr-2" /> {registerLabel}</>}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
}
