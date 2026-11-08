import { ESV_SITE_URL } from "@/lib/esv-api";
import { translationName } from "@/lib/format";

export function TranslationLabel({ translation }: { translation: string }) {
  if (translation.toUpperCase() === "ESV") {
    return (
      <a
        href={ESV_SITE_URL}
        className="underline decoration-border underline-offset-4 hover:decoration-foreground"
      >
        ESV
      </a>
    );
  }
  return <span>{translationName(translation)}</span>;
}
