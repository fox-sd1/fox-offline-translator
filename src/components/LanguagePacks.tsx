import { useEffect, useState } from "react";
import { Download, Check, Trash2, Loader2, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { savePack, getPack, deletePack } from "@/lib/pack-storage";
import { buildPackMaps } from "@/lib/offline-translator";
import { AR_EN_PACK } from "@/lib/dictionary-pack";
import { toast } from "sonner";

type Lang = {
  id: string;
  name: string;
  flag: string;
  size: string;
  entries: number;
};

const LANGUAGES: Lang[] = [
  { id: "ar-en", name: "العربية ↔ الإنجليزية", flag: "🇸🇦🇬🇧", size: "~1.2 MB", entries: AR_EN_PACK.length },
];

export const LanguagePacks = () => {
  const [installed, setInstalled] = useState<Record<string, boolean>>({});
  const [progress, setProgress] = useState<Record<string, number>>({});
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const map: Record<string, boolean> = {};
      for (const l of LANGUAGES) {
        map[l.id] = !!(await getPack(l.id));
      }
      setInstalled(map);
    })();
  }, []);

  const downloadPack = async (lang: Lang) => {
    setBusy(lang.id);
    setProgress((p) => ({ ...p, [lang.id]: 0 }));

    // Simulated progressive "download" — pack is bundled but we show real UX
    for (let pct = 10; pct <= 90; pct += 15) {
      await new Promise((r) => setTimeout(r, 180));
      setProgress((p) => ({ ...p, [lang.id]: pct }));
    }

    const { ar2en, en2ar } = buildPackMaps();
    await savePack({
      id: lang.id,
      installedAt: Date.now(),
      ar2en,
      en2ar,
    });
    setProgress((p) => ({ ...p, [lang.id]: 100 }));
    setInstalled((s) => ({ ...s, [lang.id]: true }));
    setBusy(null);
    toast.success(`تم تحميل ${lang.name}`, { description: "يمكنك الآن الترجمة بدون إنترنت" });
  };

  const removePack = async (lang: Lang) => {
    await deletePack(lang.id);
    setInstalled((s) => ({ ...s, [lang.id]: false }));
    setProgress((p) => ({ ...p, [lang.id]: 0 }));
    toast(`تم حذف ${lang.name}`);
  };

  return (
    <Card className="p-5 shadow-card border-border/60 animate-fade-in">
      <div className="flex items-center gap-2 mb-4">
        <WifiOff className="size-4 text-primary" />
        <h2 className="text-lg font-bold">حزم اللغات الأوفلاين</h2>
      </div>
      <p className="text-sm text-muted-foreground mb-4">
        حمّل حزمة اللغة مرة واحدة، ثم استخدم الترجمة في أي وقت بدون اتصال بالإنترنت.
      </p>

      <div className="space-y-3">
        {LANGUAGES.map((lang) => {
          const isInstalled = installed[lang.id];
          const isBusy = busy === lang.id;
          const pct = progress[lang.id] ?? 0;

          return (
            <div
              key={lang.id}
              className="rounded-2xl border border-border/60 bg-gradient-soft p-4 transition-smooth hover:shadow-card"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xl">{lang.flag}</span>
                    <span className="font-semibold">{lang.name}</span>
                    {isInstalled && (
                      <Badge className="bg-success text-success-foreground border-0 gap-1">
                        <Check className="size-3" /> مثبتة
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {lang.entries} مدخل • {lang.size}
                  </p>
                </div>

                {isInstalled ? (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removePack(lang)}
                    aria-label="حذف الحزمة"
                  >
                    <Trash2 className="size-4 text-destructive" />
                  </Button>
                ) : (
                  <Button
                    variant="default"
                    size="sm"
                    disabled={isBusy}
                    onClick={() => downloadPack(lang)}
                    className="bg-gradient-fox shadow-fox hover:opacity-95 gap-2"
                  >
                    {isBusy ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4" />}
                    {isBusy ? "جارٍ التحميل..." : "تحميل"}
                  </Button>
                )}
              </div>

              {isBusy && pct > 0 && (
                <div className="mt-3">
                  <Progress value={pct} className="h-2" />
                  <p className="text-xs text-muted-foreground mt-1 text-center">{pct}%</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
};
