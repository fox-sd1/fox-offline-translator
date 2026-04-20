import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { mode, text, imageBase64, source, target } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY missing");

    const langName = (c: string) => (c === "ar" ? "Arabic" : "English");
    const sysText = `You are a professional translator. Translate from ${langName(source)} to ${langName(target)}. Output ONLY the translated text, no explanations, no quotes.`;
    const sysImage = `You will receive an image. Extract any visible text via OCR, then translate it from ${langName(source)} to ${langName(target)}. Output ONLY the final translated text. If no text found, output exactly: NO_TEXT_FOUND`;

    let messages: any[];
    if (mode === "image") {
      messages = [
        { role: "system", content: sysImage },
        {
          role: "user",
          content: [
            { type: "text", text: "Extract and translate the text in this image." },
            { type: "image_url", image_url: { url: imageBase64 } },
          ],
        },
      ];
    } else {
      messages = [
        { role: "system", content: sysText },
        { role: "user", content: text },
      ];
    }

    const r = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages,
      }),
    });

    if (!r.ok) {
      if (r.status === 429) {
        return new Response(JSON.stringify({ error: "تم تجاوز حد الطلبات. حاول لاحقاً." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (r.status === 402) {
        return new Response(JSON.stringify({ error: "نفد الرصيد. يرجى إضافة رصيد للمساحة." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await r.text();
      console.error("AI gateway error", r.status, t);
      return new Response(JSON.stringify({ error: "خطأ في خدمة الترجمة" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await r.json();
    const translation = data.choices?.[0]?.message?.content ?? "";
    return new Response(JSON.stringify({ translation }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("translate error", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
