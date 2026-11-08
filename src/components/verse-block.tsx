import { translationName } from "@/lib/format";
import { Scripture } from "@/components/scripture";

export function VerseBlock({
  reference,
  text,
  translation,
  heading = "h2",
}: {
  reference: string;
  text: string;
  translation: string;
  heading?: "h2" | "h3";
}) {
  const Heading = heading;
  return (
    <article className="py-6">
      <Heading className="text-xl">{reference}</Heading>
      <div className="mt-3">
        <Scripture>{text}</Scripture>
      </div>
      <p className="mt-3 text-sm text-muted-foreground">{translationName(translation)}</p>
    </article>
  );
}
