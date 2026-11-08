import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { DatabaseMessage } from "@/components/database-message";
import { LibraryFallback } from "@/components/library-fallback";
import { Scripture } from "@/components/scripture";
import { TranslationLabel } from "@/components/translation-label";
import { getPrayer } from "@/db/queries";
import { presentPrayers } from "@/lib/present-scripture";
import { settle } from "@/lib/settle";

export const metadata = {
  title: "Prayer",
};

export default function PrayerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense fallback={<LibraryFallback />}>
      <PrayerDetail params={params} />
    </Suspense>
  );
}

async function PrayerDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^\d+$/.test(id)) notFound();

  const loaded = await settle(() => getPrayer(Number(id)));
  if (!loaded.ok) return <DatabaseMessage error={loaded.error} />;
  const prayerRow = loaded.data;
  if (!prayerRow) notFound();
  const prayer = (await presentPrayers([prayerRow]))[0] ?? prayerRow;

  return (
    <article className="flex flex-col gap-6">
      <p>
        <Link
          href={
            prayer.author.toLowerCase() === "paul"
              ? "/prayers?author=Paul"
              : "/prayers"
          }
          className="text-sm text-muted-foreground underline decoration-border underline-offset-4 hover:decoration-foreground"
        >
          {prayer.author.toLowerCase() === "paul" ? "Prayers of Paul" : "All prayers"}
        </Link>
      </p>
      <header className="flex flex-col gap-2">
        <p className="text-sm text-muted-foreground">{prayer.author}</p>
        <h1 className="text-4xl leading-tight">{prayer.title}</h1>
        {prayer.scriptureReference ? (
          <p className="text-muted-foreground">
            {prayer.scriptureReference}
            {prayer.translation ? (
              <>
                {" · "}
                <TranslationLabel translation={prayer.translation} />
              </>
            ) : null}
          </p>
        ) : null}
      </header>
      <Scripture>{prayer.body}</Scripture>
      {prayer.notes ? (
        <p className="leading-7 text-muted-foreground">{prayer.notes}</p>
      ) : null}
      {prayer.topics.length > 0 ? (
        <p className="text-sm leading-6">
          <span className="text-muted-foreground">Topics: </span>
          {prayer.topics.map((topic, index) => (
            <span key={topic.id}>
              {index > 0 ? ", " : null}
              <Link href={`/verses/${topic.slug}`} className="underline decoration-border underline-offset-4">
                {topic.name}
              </Link>
            </span>
          ))}
        </p>
      ) : null}
    </article>
  );
}
