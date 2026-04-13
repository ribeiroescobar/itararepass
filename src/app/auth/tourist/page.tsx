"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  Gift,
  Heart,
  HelpCircle,
  Loader2,
  Lock,
  LogIn,
  Mail,
  MapPin,
  Phone,
  Sparkles,
  User,
} from "lucide-react";
import { useItarare } from "@/hooks/use-itarare";
import { toast } from "@/hooks/use-toast";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BRAZIL_STATES } from "@/lib/brazil-states";

const FlagBR = () => (
  <svg width="20" height="14" viewBox="0 0 20 14" fill="none" xmlns="http://www.w3.org/2000/svg" className="rounded-sm shadow-sm flag-svg">
    <rect width="20" height="14" fill="#009739" />
    <path d="M10 2L18 7L10 12L2 7L10 2Z" fill="#FEDD00" />
    <circle cx="10" cy="7" r="3" fill="#012169" />
  </svg>
);

const FlagUS = () => (
  <svg width="20" height="14" viewBox="0 0 20 14" fill="none" xmlns="http://www.w3.org/2000/svg" className="rounded-sm shadow-sm flag-svg">
    <rect width="20" height="14" fill="#FFFFFF" />
    <rect width="20" height="1.07" fill="#B22234" />
    <rect y="2.15" width="20" height="1.07" fill="#B22234" />
    <rect y="4.30" width="20" height="1.07" fill="#B22234" />
    <rect y="6.46" width="20" height="1.07" fill="#B22234" />
    <rect y="8.61" width="20" height="1.07" fill="#B22234" />
    <rect y="10.76" width="20" height="1.07" fill="#B22234" />
    <rect y="12.92" width="20" height="1.07" fill="#B22234" />
    <rect width="8.6" height="7.53" fill="#3C3B6E" />
    <circle cx="1" cy="1" r="0.2" fill="white" />
    <circle cx="3" cy="1" r="0.2" fill="white" />
    <circle cx="5" cy="1" r="0.2" fill="white" />
    <circle cx="7" cy="1" r="0.2" fill="white" />
  </svg>
);

export default function TouristAuthPage() {
  const { login, register, isUserLoading, user, profile, language, setLanguage, t } = useItarare();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [originState, setOriginState] = useState("");
  const [originCity, setOriginCity] = useState("");
  const [cityOptions, setCityOptions] = useState<string[]>([]);
  const [isLoadingCities, setIsLoadingCities] = useState(false);
  const [ageGroup, setAgeGroup] = useState("");
  const [interest, setInterest] = useState("");
  const [discoverySource, setDiscoverySource] = useState("");
  const [isActionLoading, setIsActionLoading] = useState(false);

  useEffect(() => {
    if (user && profile && (profile.role === "tourist" || profile.tipo_usuario === "turista")) {
      router.push("/explore");
    }
  }, [user, profile, router]);

  useEffect(() => {
    if (!originState) {
      setCityOptions([]);
      setOriginCity("");
      return;
    }

    const controller = new AbortController();
    setIsLoadingCities(true);
    setOriginCity("");

    fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${originState}/municipios?orderBy=nome`, {
      signal: controller.signal,
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error("load-cities-failed");
        }
        return res.json();
      })
      .then((data: Array<{ nome: string }>) => {
        setCityOptions((data || []).map((city) => city.nome));
      })
      .catch((err) => {
        if (err?.name === "AbortError") return;
        setCityOptions([]);
        toast({
          variant: "destructive",
          title: t("label_city"),
          description: t("city_load_error"),
        });
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setIsLoadingCities(false);
        }
      });

    return () => controller.abort();
  }, [originState, t]);

  const handleAuth = async (e: React.FormEvent, mode: "login" | "register") => {
    e.preventDefault();
    setIsActionLoading(true);

    if (mode === "login") {
      login(email, password, () => setIsActionLoading(false));
      return;
    }

    register(
      {
        email,
        pass: password,
        name,
        role: "turista",
        additional: {
          whatsapp,
          originCity: originState ? `${originCity} - ${originState}` : originCity,
          ageGroup,
          interest,
          discoverySource,
          completed: true,
        },
      },
      () => setIsActionLoading(false)
    );
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#0d1a14] p-6">
      <div className="absolute left-6 top-6 z-50 flex items-center gap-3">
        <div className="flex h-11 items-center gap-1 rounded-xl border border-white/5 bg-black/60 p-1 shadow-2xl">
          <button
            onClick={() => setLanguage("pt")}
            className={`flex h-9 items-center gap-2 rounded-lg px-2 transition-all ${language === "pt" ? "bg-white/10 ring-1 ring-white/20" : "opacity-40"}`}
          >
            <FlagBR />
            <span className="text-[10px] font-black text-white">PT</span>
          </button>
          <button
            onClick={() => setLanguage("en")}
            className={`flex h-9 items-center gap-2 rounded-lg px-2 transition-all ${language === "en" ? "bg-white/10 ring-1 ring-white/20" : "opacity-40"}`}
          >
            <FlagUS />
            <span className="text-[10px] font-black text-white">EN</span>
          </button>
        </div>
      </div>

      <div className="pointer-events-none absolute right-[-10%] top-[-10%] h-[500px] w-[500px] rounded-full bg-green-500/10 blur-[120px]" />

      <div className="relative z-10 w-full max-w-lg space-y-8 pb-20 pt-20">
        <button
          onClick={() => router.push("/login")}
          className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/40 transition-colors hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" /> {t("back_to_portal")}
        </button>

        <div className="flex flex-col items-center space-y-4 text-center">
          <Logo />
          <div>
            <h1 className="text-3xl font-black uppercase tracking-tighter text-white italic">{t("tourist_portal_title")}</h1>
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-green-400">{t("explore_and_win")}</p>
          </div>
        </div>

        <Card className="rounded-[2.5rem] border-white/10 bg-white/5 p-2 shadow-2xl backdrop-blur-xl">
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="m-2 grid h-14 grid-cols-2 rounded-[2rem] bg-black/40">
              <TabsTrigger value="login" className="rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest">
                {t("login_tab")}
              </TabsTrigger>
              <TabsTrigger value="register" className="rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest">
                {t("register_tab")}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="space-y-6 p-6 pt-2">
              <form onSubmit={(e) => handleAuth(e, "login")} className="space-y-4">
                <div className="space-y-2">
                  <Label className="ml-1 text-[9px] font-black uppercase tracking-widest text-white/40">{t("label_email")}</Label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/20" />
                    <Input
                      type="email"
                      required
                      placeholder={t("placeholder_email")}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-14 rounded-2xl border-white/5 bg-black/40 pl-12 text-white"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="ml-1 text-[9px] font-black uppercase tracking-widest text-white/40">{t("label_password")}</Label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/20" />
                    <Input
                      type="password"
                      required
                      placeholder="........"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-14 rounded-2xl border-white/5 bg-black/40 pl-12 text-white"
                    />
                  </div>
                </div>

                <Button
                  disabled={isActionLoading || isUserLoading}
                  type="submit"
                  className="h-14 w-full rounded-2xl bg-green-600 text-xs font-black uppercase tracking-widest text-white hover:bg-green-700"
                >
                  {isActionLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <><LogIn className="mr-2 h-4 w-4" /> {t("btn_access_system")}</>}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="register" className="space-y-6 p-6 pt-2">
              <div className="mb-4 flex items-center gap-4 rounded-2xl border border-primary/20 bg-primary/10 p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-primary/30 bg-primary/20">
                  <Gift className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase text-white italic">{t("win_gift")}</p>
                  <p className="mt-0.5 text-[9px] font-medium uppercase leading-tight tracking-tight text-white/50">
                    {t("tourist_signup_gift_note")}
                  </p>
                </div>
              </div>

              <form onSubmit={(e) => handleAuth(e, "register")} className="space-y-4">
                <div className="space-y-2">
                  <Label className="ml-1 text-[9px] font-black uppercase tracking-widest text-white/40">{t("label_name")}</Label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/20" />
                    <Input
                      required
                      placeholder={t("placeholder_name_call")}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="h-14 rounded-2xl border-white/5 bg-black/40 pl-12 text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label className="ml-1 text-[9px] font-black uppercase tracking-widest text-white/40">{t("label_whatsapp")}</Label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/20" />
                      <Input
                        required
                        placeholder={t("placeholder_whatsapp")}
                        value={whatsapp}
                        onChange={(e) => setWhatsapp(e.target.value)}
                        className="h-14 rounded-2xl border-white/5 bg-black/40 pl-12 text-[10px] text-white"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="ml-1 text-[9px] font-black uppercase tracking-widest text-white/40">{t("label_state")}</Label>
                    <Select value={originState} onValueChange={setOriginState} required>
                      <SelectTrigger className="h-14 rounded-2xl border-white/5 bg-black/40 text-white">
                        <MapPin className="mr-2 h-4 w-4 text-white/20" />
                        <SelectValue placeholder={t("placeholder_state")} />
                      </SelectTrigger>
                      <SelectContent className="max-h-80 rounded-2xl border-white/10 bg-[#0d1a14] text-white">
                        {BRAZIL_STATES.map((state) => (
                          <SelectItem key={state.code} value={state.code}>
                            {state.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="ml-1 text-[9px] font-black uppercase tracking-widest text-white/40">{t("label_city")}</Label>
                  <Select value={originCity} onValueChange={setOriginCity} required disabled={!originState || isLoadingCities || cityOptions.length === 0}>
                    <SelectTrigger className="h-14 rounded-2xl border-white/5 bg-black/40 text-white">
                      <MapPin className="mr-2 h-4 w-4 text-white/20" />
                      <SelectValue
                        placeholder={
                          !originState
                            ? t("select_state_first")
                            : isLoadingCities
                              ? t("loading_cities")
                              : t("placeholder_city")
                        }
                      />
                    </SelectTrigger>
                    <SelectContent className="max-h-80 rounded-2xl border-white/10 bg-[#0d1a14] text-white">
                      {cityOptions.map((city) => (
                        <SelectItem key={city} value={city}>
                          {city}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label className="ml-1 text-[9px] font-black uppercase tracking-widest text-white/40">{t("label_age")}</Label>
                    <Select onValueChange={setAgeGroup} required>
                      <SelectTrigger className="h-14 rounded-2xl border-white/5 bg-black/40 text-white">
                        <Calendar className="mr-2 h-4 w-4 text-white/20" />
                        <SelectValue placeholder={t("select_placeholder")} />
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl border-white/10 bg-[#0d1a14] text-white">
                        <SelectItem value="18-25">{t("age_18_25")}</SelectItem>
                        <SelectItem value="26-35">{t("age_26_35")}</SelectItem>
                        <SelectItem value="36-50">{t("age_36_50")}</SelectItem>
                        <SelectItem value="50+">{t("age_50_plus")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="ml-1 text-[9px] font-black uppercase tracking-widest text-white/40">{t("label_interest")}</Label>
                    <Select onValueChange={setInterest} required>
                      <SelectTrigger className="h-14 rounded-2xl border-white/5 bg-black/40 text-white">
                        <Heart className="mr-2 h-4 w-4 text-white/20" />
                        <SelectValue placeholder={t("select_placeholder")} />
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl border-white/10 bg-[#0d1a14] text-white">
                        <SelectItem value="nature">{t("interest_nature")}</SelectItem>
                        <SelectItem value="history">{t("interest_history")}</SelectItem>
                        <SelectItem value="gastronomy">{t("interest_gastronomy")}</SelectItem>
                        <SelectItem value="sport">{t("interest_sport")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="ml-1 text-[9px] font-black uppercase tracking-widest text-white/40">{t("label_discovery")}</Label>
                  <Select onValueChange={setDiscoverySource} required>
                    <SelectTrigger className="h-14 rounded-2xl border-white/5 bg-black/40 text-white">
                      <HelpCircle className="mr-2 h-4 w-4 text-white/20" />
                      <SelectValue placeholder={t("discovery_placeholder")} />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-white/10 bg-[#0d1a14] text-white">
                      <SelectItem value="social-media">{t("source_social")}</SelectItem>
                      <SelectItem value="friends">{t("source_friends")}</SelectItem>
                      <SelectItem value="google">{t("source_google")}</SelectItem>
                      <SelectItem value="travel-agency">{t("source_agency")}</SelectItem>
                      <SelectItem value="other">{t("source_other")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="ml-1 text-[9px] font-black uppercase tracking-widest text-white/40">{t("label_email")}</Label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/20" />
                    <Input
                      type="email"
                      required
                      placeholder={t("placeholder_email")}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-14 rounded-2xl border-white/5 bg-black/40 pl-12 text-white"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="ml-1 text-[9px] font-black uppercase tracking-widest text-white/40">{t("label_password")}</Label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/20" />
                    <Input
                      type="password"
                      required
                      placeholder={t("placeholder_min_pass")}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-14 rounded-2xl border-white/5 bg-black/40 pl-12 text-white"
                    />
                  </div>
                </div>

                <div className="pt-4">
                  <Button
                    disabled={isActionLoading || isUserLoading || !originState || !originCity}
                    type="submit"
                    className="group relative h-16 w-full overflow-hidden rounded-[2rem] bg-green-600 text-xs font-black uppercase tracking-widest text-white shadow-2xl shadow-green-600/20 hover:bg-green-700"
                  >
                    <div className="absolute inset-0 translate-x-[-100%] bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-1000 group-hover:translate-x-[100%]" />
                    {isActionLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <><Sparkles className="mr-2 h-4 w-4" /> {t("btn_create_account")}</>}
                  </Button>
                </div>
              </form>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
}
