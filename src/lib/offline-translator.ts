import { AR_EN_PACK } from "./dictionary-pack";
import { getPack } from "./pack-storage";

const norm = (s: string) =>
  s
    .toLowerCase()
    .replace(/[ًٌٍَُِّْـ]/g, "") // remove Arabic diacritics & tatweel
    .replace(/[إأآا]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ة/g, "ه")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();

export type OfflineResult = {
  translation: string;
  matchedWords: number;
  totalWords: number;
};

/** Word-by-word offline translation using the installed pack. */
export async function offlineTranslate(
  text: string,
  source: "ar" | "en",
  target: "ar" | "en",
): Promise<OfflineResult | null> {
  if (source === target) return { translation: text, matchedWords: 1, totalWords: 1 };

  const packId = `${source}-${target}` === "ar-en" || `${source}-${target}` === "en-ar" ? "ar-en" : null;
  if (!packId) return null;

  const pack = await getPack(packId);
  if (!pack) return null;

  const map = source === "ar" ? pack.ar2en : pack.en2ar;

  // try whole-text match first
  const fullKey = norm(text);
  if (map[fullKey]) {
    return { translation: map[fullKey], matchedWords: 1, totalWords: 1 };
  }

  // try multi-word phrase matches (greedy, longest-first up to 4 words)
  const tokens = fullKey.split(" ").filter(Boolean);
  const out: string[] = [];
  let matched = 0;
  let i = 0;
  while (i < tokens.length) {
    let found = false;
    for (let span = Math.min(4, tokens.length - i); span >= 1; span--) {
      const phrase = tokens.slice(i, i + span).join(" ");
      if (map[phrase]) {
        out.push(map[phrase]);
        matched++;
        i += span;
        found = true;
        break;
      }
    }
    if (!found) {
      out.push(`«${tokens[i]}»`);
      i++;
    }
  }

  return {
    translation: out.join(" "),
    matchedWords: matched,
    totalWords: tokens.length,
  };
}

/** Build the lookup maps from the seed dictionary. */
export function buildPackMaps() {
  const ar2en: Record<string, string> = {};
  const en2ar: Record<string, string> = {};
  for (const { ar, en } of AR_EN_PACK) {
    ar2en[norm(ar)] = en;
    en2ar[norm(en)] = ar;
  }
  return { ar2en, en2ar };
}
