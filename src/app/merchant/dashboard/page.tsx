"use client";

import React, { useState, useEffect } from "react";
import { useItarare } from "@/hooks/use-itarare";
import { BottomNav } from "@/components/BottomNav";
import { QRScanner } from "@/components/QRScanner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  QrCode,
  Store,
  TrendingUp,
  History,
  User,
  Loader2,
  ShieldAlert,
  Clock,
  PlusCircle,
  BadgePercent,
  Pencil,
  Power,
  RotateCcw,
  ShieldCheck,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type Establishment = {
  id: string;
  name: string;
  description?: string;
  address?: string;
  imageUrl?: string;
  category?: string;
  isActive?: boolean;
  premiumEnabled?: boolean;
};

type ManagedCoupon = {
  id: string;
  establishmentId: string;
  establishmentName: string;
  title: string;
  discount: string;
  requirementLabel?: string | null;
  requiresProfile?: boolean;
  requiresLodging?: boolean;
  minAdventureSpots?: number | null;
  isPremium?: boolean;
  image?: string | null;
  isActive?: boolean;
};

export default function MerchantDashboard() {
  const [showScanner, setShowScanner] = useState(false);
  const { isUserLoading, profile } = useItarare();
  const router = useRouter();
  const [establishments, setEstablishments] = useState<Establishment[]>([]);
  const [managedCoupons, setManagedCoupons] = useState<ManagedCoupon[]>([]);
  const [isSavingEst, setIsSavingEst] = useState(false);
  const [isSavingCoupon, setIsSavingCoupon] = useState(false);
  const [editEstId, setEditEstId] = useState<string | null>(null);
  const [editCouponId, setEditCouponId] = useState<string | null>(null);
  const [estName, setEstName] = useState("");
  const [estDescription, setEstDescription] = useState("");
  const [estAddress, setEstAddress] = useState("");
  const [estImageUrl, setEstImageUrl] = useState("");
  const [estCategory, setEstCategory] = useState("");
  const [couponEstId, setCouponEstId] = useState("");
  const [couponTitle, setCouponTitle] = useState("");
  const [couponDiscount, setCouponDiscount] = useState("");
  const [couponMinAdventures, setCouponMinAdventures] = useState("");
  const [couponRequiresProfile, setCouponRequiresProfile] = useState(false);
  const [couponRequiresLodging, setCouponRequiresLodging] = useState(false);
  const [couponIsPremium, setCouponIsPremium] = useState(false);
  const [couponImageUrl, setCouponImageUrl] = useState("");

  const isMaster = profile?.tipo_usuario === "admin_master";
  const canAccessCommercialPanel = profile?.role === "merchant" || isMaster;

  useEffect(() => {
    if (!isUserLoading && !profile) {
      router.push("/login");
    }
  }, [isUserLoading, profile, router]);

  const refreshEstablishments = () => {
    fetch("/api/merchant/establishments")
      .then((res) => res.json())
      .then((data) => setEstablishments(data.establishments || []))
      .catch(() => setEstablishments([]));
  };

  const refreshCoupons = () => {
    fetch("/api/merchant/coupons")
      .then((res) => res.json())
      .then((data) => setManagedCoupons(data.coupons || []))
      .catch(() => setManagedCoupons([]));
  };

  useEffect(() => {
    if (!profile || !canAccessCommercialPanel) return;
    refreshEstablishments();
    refreshCoupons();
  }, [profile, canAccessCommercialPanel]);

  const resetEstForm = () => {
    setEditEstId(null);
    setEstName("");
    setEstDescription("");
    setEstAddress("");
    setEstImageUrl("");
    setEstCategory("");
  };

  const resetCouponForm = () => {
    setEditCouponId(null);
    setCouponEstId("");
    setCouponTitle("");
    setCouponDiscount("");
    setCouponMinAdventures("");
    setCouponRequiresProfile(false);
    setCouponRequiresLodging(false);
    setCouponIsPremium(false);
    setCouponImageUrl("");
  };

  const handleScan = () => {
    toast({
      title: "Beneficio aplicado!",
      description: "O cupom foi validado com sucesso no PDV.",
    });
    setShowScanner(false);
  };

  const handleCreateEstablishment = async () => {
    if (!estName.trim()) return;
    setIsSavingEst(true);
    try {
      const payload = {
        name: estName,
        description: estDescription,
        address: estAddress,
        imageUrl: estImageUrl,
        category: estCategory,
      };

      const res = await fetch(
        editEstId ? `/api/merchant/establishments/${editEstId}` : "/api/merchant/establishments",
        {
          method: editEstId ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 403) {
          throw new Error("Sem permissao. Sua conta precisa estar aprovada.");
        }
        throw new Error(data?.error || "Erro ao salvar estabelecimento.");
      }

      if (!editEstId) {
        setEstablishments((prev) => [data.establishment, ...prev]);
      } else {
        refreshEstablishments();
      }

      resetEstForm();
      toast({ title: editEstId ? "Estabelecimento atualizado!" : "Estabelecimento criado!" });
    } catch (err: any) {
      toast({ variant: "destructive", title: "Falha ao salvar", description: err.message });
    } finally {
      setIsSavingEst(false);
    }
  };

  const handleSaveCoupon = async () => {
    if (!couponEstId || !couponTitle.trim() || !couponDiscount.trim()) return;
    setIsSavingCoupon(true);
    try {
      const payload = {
        establishmentId: couponEstId,
        title: couponTitle,
        discount: couponDiscount,
        minAdventureSpots: couponMinAdventures ? Number(couponMinAdventures) : undefined,
        requiresProfile: couponRequiresProfile,
        requiresLodging: couponRequiresLodging,
        isPremium: couponIsPremium,
        image: couponImageUrl || undefined,
      };

      const res = await fetch(
        editCouponId ? `/api/merchant/coupons/${editCouponId}` : "/api/merchant/coupons",
        {
          method: editCouponId ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 403) {
          throw new Error("Sem permissao. Sua conta precisa estar aprovada ou ter premium liberado.");
        }
        throw new Error(data?.error || "Erro ao salvar cupom.");
      }

      refreshCoupons();
      resetCouponForm();
      toast({ title: editCouponId ? "Cupom atualizado!" : "Cupom criado!" });
    } catch (err: any) {
      toast({ variant: "destructive", title: "Falha ao salvar", description: err.message });
    } finally {
      setIsSavingCoupon(false);
    }
  };

  const handleEditEst = (est: Establishment) => {
    setEditEstId(est.id);
    setEstName(est.name || "");
    setEstDescription(est.description || "");
    setEstAddress(est.address || "");
    setEstImageUrl(est.imageUrl || "");
    setEstCategory(est.category || "");
  };

  const handleEditCoupon = (coupon: ManagedCoupon) => {
    setEditCouponId(coupon.id);
    setCouponEstId(coupon.establishmentId);
    setCouponTitle(coupon.title || "");
    setCouponDiscount(coupon.discount || "");
    setCouponMinAdventures(coupon.minAdventureSpots ? String(coupon.minAdventureSpots) : "");
    setCouponRequiresProfile(!!coupon.requiresProfile);
    setCouponRequiresLodging(!!coupon.requiresLodging);
    setCouponIsPremium(!!coupon.isPremium);
    setCouponImageUrl(coupon.image || "");
  };

  const handleDeactivateEst = async (id: string) => {
    await fetch(`/api/merchant/establishments/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: false }),
    });
    refreshEstablishments();
  };

  const handleReactivateEst = async (id: string) => {
    await fetch(`/api/merchant/establishments/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: true }),
    });
    refreshEstablishments();
  };

  const handleDeactivateCoupon = async (id: string) => {
    await fetch(`/api/merchant/coupons/${id}`, { method: "DELETE" });
    refreshCoupons();
  };

  const handleReactivateCoupon = async (id: string) => {
    await fetch(`/api/merchant/coupons/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: true }),
    });
    refreshCoupons();
  };

  if (isUserLoading) {
    return (
      <div className="min-h-screen bg-[#0d1a14] flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
        <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em] mt-4 text-center">
          Verificando credenciais...
        </p>
      </div>
    );
  }

  if (profile?.role === "merchant" && !profile.approved) {
    return (
      <div className="min-h-screen bg-[#0d1a14] flex flex-col items-center justify-center p-8 text-center">
        <div className="w-24 h-24 bg-blue-500/10 rounded-[2rem] flex items-center justify-center border border-blue-500/20 mb-8 animate-pulse">
          <Clock className="w-10 h-10 text-blue-400" />
        </div>
        <h1 className="text-2xl font-black text-white uppercase italic tracking-tighter mb-4">Cadastro em Analise</h1>
        <p className="text-sm text-white/50 leading-relaxed max-w-xs mb-8">
          Ola, <strong>{profile.name}</strong>! Sua solicitacao de parceiro foi recebida. A Secretaria de Turismo de Itarare validara seus dados em ate 48h uteis.
        </p>
        <Button onClick={() => router.push("/profile")} variant="outline" className="border-white/10 text-white/40 uppercase font-black text-[10px] tracking-widest rounded-2xl h-12 px-8">
          Voltar ao Perfil
        </Button>
        <BottomNav />
      </div>
    );
  }

  if (!canAccessCommercialPanel) {
    return (
      <div className="min-h-screen bg-[#0d1a14] flex flex-col items-center justify-center p-8 text-center">
        <ShieldAlert className="w-12 h-12 text-red-500 mb-4" />
        <h1 className="text-xl font-black text-white uppercase italic">Acesso Restrito</h1>
        <p className="text-xs text-white/40 mt-2 uppercase font-bold">
          Esta area e exclusiva para parceiros comerciais e administracao master.
        </p>
        <Button onClick={() => router.push("/profile")} className="mt-8 bg-primary rounded-2xl h-12 px-8 font-black uppercase text-[10px]">Ir para Perfil</Button>
      </div>
    );
  }

  const activeEstablishments = establishments.filter((e) => e.isActive !== false);
  const inactiveEstablishments = establishments.filter((e) => e.isActive === false);
  const activeCoupons = managedCoupons.filter((coupon) => coupon.isActive !== false);
  const inactiveCoupons = managedCoupons.filter((coupon) => coupon.isActive === false);

  return (
    <div className="min-h-screen bg-[#0d1a14] pb-32 px-6">
      <header className="pt-10 pb-8 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-white uppercase tracking-tight italic">
            {isMaster ? "Painel Comercial Global" : "Painel do Comerciante"}
          </h1>
          <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest mt-1">
            {isMaster ? "Gestao de Cupons e Beneficios" : "Gestao de Recompensas B2B"}
          </p>
        </div>
        <div className="w-12 h-12 bg-primary/20 rounded-2xl flex items-center justify-center border border-primary/30 shadow-xl shadow-primary/10">
          {isMaster ? <ShieldCheck className="w-6 h-6 text-primary" /> : <Store className="w-6 h-6 text-primary" />}
        </div>
      </header>

      <main className="max-w-3xl mx-auto space-y-6">
        <Card className="bg-primary/5 border-primary/20 p-8 rounded-[3rem] text-center space-y-6 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-10 opacity-5">
            <Store className="w-32 h-32 text-primary" />
          </div>

          <div className="w-20 h-20 bg-primary/20 rounded-3xl flex items-center justify-center mx-auto shadow-2xl shadow-primary/20 relative z-10">
            <QrCode className="w-10 h-10 text-primary" />
          </div>
          <div className="relative z-10">
            <h2 className="text-xl font-black text-white uppercase italic tracking-tight">Validar Turista</h2>
            <p className="text-xs text-white/40 mt-2 leading-relaxed max-w-[280px] mx-auto">
              Escaneie o QR Code do passaporte digital do turista para confirmar check-ins e dar baixa no beneficio.
            </p>
          </div>
          <Button
            onClick={() => setShowScanner(true)}
            className="w-full bg-primary hover:bg-primary/90 text-white font-black h-16 rounded-[2rem] text-xs uppercase tracking-widest shadow-xl shadow-primary/20 relative z-10 transition-all active:scale-95"
          >
            Abrir Scanner de Vendas
          </Button>
        </Card>

        <div className="grid grid-cols-2 gap-4">
          <Card className="bg-white/5 border-white/10 p-6 rounded-[2.5rem] shadow-xl">
            <TrendingUp className="w-5 h-5 text-green-500 mb-3" />
            <p className="text-2xl font-black text-white">{activeCoupons.length}</p>
            <p className="text-[9px] text-white/40 font-bold uppercase tracking-widest">Cupons ativos</p>
          </Card>
          <Card className="bg-white/5 border-white/10 p-6 rounded-[2.5rem] shadow-xl">
            <User className="w-5 h-5 text-blue-500 mb-3" />
            <p className="text-2xl font-black text-white">{activeEstablishments.length}</p>
            <p className="text-[9px] text-white/40 font-bold uppercase tracking-widest">Estabelecimentos ativos</p>
          </Card>
        </div>

        <section className="space-y-4">
          <div className="flex items-center gap-2 px-2">
            <History className="w-4 h-4 text-white/20" />
            <h3 className="text-[10px] font-black text-white/40 uppercase tracking-widest">Atividade Recente</h3>
          </div>
          <div className="text-center py-12 bg-white/5 rounded-[2.5rem] border border-dashed border-white/10">
            <p className="text-[10px] text-white/20 font-bold uppercase">Nenhuma atividade registrada hoje</p>
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-center gap-2 px-2">
            <PlusCircle className="w-4 h-4 text-white/20" />
            <h3 className="text-[10px] font-black text-white/40 uppercase tracking-widest">
              {editEstId ? "Editar Estabelecimento" : "Cadastrar Estabelecimento"}
            </h3>
          </div>
          <Card className="bg-white/5 border-white/10 p-6 rounded-[2.5rem] space-y-4">
            <Input placeholder="Nome do estabelecimento" value={estName} onChange={(e) => setEstName(e.target.value)} className="bg-black/40 border-white/5 rounded-2xl h-12 text-white" />
            <Textarea placeholder="Descricao" value={estDescription} onChange={(e) => setEstDescription(e.target.value)} className="bg-black/40 border-white/5 rounded-2xl text-white min-h-[80px]" />
            <Input placeholder="Endereco" value={estAddress} onChange={(e) => setEstAddress(e.target.value)} className="bg-black/40 border-white/5 rounded-2xl h-12 text-white" />
            <Input placeholder="URL da imagem" value={estImageUrl} onChange={(e) => setEstImageUrl(e.target.value)} className="bg-black/40 border-white/5 rounded-2xl h-12 text-white" />
            <Input placeholder="Categoria (ex: hospedagem, restaurante)" value={estCategory} onChange={(e) => setEstCategory(e.target.value)} className="bg-black/40 border-white/5 rounded-2xl h-12 text-white" />
            <div className="flex gap-3">
              <Button onClick={handleCreateEstablishment} disabled={isSavingEst} className="flex-1 bg-primary h-12 rounded-2xl font-black uppercase text-[10px]">
                {isSavingEst ? "Salvando..." : editEstId ? "Atualizar Estabelecimento" : "Salvar Estabelecimento"}
              </Button>
              {editEstId && (
                <Button variant="outline" onClick={resetEstForm} className="border-white/10 text-white/60 h-12 rounded-2xl text-[10px] uppercase font-black">
                  Cancelar
                </Button>
              )}
            </div>
          </Card>
        </section>

        <section className="space-y-4">
          <div className="flex items-center gap-2 px-2">
            <Store className="w-4 h-4 text-white/20" />
            <h3 className="text-[10px] font-black text-white/40 uppercase tracking-widest">Estabelecimentos Ativos</h3>
          </div>
          <Card className="bg-white/5 border-white/10 p-6 rounded-[2.5rem] space-y-3">
            {activeEstablishments.length === 0 ? (
              <div className="text-center py-10 text-white/30 text-xs">Nenhum estabelecimento ativo</div>
            ) : (
              activeEstablishments.map((est) => (
                <div key={est.id} className="flex items-center justify-between bg-white/5 border border-white/10 rounded-2xl px-4 py-3">
                  <div>
                    <p className="text-sm font-black text-white">{est.name}</p>
                    <p className="text-[9px] text-white/40 uppercase">{est.category || "Sem categoria"}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" className="border-white/10 text-white/60" onClick={() => handleEditEst(est)}>
                      <Pencil className="w-4 h-4 mr-2" /> Editar
                    </Button>
                    <Button variant="outline" className="border-white/10 text-white/50" onClick={() => handleDeactivateEst(est.id)}>
                      <Power className="w-4 h-4 mr-2" /> Desativar
                    </Button>
                  </div>
                </div>
              ))
            )}
          </Card>
        </section>

        <section className="space-y-4">
          <div className="flex items-center gap-2 px-2">
            <Store className="w-4 h-4 text-white/20" />
            <h3 className="text-[10px] font-black text-white/40 uppercase tracking-widest">Estabelecimentos Desativados</h3>
          </div>
          <Card className="bg-white/5 border-white/10 p-6 rounded-[2.5rem] space-y-3">
            {inactiveEstablishments.length === 0 ? (
              <div className="text-center py-10 text-white/30 text-xs">Nenhum estabelecimento desativado</div>
            ) : (
              inactiveEstablishments.map((est) => (
                <div key={est.id} className="flex items-center justify-between bg-white/5 border border-white/10 rounded-2xl px-4 py-3">
                  <div>
                    <p className="text-sm font-black text-white">{est.name}</p>
                    <p className="text-[9px] text-white/40 uppercase">{est.category || "Sem categoria"}</p>
                  </div>
                  <Button variant="outline" className="border-white/10 text-white/50" onClick={() => handleReactivateEst(est.id)}>
                    <RotateCcw className="w-4 h-4 mr-2" /> Reativar
                  </Button>
                </div>
              ))
            )}
          </Card>
        </section>

        <section className="space-y-4">
          <div className="flex items-center gap-2 px-2">
            <BadgePercent className="w-4 h-4 text-white/20" />
            <h3 className="text-[10px] font-black text-white/40 uppercase tracking-widest">
              {editCouponId ? "Editar Cupom" : "Criar Cupom"}
            </h3>
          </div>
          <Card className="bg-white/5 border-white/10 p-6 rounded-[2.5rem] space-y-4">
            <Select value={couponEstId} onValueChange={setCouponEstId}>
              <SelectTrigger className="bg-black/40 border-white/5 rounded-2xl h-12 text-white">
                <SelectValue placeholder="Selecione o estabelecimento" />
              </SelectTrigger>
              <SelectContent className="bg-[#0d1a14] border-white/10 text-white rounded-2xl">
                {establishments.map((est) => (
                  <SelectItem key={est.id} value={est.id}>{est.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input placeholder="Titulo do cupom" value={couponTitle} onChange={(e) => setCouponTitle(e.target.value)} className="bg-black/40 border-white/5 rounded-2xl h-12 text-white" />
            <Input placeholder="Desconto (ex: 15% OFF)" value={couponDiscount} onChange={(e) => setCouponDiscount(e.target.value)} className="bg-black/40 border-white/5 rounded-2xl h-12 text-white" />
            <Input placeholder="Min. visitas aventura (opcional)" value={couponMinAdventures} onChange={(e) => setCouponMinAdventures(e.target.value)} className="bg-black/40 border-white/5 rounded-2xl h-12 text-white" />
            <Input placeholder="URL da imagem do cupom (opcional)" value={couponImageUrl} onChange={(e) => setCouponImageUrl(e.target.value)} className="bg-black/40 border-white/5 rounded-2xl h-12 text-white" />
            <div className="flex items-center justify-between text-white/60 text-[10px] font-black uppercase">
              Completar Perfil
              <Switch checked={couponRequiresProfile} onCheckedChange={setCouponRequiresProfile} />
            </div>
            <div className="flex items-center justify-between text-white/60 text-[10px] font-black uppercase">
              Check-in em Hotel
              <Switch checked={couponRequiresLodging} onCheckedChange={setCouponRequiresLodging} />
            </div>
            <div className="flex items-center justify-between text-white/60 text-[10px] font-black uppercase">
              Destaque Premium
              <Switch checked={couponIsPremium} onCheckedChange={setCouponIsPremium} disabled={!isMaster} />
            </div>
            {!isMaster && (
              <p className="text-[9px] text-white/30 uppercase tracking-widest">
                Recurso premium liberado somente pelo admin master.
              </p>
            )}
            <div className="flex gap-3">
              <Button onClick={handleSaveCoupon} disabled={isSavingCoupon} className="flex-1 bg-primary h-12 rounded-2xl font-black uppercase text-[10px]">
                {isSavingCoupon ? "Salvando..." : editCouponId ? "Atualizar Cupom" : "Criar Cupom"}
              </Button>
              {editCouponId && (
                <Button variant="outline" onClick={resetCouponForm} className="border-white/10 text-white/60 h-12 rounded-2xl text-[10px] uppercase font-black">
                  Cancelar
                </Button>
              )}
            </div>
          </Card>
        </section>

        <section className="space-y-4">
          <div className="flex items-center gap-2 px-2">
            <BadgePercent className="w-4 h-4 text-white/20" />
            <h3 className="text-[10px] font-black text-white/40 uppercase tracking-widest">Cupons Ativos</h3>
          </div>
          <Card className="bg-white/5 border-white/10 p-6 rounded-[2.5rem] space-y-3">
            {activeCoupons.length === 0 ? (
              <div className="text-center py-10 text-white/30 text-xs">Nenhum cupom ativo</div>
            ) : (
              activeCoupons.map((coupon) => (
                <div key={coupon.id} className="flex items-center justify-between bg-white/5 border border-white/10 rounded-2xl px-4 py-3 gap-4">
                  <div>
                    <p className="text-sm font-black text-white">{coupon.title}</p>
                    <p className="text-[9px] text-white/40 uppercase">{coupon.establishmentName} • {coupon.discount}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" className="border-white/10 text-white/60" onClick={() => handleEditCoupon(coupon)}>
                      <Pencil className="w-4 h-4 mr-2" /> Editar
                    </Button>
                    <Button variant="outline" className="border-white/10 text-white/50" onClick={() => handleDeactivateCoupon(coupon.id)}>
                      <Power className="w-4 h-4 mr-2" /> Desativar
                    </Button>
                  </div>
                </div>
              ))
            )}
          </Card>
        </section>

        <section className="space-y-4">
          <div className="flex items-center gap-2 px-2">
            <BadgePercent className="w-4 h-4 text-white/20" />
            <h3 className="text-[10px] font-black text-white/40 uppercase tracking-widest">Cupons Desativados</h3>
          </div>
          <Card className="bg-white/5 border-white/10 p-6 rounded-[2.5rem] space-y-3">
            {inactiveCoupons.length === 0 ? (
              <div className="text-center py-10 text-white/30 text-xs">Nenhum cupom desativado</div>
            ) : (
              inactiveCoupons.map((coupon) => (
                <div key={coupon.id} className="flex items-center justify-between bg-white/5 border border-white/10 rounded-2xl px-4 py-3 gap-4">
                  <div>
                    <p className="text-sm font-black text-white">{coupon.title}</p>
                    <p className="text-[9px] text-white/40 uppercase">{coupon.establishmentName} • {coupon.discount}</p>
                  </div>
                  <Button variant="outline" className="border-white/10 text-white/50" onClick={() => handleReactivateCoupon(coupon.id)}>
                    <RotateCcw className="w-4 h-4 mr-2" /> Reativar
                  </Button>
                </div>
              ))
            )}
          </Card>
        </section>
      </main>

      {showScanner && (
        <QRScanner onScan={handleScan} onClose={() => setShowScanner(false)} targetName="Passaporte do Turista" demoMode={false} targetId="any" />
      )}
      <BottomNav />
    </div>
  );
}
