
import { useState, useEffect } from "react";
import { pipeline } from "@xenova/transformers";

const LANG_LABEL: Record<string, string> = { ar: "العربية", en: "English" };

export const TextTranslator = () => {
  const [inputText, setInputText] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [isReady, setIsReady] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const initTranslator = async () => {
      try {
        const translator = await pipeline('translation', 'Xenova/opus-mt-en-ar', {
          progress_callback: (p) => console.log(`تحميل: ${p.progress}%`),
        });
        setIsReady(true);
        (window as any).foxTranslator = translator;
      } catch (error) {
        console.error("خطأ المحرك:", error);
      }
    };
    initTranslator();
  }, []);

  const handleTranslate = async () => {
    if (!inputText || !isReady) return;
    setLoading(true);
    try {
      const translator = (window as any).foxTranslator;
      const output = await translator(inputText, {
        src_lang: 'eng_Latn',
        tgt_lang: 'ara_Arab',
      });
      setTranslatedText(output[0].translation_text);
    } catch (error) {
      console.error("فشلت الترجمة:", error);
    }
    setLoading(false);
  };

  return (
    <div className="space-y-4">
      <textarea
        className="w-full p-4 rounded-2xl bg-secondary/30 min-h-[150px] text-right"
        placeholder="أدخل النص الإنجليزي هنا..."
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
      />
      <button
        onClick={handleTranslate}
        disabled={loading || !isReady}
        className="w-full py-4 rounded-2xl bg-orange-500 text-white font-bold"
      >
        {loading ? "جاري الترجمة..." : !isReady ? "جاري تجهيز المحرك..." : "ترجم الآن"}
      </button>
      {translatedText && (
        <div className="p-4 rounded-2xl bg-green-50 border border-green-200 text-right">
          <p className="text-lg">{translatedText}</p>
        </div>
      )}
    </div>
  );
};
