import { useEffect, useState } from "react";
import { FileText, Image as ImageIcon, Package, Wifi, WifiOff } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TextTranslator } from "@/components/TextTranslator";
import { ImageTranslator } from "@/components/ImageTranslator";
import { LanguagePacks } from "@/components/LanguagePacks";
import foxLogo from "@/assets/fox-logo.png";

const Index = () => {
  const [online, setOnline] = useState(navigator.onLine);

  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-soft">
      {/* Header */}
      <header className="sticky top-0 z-30 backdrop-blur-lg bg-background/80 border-b border-border/50">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="size-11 rounded-2xl bg-gradient-fox shadow-fox p-1.5 flex items-center justify-center">
              <img src={foxLogo} alt="Fox" className="w-full h-full object-contain" />
            </div>
            <div>
              <h1 className="text-base font-black leading-tight">
                مترجم <span className="text-gradient-fox">𝐹𝑜𝑥</span> أوفلاين
              </h1>
              <p className="text-[11px] text-muted-foreground">ترجمة بدون حدود</p>
            </div>
          </div>
          <div
            className={`flex items-center gap-1.5 text-xs font-semibold rounded-full px-2.5 py-1 ${
              online
                ? "bg-success/10 text-success"
                : "bg-muted text-muted-foreground"
            }`}
          >
            {online ? <Wifi className="size-3" /> : <WifiOff className="size-3" />}
            {online ? "متصل" : "أوفلاين"}
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-2xl mx-auto px-4 py-5 pb-12">
        <Tabs defaultValue="text" className="w-full">
          <TabsList className="grid w-full grid-cols-3 h-12 rounded-2xl bg-secondary/70 p-1.5 mb-5">
            <TabsTrigger value="text" className="rounded-xl gap-1.5 data-[state=active]:bg-card data-[state=active]:shadow-soft">
              <FileText className="size-4" />
              <span className="text-xs font-semibold">نص</span>
            </TabsTrigger>
            <TabsTrigger value="image" className="rounded-xl gap-1.5 data-[state=active]:bg-card data-[state=active]:shadow-soft">
              <ImageIcon className="size-4" />
              <span className="text-xs font-semibold">صورة</span>
            </TabsTrigger>
            <TabsTrigger value="packs" className="rounded-xl gap-1.5 data-[state=active]:bg-card data-[state=active]:shadow-soft">
              <Package className="size-4" />
              <span className="text-xs font-semibold">الحزم</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="text" className="mt-0">
            <TextTranslator />
          </TabsContent>
          <TabsContent value="image" className="mt-0">
            <ImageTranslator />
          </TabsContent>
          <TabsContent value="packs" className="mt-0">
            <LanguagePacks />
          </TabsContent>
        </Tabs>

        <footer className="mt-8 text-center text-xs text-muted-foreground">
          <p>صُنع بحب 🦊 — مترجم Fox أوفلاين</p>
          <p className="mt-1 opacity-60">com.foxsd.offlintranslator</p>
        </footer>
      </main>
    </div>
  );
};

export default Index;
