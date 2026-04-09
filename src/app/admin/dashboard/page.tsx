"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Users,
  Activity,
  ArrowLeft,
  CheckCircle2,
  Store,
  TrendingUp,
  BarChart3,
  RefreshCw,
  Loader2,
  Star,
  MessageSquare,
  UserCheck,
  Search,
  AlertCircle,
  DollarSign,
  ShieldCheck,
  PlusCircle,
  MapPin,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { BottomNav } from "@/components/BottomNav";
import { useItarare } from "@/hooks/use-itarare";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { toast } from "@/hooks/use-toast";

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const message = data?.error || "Erro inesperado.";
    throw new Error(message);
  }
  return data as T;
}

export default function AdminDashboardPage() {
  const { isUserLoading, profile, isMaster, t, spots, updateUserStatus, user } = useItarare();
  const [isLoaded, setIsLoaded] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [allUsers, setAllUsers] = useState<any[] | null>(null);
  const [allCheckins, setAllCheckins] = useState<any[] | null>(null);
  const [latestComments, setLatestComments] = useState<any[] | null>(null);
  const [allSpots, setAllSpots] = useState<any[]>([]);
  const [allEstablishments, setAllEstablishments] = useState<any[]>([]);
  const [isUsersLoading, setIsUsersLoading] = useState(true);
  const [isCheckinsLoading, setIsCheckinsLoading] = useState(true);
  const [isCommentsLoading, setIsCommentsLoading] = useState(true);
  const [isSpotsLoading, setIsSpotsLoading] = useState(true);
  const [isEstLoading, setIsEstLoading] = useState(true);
  const [spotId, setSpotId] = useState("");
  const [spotName, setSpotName] = useState("");
  const [spotLat, setSpotLat] = useState("");
  const [spotLng, setSpotLng] = useState("");
  const [spotType, setSpotType] = useState("adventure");
  const [spotImage, setSpotImage] = useState("");
  const [spotCapacity, setSpotCapacity] = useState("");
  const [spotSnippet, setSpotSnippet] = useState("");
  const router = useRouter();

  const isAdminMaster = profile?.tipo_usuario === "admin_master";
  const canAccessData = useMemo(() => {
    return isAdminMaster || (profile?.role === "admin" && profile?.approved);
  }, [isAdminMaster, profile]);

  const refreshData = useCallback(async () => {
    if (!canAccessData) return;
    setIsRefreshing(true);
    setIsUsersLoading(true);
    setIsCheckinsLoading(true);
    setIsCommentsLoading(true);
    setIsSpotsLoading(true);
    setIsEstLoading(true);

    try {
      const [usersData, checkinsData, commentsData, spotsData, estData] = await Promise.all([
        fetchJson<{ users: any[] }>("/api/admin/users"),
        fetchJson<{ checkins: any[] }>("/api/admin/checkins"),
        fetchJson<{ comments: any[] }>("/api/admin/comments?limit=50"),
        fetchJson<{ spots: any[] }>("/api/spots"),
        fetchJson<{ establishments: any[] }>("/api/establishments"),
      ]);
      setAllUsers(usersData.users || []);
      setAllCheckins(checkinsData.checkins || []);
      setLatestComments(commentsData.comments || []);
      setAllSpots(spotsData.spots || []);
      setAllEstablishments(estData.establishments || []);
    } catch (err: any) {
      toast({ variant: "destructive", title: "Falha ao carregar dados", description: err.message });
    } finally {
      setIsUsersLoading(false);
      setIsCheckinsLoading(false);
      setIsCommentsLoading(false);
      setIsSpotsLoading(false);
      setIsEstLoading(false);
      setIsRefreshing(false);
    }
  }, [canAccessData]);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isUserLoading && canAccessData) {
      refreshData();
    }
  }, [isUserLoading, canAccessData, refreshData]);

  useEffect(() => {
    if (!isUserLoading && !canAccessData && user) {
      toast({ variant: "destructive", title: "Acesso Negado", description: "Somente o Douglas pode acessar esta área." });
      router.replace("/explore");
    }
  }, [isUserLoading, canAccessData, router, user]);

  const stats = useMemo(() => {
    const data = {
      cities: [] as any[],
      interests: [] as any[],
      popularity: [] as any[],
      totalTourists: 0,
      activeMerchants: 0,
      pendingUsers: [] as any[],
      issImpact: 0,
      totalCheckins: allCheckins?.length || 0,
      touristList: [] as any[],
    };

    if (!allUsers) return data;

    const cityCounts: Record<string, number> = {};
    const interestCounts: Record<string, number> = {};
    const spotCounts: Record<string, number> = {};

    allUsers.forEach((u) => {
      const isMasterUser = [
        "douglasescobarribeiro@gmail.com",
        "douglas@itarare.gov.br",
        "gestor@itarare.gov.br",
      ].includes(u.email?.toLowerCase());

      if (isMasterUser) return;

      const isMerchant = u.role === "merchant" || u.tipo_usuario?.includes("logista");
      const isGov = u.tipo_usuario?.includes("prefeitura");

      if (!u.approved && (isMerchant || isGov)) {
        data.pendingUsers.push(u);
      }

      if (!isMerchant && !isGov) {
        data.totalTourists++;
        data.touristList.push(u);

        const city = u.originCity || "Outra";
        cityCounts[city] = (cityCounts[city] || 0) + 1;

        if (u.interest) {
          const intLabel = t(`interest_${u.interest}`);
          interestCounts[intLabel] = (interestCounts[intLabel] || 0) + 1;
        }
      }

      if (isMerchant && u.approved) {
        data.activeMerchants++;
      }
    });

    allCheckins?.forEach((c) => {
      spotCounts[c.spotId] = (spotCounts[c.spotId] || 0) + 1;
    });

    data.issImpact = data.totalCheckins * 15.5;

    data.cities = Object.entries(cityCounts).map(([name, value]) => ({ name, value }));
    data.interests = Object.entries(interestCounts).map(([name, count]) => ({ name, count }));

    data.popularity = spots
      .map((s) => ({
        name: s.name,
        count: spotCounts[s.id] || 0,
        fill: s.type === "lodging" ? "#3b82f6" : "#f97316",
      }))
      .sort((a, b) => b.count - a.count);

    return data;
  }, [allUsers, allCheckins, t, spots]);

  const COLORS = ["#f97316", "#3b82f6", "#10b981", "#a855f7", "#ec4899", "#eab308"];

  const handleCreateSpot = async () => {
    if (!spotId.trim() || !spotName.trim() || !spotLat || !spotLng) return;
    try {
      const res = await fetch("/api/admin/spots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: spotId.trim(),
          name: spotName.trim(),
          lat: Number(spotLat),
          lng: Number(spotLng),
          type: spotType,
          image: spotImage || undefined,
          capacity: spotCapacity ? Number(spotCapacity) : 0,
          historicalSnippet: spotSnippet || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Erro ao salvar local.");
      setSpotId("");
      setSpotName("");
      setSpotLat("");
      setSpotLng("");
      setSpotType("adventure");
      setSpotImage("");
      setSpotCapacity("");
      setSpotSnippet("");
      refreshData();
      toast({ title: "Local cadastrado!" });
    } catch (err: any) {
      toast({ variant: "destructive", title: "Falha ao salvar", description: err.message });
    }
  };

  const handleDeactivateSpot = async (id: string) => {
    await fetch(`/api/admin/spots/${id}`, { method: "DELETE" });
    refreshData();
  };

  const handleDeactivateEst = async (id: string) => {
    await fetch(`/api/merchant/establishments/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: false }),
    });
    refreshData();
  };

  if (!isLoaded || isUserLoading) {
    return (
      <div className="min-h-screen bg-[#0d1a14] flex flex-col items-center justify-center">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
        <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em] mt-6 text-center">
          Iniciando Painel Douglas...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d1a14] text-white pb-32 px-4">
      <header className="pt-10 pb-8 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/explore" className="p-3 bg-white/5 rounded-2xl border border-white/10">
              <ArrowLeft className="w-5 h-5 text-white/60" />
            </Link>
            <div>
              <h1 className="text-2xl font-black uppercase tracking-tighter italic leading-none">Gestão Itararé</h1>
              <div className="text-[9px] text-primary font-bold uppercase tracking-[0.3em] mt-1.5 flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                Administrador
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              onClick={refreshData}
              disabled={isRefreshing}
              className="bg-primary/10 border border-primary/20 rounded-xl h-12 px-4 gap-2 hover:bg-primary/20"
            >
              {isRefreshing ? <Loader2 className="w-4 h-4 animate-spin text-primary" /> : <RefreshCw className="w-4 h-4 text-primary" />}
              <span className="text-[9px] font-black uppercase tracking-widest hidden sm:inline text-primary">Atualizar Dados</span>
            </Button>
          </div>
        </div>

        {stats.totalCheckins === 0 && !isRefreshing && !isCheckinsLoading && (
          <Card className="bg-orange-500/10 border-orange-500/20 p-4 rounded-2xl flex items-center gap-4 animate-pulse">
            <AlertCircle className="text-orange-500 w-6 h-6" />
            <p className="text-[10px] font-black uppercase text-orange-200 leading-tight">
              Ainda não há check-ins registrados no banco.
            </p>
          </Card>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card className="bg-white/5 border-white/10 p-5 rounded-[2rem]">
            <Users className="w-4 h-4 text-blue-400 mb-3" />
            <p className="text-2xl font-black italic">{stats.totalTourists}</p>
            <p className="text-[8px] text-white/40 font-bold uppercase tracking-widest mt-1">Visitantes</p>
          </Card>
          <Card className="bg-white/5 border-white/10 p-5 rounded-[2rem]">
            <Store className="w-4 h-4 text-primary mb-3" />
            <p className="text-2xl font-black italic">{stats.activeMerchants}</p>
            <p className="text-[8px] text-white/40 font-bold uppercase tracking-widest mt-1">Parceiros</p>
          </Card>
          <Card className="bg-white/5 border-white/10 p-5 rounded-[2rem]">
            <Activity className="w-4 h-4 text-green-500 mb-3" />
            <p className="text-2xl font-black italic">{stats.totalCheckins}</p>
            <p className="text-[8px] text-white/40 font-bold uppercase tracking-widest mt-1">Check-ins Reais</p>
          </Card>
          <Card className="bg-primary/10 border-primary/20 p-5 rounded-[2rem]">
            <DollarSign className="w-4 h-4 text-primary mb-3" />
            <p className="text-2xl font-black italic">R$ {stats.issImpact.toFixed(0)}</p>
            <p className="text-[8px] text-primary font-bold uppercase tracking-widest mt-1">Projeção ISS</p>
          </Card>
        </div>
      </header>

      <main className="max-w-5xl mx-auto">
        <Tabs defaultValue="stats" className="space-y-6">
          <TabsList className="bg-white/5 border border-white/10 p-1.5 rounded-[1.5rem] h-14 w-full flex">
            <TabsTrigger value="stats" className="flex-1 rounded-xl font-black uppercase text-[9px] tracking-widest data-[state=active]:bg-primary">
              Análise
            </TabsTrigger>
            <TabsTrigger value="activity" className="flex-1 rounded-xl font-black uppercase text-[9px] tracking-widest data-[state=active]:bg-primary">
              Relatos
            </TabsTrigger>
            <TabsTrigger value="spots" className="flex-1 rounded-xl font-black uppercase text-[9px] tracking-widest data-[state=active]:bg-primary">
              Locais
            </TabsTrigger>
            {isAdminMaster && (
              <TabsTrigger value="approvals" className="flex-1 rounded-xl font-black uppercase text-[9px] tracking-widest data-[state=active]:bg-primary">
                Aprovações {stats.pendingUsers.length > 0 && <span className="ml-1 w-2 h-2 bg-red-500 rounded-full" />}
              </TabsTrigger>
            )}
            {isAdminMaster && (
              <TabsTrigger value="establishments" className="flex-1 rounded-xl font-black uppercase text-[9px] tracking-widest data-[state=active]:bg-primary">
                Estabelecimentos
              </TabsTrigger>
            )}
            <TabsTrigger value="users" className="flex-1 rounded-xl font-black uppercase text-[9px] tracking-widest data-[state=active]:bg-primary">
              Visitantes
            </TabsTrigger>
          </TabsList>

          <TabsContent value="stats" className="space-y-6">
            <Card className="bg-white/5 border-white/10 p-8 rounded-[3rem]">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-primary flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" /> Fluxo Georreferenciado Real
                </h3>
              </div>

              <div className="h-[350px] w-full">
                {stats.totalCheckins > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats.popularity} layout="vertical">
                      <XAxis type="number" hide />
                      <YAxis dataKey="name" type="category" stroke="rgba(255,255,255,0.4)" fontSize={9} width={110} tickLine={false} axisLine={false} />
                      <Tooltip contentStyle={{ backgroundColor: "#0d1a14", borderRadius: "1rem", border: "1px solid rgba(255,255,255,0.1)" }} />
                      <Bar dataKey="count" radius={[0, 6, 6, 0]} barSize={14} fill="#f97316" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center opacity-20">
                    <BarChart3 className="w-12 h-12 mb-4" />
                    <p className="text-xs font-black uppercase tracking-widest">Aguardando Dados</p>
                  </div>
                )}
              </div>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-white/5 border-white/10 p-8 rounded-[3rem]">
                <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-blue-400 mb-8">Origem dos Turistas</h3>
                <div className="h-[280px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={stats.cities.length > 0 ? stats.cities : [{ name: "Sem Dados", value: 1 }]} innerRadius={70} outerRadius={95} paddingAngle={8} dataKey="value">
                        {stats.cities.map((_, i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="none" />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend verticalAlign="bottom" align="center" wrapperStyle={{ fontSize: "9px" }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </Card>
              <Card className="bg-white/5 border-white/10 p-8 rounded-[3rem]">
                <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-green-500 mb-8">Interesses Declarados</h3>
                <div className="h-[280px]">
                  {stats.interests.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={stats.interests}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                        <XAxis dataKey="name" stroke="rgba(255,255,255,0.3)" fontSize={8} />
                        <Bar dataKey="count" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={35} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center opacity-20">
                      <p className="text-[10px] font-black uppercase tracking-widest">Sem cadastros</p>
                    </div>
                  )}
                </div>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="activity" className="space-y-4">
            <div className="flex items-center justify-between px-2 mb-2">
              <h3 className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em]">Relatos e Avaliações Reais</h3>
              {isCommentsLoading && <Loader2 className="w-3 h-3 animate-spin text-primary" />}
            </div>
            {!latestComments || latestComments.length === 0 ? (
              <div className="py-20 text-center bg-white/5 rounded-[3rem] border border-dashed border-white/10">
                <MessageSquare className="w-12 h-12 text-white/10 mx-auto mb-4" />
                <p className="text-[10px] font-black text-white/40 uppercase">Nenhum relato encontrado.</p>
              </div>
            ) : (
              latestComments.map((comment) => (
                <Card key={comment.id} className="bg-white/5 border-white/10 p-6 rounded-[2.5rem] flex items-start gap-5 hover:bg-white/[0.08] transition-colors">
                  <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center shrink-0 border border-primary/20">
                    <Star className="w-5 h-5 text-primary fill-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-black text-sm uppercase italic">{comment.userName}</h4>
                        <p className="text-[9px] text-primary font-bold uppercase">Local: {comment.spotName || comment.spotId}</p>
                      </div>
                      <Badge variant="outline" className="text-[8px] border-white/10 text-white/40">
                        {new Date(comment.timestamp).toLocaleDateString()}
                      </Badge>
                    </div>
                    {comment.text && <p className="text-xs text-white/60 mt-3 italic leading-relaxed">"{comment.text}"</p>}
                    <div className="flex gap-1 mt-3">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} className={`w-2.5 h-2.5 ${s <= comment.rating ? "fill-primary text-primary" : "text-white/10"}`} />
                      ))}
                    </div>
                  </div>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="spots" className="space-y-6">
            <Card className="bg-white/5 border-white/10 p-6 rounded-[2.5rem] space-y-4">
              <div className="flex items-center gap-2">
                <PlusCircle className="w-4 h-4 text-primary" />
                <h3 className="text-[10px] font-black text-white/50 uppercase tracking-widest">Cadastrar Local</h3>
              </div>
              <Input placeholder="ID (ex: rio_verde)" value={spotId} onChange={(e) => setSpotId(e.target.value)} className="bg-black/40 border-white/5 rounded-2xl h-12 text-white" />
              <Input placeholder="Nome do local" value={spotName} onChange={(e) => setSpotName(e.target.value)} className="bg-black/40 border-white/5 rounded-2xl h-12 text-white" />
              <div className="grid grid-cols-2 gap-4">
                <Input placeholder="Latitude" value={spotLat} onChange={(e) => setSpotLat(e.target.value)} className="bg-black/40 border-white/5 rounded-2xl h-12 text-white" />
                <Input placeholder="Longitude" value={spotLng} onChange={(e) => setSpotLng(e.target.value)} className="bg-black/40 border-white/5 rounded-2xl h-12 text-white" />
              </div>
              <Input placeholder="URL da imagem" value={spotImage} onChange={(e) => setSpotImage(e.target.value)} className="bg-black/40 border-white/5 rounded-2xl h-12 text-white" />
              <Input placeholder="Capacidade (opcional)" value={spotCapacity} onChange={(e) => setSpotCapacity(e.target.value)} className="bg-black/40 border-white/5 rounded-2xl h-12 text-white" />
              <Textarea placeholder="Resumo histórico (opcional)" value={spotSnippet} onChange={(e) => setSpotSnippet(e.target.value)} className="bg-black/40 border-white/5 rounded-2xl text-white min-h-[80px]" />
              <Select value={spotType} onValueChange={setSpotType}>
                <SelectTrigger className="bg-black/40 border-white/5 rounded-2xl h-12 text-white">
                  <SelectValue placeholder="Tipo de local" />
                </SelectTrigger>
                <SelectContent className="bg-[#0d1a14] border-white/10 text-white rounded-2xl">
                  <SelectItem value="adventure">Natureza</SelectItem>
                  <SelectItem value="lodging">Hospedagem</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={handleCreateSpot} className="bg-primary h-12 rounded-2xl font-black uppercase text-[10px]">
                Salvar Local
              </Button>
            </Card>

            <Card className="bg-white/5 border-white/10 p-6 rounded-[2.5rem]">
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="w-4 h-4 text-white/40" />
                <h3 className="text-[10px] font-black text-white/40 uppercase tracking-widest">Locais Ativos</h3>
              </div>
              {isSpotsLoading ? (
                <div className="text-center py-10 text-white/30 text-xs">Carregando...</div>
              ) : allSpots.length === 0 ? (
                <div className="text-center py-10 text-white/30 text-xs">Nenhum local cadastrado</div>
              ) : (
                <div className="space-y-3">
                  {allSpots.map((spot) => (
                    <div key={spot.id} className="flex items-center justify-between bg-white/5 border border-white/10 rounded-2xl px-4 py-3">
                      <div>
                        <p className="text-sm font-black text-white">{spot.name}</p>
                        <p className="text-[9px] text-white/40 uppercase">{spot.id}</p>
                      </div>
                      <Button variant="outline" className="border-white/10 text-white/50" onClick={() => handleDeactivateSpot(spot.id)}>
                        Desativar
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </TabsContent>

          {isAdminMaster && (
            <TabsContent value="establishments" className="space-y-6">
              <Card className="bg-white/5 border-white/10 p-6 rounded-[2.5rem]">
                <div className="flex items-center gap-2 mb-4">
                  <Store className="w-4 h-4 text-white/40" />
                  <h3 className="text-[10px] font-black text-white/40 uppercase tracking-widest">Estabelecimentos</h3>
                </div>
                {isEstLoading ? (
                  <div className="text-center py-10 text-white/30 text-xs">Carregando...</div>
                ) : allEstablishments.length === 0 ? (
                  <div className="text-center py-10 text-white/30 text-xs">Nenhum estabelecimento cadastrado</div>
                ) : (
                  <div className="space-y-3">
                    {allEstablishments.map((est) => (
                      <div key={est.id} className="flex items-center justify-between bg-white/5 border border-white/10 rounded-2xl px-4 py-3">
                        <div>
                          <p className="text-sm font-black text-white">{est.name}</p>
                          <p className="text-[9px] text-white/40 uppercase">{est.category || "Sem categoria"}</p>
                        </div>
                        <Button variant="outline" className="border-white/10 text-white/50" onClick={() => handleDeactivateEst(est.id)}>
                          Desativar
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </TabsContent>
          )}

          {isAdminMaster && (
            <TabsContent value="approvals" className="space-y-4">
            <h3 className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em] px-2 mb-2">Solicitações Pendentes (B2B / GOV)</h3>
            {stats.pendingUsers.length === 0 ? (
              <div className="py-20 text-center bg-white/5 rounded-[3rem] border border-dashed border-white/10">
                <CheckCircle2 className="w-12 h-12 text-green-500/20 mx-auto mb-4" />
                <p className="text-[10px] font-black text-white/40 uppercase">Tudo em dia. Nenhuma pendência.</p>
              </div>
            ) : (
              stats.pendingUsers.map((u) => (
                <Card key={u.uid} className="bg-white/5 border-white/10 p-6 rounded-[2.5rem] flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10">
                      {u.tipo_usuario?.includes("logista") ? <Store className="text-primary w-6 h-6" /> : <ShieldCheck className="text-blue-400 w-6 h-6" />}
                    </div>
                    <div>
                      <h4 className="font-black text-sm uppercase italic">{u.name || u.businessName}</h4>
                      <p className="text-[9px] text-white/40 uppercase font-bold">{u.email}</p>
                      <Badge className="mt-1 text-[7px] uppercase bg-orange-500/20 text-orange-500 border-none">
                        {u.tipo_usuario?.includes("logista") ? "Parceiro Comercial" : "Gestor Público"}
                      </Badge>
                    </div>
                  </div>
                  <Button
                    onClick={async () => {
                      await updateUserStatus(u.uid, {
                        approved: true,
                        role: "admin",
                        tipo_usuario: u.tipo_usuario.replace("_pendente", ""),
                      });
                      refreshData();
                    }}
                    className="bg-green-600 hover:bg-green-700 h-12 px-6 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-lg shadow-green-600/20"
                  >
                    <UserCheck className="w-4 h-4 mr-2" /> Aprovar
                  </Button>
                </Card>
              ))
            )}
            </TabsContent>
          )}

          <TabsContent value="users" className="space-y-4">
            <div className="flex items-center justify-between px-2 mb-2">
              <h3 className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em]">Passaportes Ativos</h3>
              <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-xl border border-white/10">
                <Search className="w-3 h-3 text-white/20" />
                <span className="text-[9px] font-bold text-white/40 uppercase">Busca Ativa</span>
              </div>
            </div>
            <Card className="bg-white/5 border-white/10 rounded-[3rem] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-white/5">
                    <tr>
                      <th className="px-8 py-5 text-[9px] font-black uppercase text-white/40">Turista</th>
                      <th className="px-8 py-5 text-[9px] font-black uppercase text-white/40">Origem</th>
                      <th className="px-8 py-5 text-[9px] font-black uppercase text-white/40">Interesse</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {isUsersLoading && !allUsers ? (
                      <tr>
                        <td colSpan={3} className="px-8 py-10 text-center opacity-40">
                          <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                        </td>
                      </tr>
                    ) : stats.touristList.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="px-8 py-10 text-center opacity-20">
                          <p className="text-[10px] font-black uppercase">Nenhum turista registrado ainda</p>
                        </td>
                      </tr>
                    ) : (
                      stats.touristList.map((u) => (
                        <tr key={u.uid} className="hover:bg-white/[0.02]">
                          <td className="px-8 py-5">
                            <p className="text-sm font-black uppercase italic">{u.name || "Anônimo"}</p>
                            <p className="text-[9px] text-white/20">{u.email}</p>
                          </td>
                          <td className="px-8 py-5">
                            <span className="text-[10px] font-black text-white/60">{u.originCity || "Outra"}</span>
                          </td>
                          <td className="px-8 py-5">
                            <Badge variant="outline" className="text-[8px] uppercase border-white/10 text-primary">
                              {t(`interest_${u.interest}`) || "Geral"}
                            </Badge>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
      <BottomNav />
    </div>
  );
}
