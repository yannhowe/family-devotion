import Link from "next/link";
import { TranslationLabel } from "@/components/translation-label";
import type { PrayerSummary } from "@/db/queries";
import { excerpt } from "@/lib/format";

export function PrayerList({
  prayers,
}: {
  prayers: Array<PrayerSummary & { translation?: string | null }>;
}) {
  if (prayers.length === 0) {
    return <p className="text-muted-foreground">No prayers have been added yet.</p>;
  }

  return (
    <ol className="divide-y divide-border">
      {prayers.map((prayer) => (
        <li key={prayer.id} className="py-6">
          <p className="text-sm text-muted-foreground">{prayer.author}</p>
          <h2 className="mt-1 text-2xl">
            <Link
              href={`/prayers/${prayer.id}`}
              className="underline decoration-transparent underline-offset-4 hover:decoration-foreground"
            >
              {prayer.title}
            </Link>
          </h2>
          {prayer.scriptureReference ? (
            <p className="mt-1 text-sm text-muted-foreground">
              {prayer.scriptureReference}
              {prayer.translation ? (
                <>
                  {" · "}
                  <TranslationLabel translation={prayer.translation} />
                </>
              ) : null}
            </p>
          ) : null}
          <p className="mt-3 font-serif text-lg leading-8">{excerpt(prayer.body)}</p>
        </li>
      ))}
    </ol>
  );
}
