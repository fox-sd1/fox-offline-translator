import { useState } from "react";
import { ArrowLeftRight, Copy, Loader2, Sparkles, Volume2, WifiOff, Wifi } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { offlineTranslate } from "@/lib/offline-translator";
import { hasPack } from "@/lib/pack-storage";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useState } from "react";
import { pipeline } from "@xenova/transformers";

export const TextTranslator = () => {
  const [text, setText] = useState("");
  const [result, setResult] = useState("");
  const [status, setStatus] = useState("");

  const translateAction = async () => {
    setStatus("جاري تحميل المحرك... (أول مرة فقط)");
    try {
      // استدعاء المترجم (سيستخدم الـ Cache أوفلاين بعد أول تحميل)
      const translator = await pipeline('translation', 'Xenova/opus-mt-en-ar');
      
      setStatus("جاري الترجمة...");
      const output = await translator(text, {
        src_lang: 'eng_Latn',
        tgt_lang: 'ara_Arab',
      });
      
      setResult(output[0].translation_text);
      setStatus("تمت الترجمة بنجاح");
    } catch (err) {
      setStatus("حدث خطأ، تأكد من تحميل الحزمة أولاً");
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <textarea 
        className="w-full p-4 rounded-2xl bg-secondary/50 min-h-[150px]"
        placeholder="Type English text here..."
        onChange={(e) => setText(e.target.value)}
      />
      <button 
        onClick={translateAction}
        className="bg-gradient-fox text-white py-3 rounded-xl font-bold"
      >
        ترجم الآن
      </button>
      {status && <p className="text-[10px] text-center opacity-70">{status}</p>}
      {result && (
        <div className="p-4 rounded-2xl bg-card border border-fox/20 text-right font-medium">
          {result}
        </div>
      )}
    </div>
  );
};

type Lang = "ar" | "en";

const LANG_LABEL: Record<Lang, string> = { ar: "العربية", en: "English" };

export const TextTranslator = () => {
  const [source, setSource] = useState<Lang>("ar");
  const [target, setTarget] = useState<Lang>("en");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [mode, setMode] = useState<"offline" | "online" | null>(null);
  const [loading, setLoading] = useState(false);

  const swap = () => {
    setSource(target);
    setTarget(source);
    setInput(output);
    setOutput(input);
  };

  const translate = async () => {
    const text = input.trim();
    if (!text) return;
    setLoading(true);
    setOutput("");
    setMode(null);

    try {
      // 1) Try offline first
      const installed = await hasPack("ar-en");
      if (installed) {
        const off = await offlineTranslate(text, source, target);
        if (off && off.matchedWords / Math.max(off.totalWords, 1) >= 0.5) {
          setOutput(off.translation);
          setMode("offline");
          setLoading(false);
          return;
        }
      }

      // 2) Fallback to online AI
      if (!navigator.onLine) {
        if (installed) {
          const off = await offlineTranslate(text, source, target);
          setOutput(off?.translation ?? "تعذرت الترجمة بدون إنترنت لهذه الجملة.");
          setMode("offline");
        } else {
          toast.error("لا يوجد اتصال بالإنترنت", {
            description: "حمّل حزمة اللغة لاستخدام الترجمة بدون نت.",
          });
        }
        setLoading(false);
        return;
      }

      const { data, error } = await supabase.functions.invoke("translate", {
        body: { mode: "text", text, source, target },
      });
      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).error);

      setOutput((data as any).translation ?? "");
      setMode("online");
    } catch (e: any) {
      toast.error("فشلت الترجمة", { description: e?.message ?? "حاول مرة أخرى" });
    } finally {
      setLoading(false);
    }
  };

  const copy = async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    toast.success("تم النسخ");
  };

  const speak = () => {
    if (!output) return;
    const u = new SpeechSynthesisUtterance(output);
    u.lang = target === "ar" ? "ar-SA" : "en-US";
    speechSynthesis.speak(u);
  };

  return (
    <Card className="p-5 shadow-card border-border/60 animate-fade-in">
      {/* Lang selector */}
      <div className="flex items-center justify-between gap-2 mb-4">
        <button
          onClick={() => setSource(source === "ar" ? "en" : "ar")}
          className="flex-1 rounded-xl border border-border bg-card px-4 py-2.5 font-semibold text-sm transition-smooth hover:bg-secondary"
        >
          {LANG_LABEL[source]}
        </button>
        <Button
          onClick={swap}
          variant="ghost"
          size="icon"
          className="rounded-full bg-gradient-fox text-primary-foreground shadow-fox hover:opacity-90 shrink-0"
          aria-label="تبديل"
        >
          <ArrowLeftRight className="size-4" />
        </Button>
        <button
          onClick={() => setTarget(target === "ar" ? "en" : "ar")}
          className="flex-1 rounded-xl border border-border bg-card px-4 py-2.5 font-semibold text-sm transition-smooth hover:bg-secondary"
        >
          {LANG_LABEL[target]}
        </button>
      </div>

      {/* Input */}
      <Textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder={source === "ar" ? "اكتب النص هنا..." : "Type your text here..."}
        dir={source === "ar" ? "rtl" : "ltr"}
        className="min-h-[120px] resize-none text-base bg-secondary/50 border-border/60 rounded-2xl"
        maxLength={2000}
      />
      <div className="flex items-center justify-between mt-2 mb-4">
        <span className="text-xs text-muted-foreground">{input.length}/2000</span>
        <Button
          onClick={translate}
          disabled={loading || !input.trim()}
          className="bg-gradient-fox shadow-fox hover:opacity-95 gap-2"
        >
          {loading ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
          ترجم
        </Button>
      </div>

      {/* Output */}
      <div className="rounded-2xl bg-gradient-soft border border-border/60 p-4 min-h-[120px] relative">
        {mode && (
          <Badge
            variant="outline"
            className={`absolute top-3 ${target === "ar" ? "left-3" : "right-3"} gap-1 text-xs ${
              mode === "offline"
                ? "bg-success/10 text-success border-success/30"
                : "bg-primary/10 text-primary border-primary/30"
            }`}
          >
            {mode === "offline" ? <WifiOff className="size-3" /> : <Wifi className="size-3" />}
            {mode === "offline" ? "أوفلاين" : "أونلاين"}
          </Badge>
        )}
        <p
          dir={target === "ar" ? "rtl" : "ltr"}
          className="text-base leading-relaxed pr-12 pl-12 min-h-[60px] whitespace-pre-wrap"
        >
          {output || (
            <span className="text-muted-foreground text-sm">
              ستظهر الترجمة هنا...
            </span>
          )}
        </p>
        {output && (
          <div className="flex gap-1 mt-3">
            <Button onClick={copy} variant="ghost" size="icon" aria-label="نسخ">
              <Copy className="size-4" />
            </Button>
            <Button onClick={speak} variant="ghost" size="icon" aria-label="نطق">
              <Volume2 className="size-4" />
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
};
