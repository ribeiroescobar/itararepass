
"use client";

import React, { useState, useEffect } from "react";
import { useItarare } from "@/hooks/use-itarare";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  User, Mail, Lock, Loader2, ArrowLeft, UserPlus, LogIn, 
  Phone, MapPin, Gift, Sparkles, HelpCircle, Calendar, Heart 
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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

export default function TouristAuthPage() {
  const { login, register, isUserLoading, user, profile, language, setLanguage, t } = useItarare();
  const router = useRouter();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [originCity, setOriginCity] = useState("");
  const [ageGroup, setAgeGroup] = useState("");
  const [interest, setInterest] = useState("");
  const [discoverySource, setDiscoverySource] = useState("");
  
  const [isActionLoading, setIsActionLoading] = useState(false);

  useEffect(() => {
    if (user && profile && (profile.role === 'tourist' || profile.tipo_usuario === 'turista')) {
      router.push('/explore');
    }
  }, [user, profile, router]);

  const handleAuth = async (e: React.FormEvent, mode: 'login' | 'register') => {
    e.preventDefault();
    setIsActionLoading(true);
    if (mode === 'login') {
      login(email, password, () => setIsActionLoading(false));
    } else {
      register({ 
        email, 
        pass: password, 
        name, 
        role: 'turista',
        additional: { 
          whatsapp, 
          originCity,
          ageGroup,
          interest,
          discoverySource,
          completed: true 
        } 
      }, () => setIsActionLoading(false));
    }
  };

  return (
    <div className="min-h-screen bg-[#0d1a14] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-6 left-6 flex items-center gap-3 z-50">
        <div className="flex items-center gap-1 bg-black/60 p-1 rounded-xl border border-white/5 h-11 shadow-2xl">
          <button onClick={() => setLanguage('pt')} className={`px-2 h-9 rounded-lg transition-all flex items-center gap-2 ${language === 'pt' ? 'bg-white/10 ring-1 ring-white/20' : 'opacity-40'}`}>
            <FlagBR /><span className="text-[10px] font-black text-white">PT</span>
          </button>
          <button onClick={() => setLanguage('en')} className={`px-2 h-9 rounded-lg transition-all flex items-center gap-2 ${language === 'en' ? 'bg-white/10 ring-1 ring-white/20' : 'opacity-40'}`}>
            <FlagUS /><span className="text-[10px] font-black text-white">EN</span>
          </button>
        </div>
      </div>

      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-green-500/10 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="w-full max-w-lg space-y-8 relative z-10 pt-20 pb-20">
        <button onClick={() => router.push('/login')} className="flex items-center gap-2 text-[10px] font-black text-white/40 uppercase tracking-widest hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" /> {t('back_to_portal')}
        </button>

        <div className="flex flex-col items-center text-center space-y-4">
          <Logo />
          <div>
            <h1 className="text-3xl font-black text-white uppercase italic tracking-tighter">{t('tourist_portal_title')}</h1>
            <p className="text-[10px] text-green-400 font-bold uppercase tracking-[0.3em]">{t('explore_and_win')}</p>
          </div>
        </div>

        <Card className="bg-white/5 border-white/10 p-2 rounded-[2.5rem] shadow-2xl backdrop-blur-xl">
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid grid-cols-2 bg-black/40 rounded-[2rem] m-2 h-14">
              <TabsTrigger value="login" className="rounded-[1.5rem] font-black uppercase text-[10px] tracking-widest">{t('login_tab')}</TabsTrigger>
              <TabsTrigger value="register" className="rounded-[1.5rem] font-black uppercase text-[10px] tracking-widest">{t('register_tab')}</TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="p-6 pt-2 space-y-6">
              <form onSubmit={(e) => handleAuth(e, 'login')} className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-[9px] font-black text-white/40 uppercase tracking-widest ml-1">{t('label_email')}</Label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                    <Input type="email" required placeholder={t('placeholder_email')} value={email} onChange={(e) => setEmail(e.target.value)} className="bg-black/40 border-white/5 rounded-2xl h-14 pl-12 text-white" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-[9px] font-black text-white/40 uppercase tracking-widest ml-1">{t('label_password')}</Label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                    <Input type="password" required placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className="bg-black/40 border-white/5 rounded-2xl h-14 pl-12 text-white" />
                  </div>
                </div>
                <Button disabled={isActionLoading || isUserLoading} type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white font-black h-14 rounded-2xl text-xs uppercase tracking-widest">
                  {isActionLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><LogIn className="w-4 h-4 mr-2" /> {t('btn_access_system')}</>}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="register" className="p-6 pt-2 space-y-6">
              <div className="bg-primary/10 border border-primary/20 p-4 rounded-2xl flex items-center gap-4 mb-4">
                <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center shrink-0 border border-primary/30">
                  <Gift className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-white uppercase italic">{t('win_gift')}</p>
                  <p className="text-[9px] text-white/50 font-medium uppercase tracking-tight leading-tight mt-0.5">
                    Complete os dados abaixo e ganhe o Voucher da Casa do Artesão imediatamente!
                  </p>
                </div>
              </div>

              <form onSubmit={(e) => handleAuth(e, 'register')} className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-[9px] font-black text-white/40 uppercase tracking-widest ml-1">{t('label_name')}</Label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                    <Input required placeholder={t('placeholder_name_call')} value={name} onChange={(e) => setName(e.target.value)} className="bg-black/40 border-white/5 rounded-2xl h-14 pl-12 text-white" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[9px] font-black text-white/40 uppercase tracking-widest ml-1">{t('label_whatsapp')}</Label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                      <Input required placeholder={t('placeholder_whatsapp')} value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} className="bg-black/40 border-white/5 rounded-2xl h-14 pl-12 text-white text-[10px]" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[9px] font-black text-white/40 uppercase tracking-widest ml-1">{t('label_city')}</Label>
                    <div className="relative">
                      <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                      <Input required placeholder={t('placeholder_city')} value={originCity} onChange={(e) => setOriginCity(e.target.value)} className="bg-black/40 border-white/5 rounded-2xl h-14 pl-12 text-white text-[10px]" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[9px] font-black text-white/40 uppercase tracking-widest ml-1">{t('label_age')}</Label>
                    <Select onValueChange={setAgeGroup} required>
                      <SelectTrigger className="bg-black/40 border-white/5 rounded-2xl h-14 text-white">
                        <Calendar className="w-4 h-4 text-white/20 mr-2" />
                        <SelectValue placeholder={t('select_placeholder')} />
                      </SelectTrigger>
                      <SelectContent className="bg-[#0d1a14] border-white/10 text-white rounded-2xl">
                        <SelectItem value="18-25">{t('age_18_25')}</SelectItem>
                        <SelectItem value="26-35">{t('age_26_35')}</SelectItem>
                        <SelectItem value="36-50">{t('age_36_50')}</SelectItem>
                        <SelectItem value="50+">{t('age_50_plus')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[9px] font-black text-white/40 uppercase tracking-widest ml-1">{t('label_interest')}</Label>
                    <Select onValueChange={setInterest} required>
                      <SelectTrigger className="bg-black/40 border-white/5 rounded-2xl h-14 text-white">
                        <Heart className="w-4 h-4 text-white/20 mr-2" />
                        <SelectValue placeholder={t('select_placeholder')} />
                      </SelectTrigger>
                      <SelectContent className="bg-[#0d1a14] border-white/10 text-white rounded-2xl">
                        <SelectItem value="nature">{t('interest_nature')}</SelectItem>
                        <SelectItem value="history">{t('interest_history')}</SelectItem>
                        <SelectItem value="gastronomy">{t('interest_gastronomy')}</SelectItem>
                        <SelectItem value="sport">{t('interest_sport')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-[9px] font-black text-white/40 uppercase tracking-widest ml-1">{t('label_discovery')}</Label>
                  <Select onValueChange={setDiscoverySource} required>
                    <SelectTrigger className="bg-black/40 border-white/5 rounded-2xl h-14 text-white">
                      <HelpCircle className="w-4 h-4 text-white/20 mr-2" />
                      <SelectValue placeholder={t('discovery_placeholder')} />
                    </SelectTrigger>
                    <SelectContent className="bg-[#0d1a14] border-white/10 text-white rounded-2xl">
                      <SelectItem value="social-media">{t('source_social')}</SelectItem>
                      <SelectItem value="friends">{t('source_friends')}</SelectItem>
                      <SelectItem value="google">{t('source_google')}</SelectItem>
                      <SelectItem value="travel-agency">{t('source_agency')}</SelectItem>
                      <SelectItem value="other">{t('source_other')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-[9px] font-black text-white/40 uppercase tracking-widest ml-1">{t('label_email')}</Label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                    <Input type="email" required placeholder={t('placeholder_email')} value={email} onChange={(e) => setEmail(e.target.value)} className="bg-black/40 border-white/5 rounded-2xl h-14 pl-12 text-white" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-[9px] font-black text-white/40 uppercase tracking-widest ml-1">{t('label_password')}</Label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                    <Input type="password" required placeholder={t('placeholder_min_pass')} value={password} onChange={(e) => setPassword(e.target.value)} className="bg-black/40 border-white/5 rounded-2xl h-14 pl-12 text-white" />
                  </div>
                </div>

                <div className="pt-4">
                  <Button disabled={isActionLoading || isUserLoading} type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white font-black h-16 rounded-[2rem] text-xs uppercase tracking-widest shadow-2xl shadow-green-600/20 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                    {isActionLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Sparkles className="w-4 h-4 mr-2" /> {t('btn_create_account')}</>}
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
