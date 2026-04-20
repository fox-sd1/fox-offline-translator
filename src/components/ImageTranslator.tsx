import { useRef, useState } from "react";
import { ImagePlus, Loader2, Wifi, X, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type Lang = "ar" | "en";

export const ImageTranslator = () => {
  const [source, setSource] = useState<Lang>("en");
  const [target, setTarget] = useState<Lang>("ar");
  const [imgPreview, setImgPreview] = useState<string | null>(null);
  const [imgB64, setImgB64] = useState<string | null>(null);
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const onPick = (file: File) => {
    if (file.size > 8 * 1024 * 1024) {
      toast.error("الصورة كبيرة جداً (الحد 8MB)");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setImgPreview(dataUrl);
      setImgB64(dataUrl);
      setOutput("");
    };
    reader.readAsDataURL(file);
  };

  const clear = () => {
    setImgPreview(null);
    setImgB64(null);
    setOutput("");
    if (inputRef.current) inputRef.current.value = "";
  };

  const translate = async () => {
    if (!imgB64) return;
    if (!navigator.onLine) {
      toast.error("ترجمة الصور تحتاج اتصال بالإنترنت");
      return;
    }
    setLoading(true);
    setOutput("");
    try {
      const { data, error } = await supabase.functions.invoke("translate", {
        body: { mode: "image", imageBase64: imgB64, source, target },
      });
      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).error);
      const t = (data as any).translation ?? "";
      if (t.trim() === "NO_TEXT_FOUND") {
        toast("لم يتم العثور على نص في الصورة");
        setOutput("");
      } else {
        setOutput(t);
      }
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

  return (
    <Card className="p-5 shadow-card border-border/60 animate-fade-in">
      <div className="flex items-center gap-2 mb-4">
        <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30 gap-1 text-xs">
          <Wifi className="size-3" /> يتطلب إنترنت
        </Badge>
        <span className="text-sm text-muted-foreground">ترجمة النص داخل الصورة</span>
      </div>

      {/* Lang selector */}
      <div className="flex items-center gap-2 mb-4 text-sm">
        <span className="text-muted-foreground">من:</span>
        <button
          onClick={() => setSource(source === "ar" ? "en" : "ar")}
          className="rounded-lg border border-border bg-card px-3 py-1.5 font-semibold transition-smooth hover:bg-secondary"
        >
          {source === "ar" ? "العربية" : "English"}
        </button>
        <span className="text-muted-foreground">إلى:</span>
        <button
          onClick={() => setTarget(target === "ar" ? "en" : "ar")}
          className="rounded-lg border border-border bg-card px-3 py-1.5 font-semibold transition-smooth hover:bg-secondary"
        >
          {target === "ar" ? "العربية" : "English"}
        </button>
      </div>

      {/* Image picker */}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => e.target.files?.[0] && onPick(e.target.files[0])}
      />

      {!imgPreview ? (
        <button
          onClick={() => inputRef.current?.click()}
          className="w-full rounded-2xl border-2 border-dashed border-border/80 bg-gradient-soft p-8 flex flex-col items-center gap-3 transition-smooth hover:border-primary hover:bg-primary/5"
        >
          <div className="size-14 rounded-full bg-gradient-fox shadow-fox flex items-center justify-center">
            <ImagePlus className="size-6 text-primary-foreground" />
          </div>
          <div className="text-center">
            <p className="font-semibold">اختر صورة أو التقط واحدة</p>
            <p className="text-xs text-muted-foreground mt-1">JPG, PNG — حتى 8MB</p>
          </div>
        </button>
      ) : (
        <div className="space-y-3">
          <div className="relative rounded-2xl overflow-hidden border border-border/60">
            <img src={imgPreview} alt="معاينة" className="w-full max-h-72 object-contain bg-secondary/40" />
            <Button
              onClick={clear}
              size="icon"
              variant="secondary"
              className="absolute top-2 left-2 rounded-full size-8 shadow-soft"
              aria-label="إزالة"
            >
              <X className="size-4" />
            </Button>
          </div>
          <Button
            onClick={translate}
            disabled={loading}
            className="w-full bg-gradient-fox shadow-fox hover:opacity-95 gap-2"
          >
            {loading ? <Loader2 className="size-4 animate-spin" /> : null}
            استخراج وترجمة النص
          </Button>
        </div>
      )}

      {output && (
        <div className="mt-4 rounded-2xl bg-gradient-soft border border-border/60 p-4">
          <p
            dir={target === "ar" ? "rtl" : "ltr"}
            className="text-base leading-relaxed whitespace-pre-wrap"
          >
            {output}
          </p>
          <Button onClick={copy} variant="ghost" size="sm" className="mt-2 gap-2">
            <Copy className="size-4" /> نسخ
          </Button>
        </div>
      )}
    </Card>
  );
};
