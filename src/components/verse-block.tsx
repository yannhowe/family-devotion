import { Scripture } from "@/components/scripture";
import { TranslationLabel } from "@/components/translation-label";

export function VerseBlock({
  reference,
  text,
  translation,
  heading = "h2",
  notice = null,
}: {
  reference: string;
  text: string;
  translation: string;
  heading?: "h2" | "h3";
  notice?: string | null;
}) {
  const Heading = heading;
  return (
    <article className="py-6">
      <Heading className="text-xl">{reference}</Heading>
      <div className="mt-3">
        {notice ? (
          <p className="leading-7 text-muted-foreground">{notice}</p>
        ) : (
          <Scripture>{text}</Scripture>
        )}
      </div>
      {notice ? null : (
        <p className="mt-3 text-sm text-muted-foreground">
          <TranslationLabel translation={translation} />
        </p>
      )}
    </article>
  );
}
