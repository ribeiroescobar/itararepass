
"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { MessageSquare, Camera, Send, X, User, Clock, Image as ImageIcon, Loader2, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useItarare } from "@/hooks/use-itarare";
import { toast } from "@/hooks/use-toast";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import { ptBR, enUS } from "date-fns/locale";

interface SpotCommentsProps {
  spotId: string;
}

export function SpotComments({ spotId }: SpotCommentsProps) {
  const { addComment, t, language } = useItarare();
  const [newComment, setNewComment] = useState("");
  const [photo, setPhoto] = useState<string | null>(null);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [comments, setComments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchComments = useCallback(() => {
    if (!spotId) return;
    setIsLoading(true);
    fetch(`/api/comments?spotId=${encodeURIComponent(spotId)}`)
      .then((res) => res.json())
      .then((data) => {
        setComments(data.comments || []);
      })
      .catch(() => {
        setComments([]);
      })
      .finally(() => setIsLoading(false));
  }, [spotId]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const dateLocale = language === 'pt' ? ptBR : enUS;

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Limite de 5MB no seletor (será reduzido no processamento)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        variant: "destructive",
        title: language === 'pt' ? "Arquivo muito grande" : "File too large",
        description: language === 'pt' ? "A foto deve ter no máximo 5MB." : "The photo must be at most 5MB.",
      });
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const img = new (window as any).Image();
      img.src = reader.result;
      img.onload = () => {
        // Redimensionamento automático para caber no Firestore (max 800px largura)
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 800;
        const scale = MAX_WIDTH / img.width;
        canvas.width = MAX_WIDTH;
        canvas.height = img.height * scale;
        
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        // Converte para JPEG com 70% de qualidade para reduzir drasticamente o tamanho
        const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
        setPhoto(dataUrl);
      };
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() && !photo && rating === 0) return;

    setIsSubmitting(true);
    try {
      await addComment(spotId, newComment, photo || undefined, rating);
      setNewComment("");
      setPhoto(null);
      setRating(0);
      fetchComments();
      toast({
        title: t('comment_sent'),
        description: t('experience_recorded'),
      });
    } catch (err: any) {
      console.error("Comment Error:", err);
      toast({
        variant: "destructive",
        title: "Erro ao enviar",
        description: err.message?.includes('permission') ? "Erro de permissão no banco." : "Verifique sua conexão ou tamanho da foto.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 pb-10">
      <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-6 space-y-6 shadow-2xl">
        <div className="flex items-center justify-between gap-3 mb-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/20 rounded-2xl flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-primary" />
            </div>
            <h3 className="text-sm font-black text-white uppercase tracking-widest">{t('community_memories')}</h3>
          </div>
          
          <div className="flex items-center gap-1 bg-black/40 px-3 py-2 rounded-xl border border-white/5">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => setRating(star)}
                className="transition-transform active:scale-125"
              >
                <Star 
                  className={`w-5 h-5 ${(hoverRating || rating) >= star ? 'fill-primary text-primary' : 'text-white/10'}`} 
                />
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Textarea 
            placeholder={t('experience_placeholder')}
            className="bg-black/40 border-white/5 rounded-2xl min-h-[100px] text-white placeholder:text-white/20 text-xs focus:ring-primary/20"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
          />

          {photo && (
            <div className="relative w-full aspect-video rounded-2xl overflow-hidden border border-white/10 group">
              <Image src={photo} alt="Upload preview" fill className="object-cover" />
              <button 
                type="button"
                onClick={() => setPhoto(null)}
                className="absolute top-3 right-3 p-2 bg-black/60 rounded-xl text-white hover:bg-red-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          <div className="flex gap-3">
            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              ref={fileInputRef}
              onChange={handlePhotoUpload}
            />
            <Button 
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 bg-white/5 border-white/10 rounded-2xl h-12 hover:bg-white/10 text-white/60 hover:text-white text-[10px] uppercase font-black"
            >
              <Camera className="w-4 h-4 mr-2" />
              {t('take_photo')}
            </Button>
            <Button 
              type="submit"
              disabled={isSubmitting || (!newComment.trim() && !photo && rating === 0)}
              className="flex-1 bg-primary hover:bg-primary/90 text-white font-black rounded-2xl h-12 shadow-lg shadow-primary/20 text-[10px] uppercase"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Send className="w-4 h-4 mr-2" /> {t('publish')}</>}
            </Button>
          </div>
        </form>
      </div>

      <div className="space-y-6">
        {isLoading ? (
          <div className="flex flex-col items-center py-12 gap-4">
            <Loader2 className="w-8 h-8 text-white/10 animate-spin" />
            <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">Carregando Relatos...</p>
          </div>
        ) : !comments || comments.length === 0 ? (
          <div className="text-center py-16 bg-white/5 rounded-[3rem] border border-dashed border-white/10">
            <ImageIcon className="w-12 h-12 text-white/10 mx-auto mb-4" />
            <p className="text-xs text-white/40 font-bold uppercase tracking-widest">{t('no_memories')}</p>
            <p className="text-[9px] text-white/20 mt-1 uppercase tracking-tight">{t('be_first_memory')}</p>
          </div>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="bg-white/5 border border-white/10 rounded-[2.5rem] overflow-hidden animate-in fade-in slide-in-from-bottom-4 group">
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center border border-white/5">
                      <User className="w-5 h-5 text-white/40" />
                    </div>
                    <div>
                      <p className="text-xs font-black text-white uppercase italic leading-none">{comment.userName}</p>
                      <div className="flex items-center gap-1.5 mt-1.5 opacity-40">
                        <Clock className="w-3 h-3" />
                        <span className="text-[8px] font-bold uppercase tracking-widest">
                          {formatDistanceToNow(new Date(comment.timestamp), { addSuffix: true, locale: dateLocale })}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {comment.rating > 0 && (
                    <div className="flex items-center gap-0.5 bg-black/40 px-2 py-1 rounded-lg">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} className={`w-2.5 h-2.5 ${s <= comment.rating ? 'fill-primary text-primary' : 'text-white/10'}`} />
                      ))}
                    </div>
                  )}
                </div>

                {comment.text && (
                  <p className="text-xs text-white/70 leading-relaxed font-medium">
                    {comment.text}
                  </p>
                )}

                {comment.photo && (
                  <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden border border-white/5 shadow-2xl group-hover:scale-[1.02] transition-transform duration-500">
                    <Image src={comment.photo} alt="Memory" fill className="object-cover" />
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
