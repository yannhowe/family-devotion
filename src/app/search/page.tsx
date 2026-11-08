import Link from "next/link";
import { Suspense } from "react";
import { DatabaseMessage } from "@/components/database-message";
import { LibraryFallback } from "@/components/library-fallback";
import { TranslationLabel } from "@/components/translation-label";
import { searchLibrary } from "@/db/queries";
import { excerpt } from "@/lib/format";
import { firstParam } from "@/lib/params";
import { presentSearchResults } from "@/lib/present-scripture";
import { settle } from "@/lib/settle";

export const metadata = {
  title: "Search",
};

export default function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string | string[] }>;
}) {
  return (
    <Suspense fallback={<LibraryFallback />}>
      <SearchResults searchParams={searchParams} />
    </Suspense>
  );
}

async function SearchResults({
  searchParams,
}: {
  searchParams: Promise<{ q?: string | string[] }>;
}) {
  const query = firstParam((await searchParams).q)?.slice(0, 200);

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-4xl">Search</h1>
      {!query ? (
        <p className="leading-7 text-muted-foreground">
          Search for a name, a reference, or a word from a prayer or verse.
        </p>
      ) : (
        <SearchBody query={query} />
      )}
    </div>
  );
}

async function SearchBody({ query }: { query: string }) {
  const loaded = await settle(() => searchLibrary(query));
  if (!loaded.ok) return <DatabaseMessage error={loaded.error} />;
  const { prayers, verses } = await presentSearchResults(
    loaded.data.prayers,
    loaded.data.verses,
  );
  const empty = prayers.length === 0 && verses.length === 0;
  return (
      <div className="flex flex-col gap-8">
        <p className="text-muted-foreground">Results for “{query}”.</p>
        {empty ? <p>Nothing in this library matched.</p> : null}
        {prayers.length > 0 ? (
          <section className="flex flex-col gap-3">
            <h2 className="text-2xl">Prayers</h2>
            <ul className="divide-y divide-border">
              {prayers.map((prayer) => (
                <li key={prayer.id} className="py-4">
                  <Link href={`/prayers/${prayer.id}`} className="font-serif text-xl hover:underline">
                    {prayer.title}
                  </Link>
                  <p className="text-sm text-muted-foreground">
                    {prayer.author}
                    {prayer.scriptureReference ? ` · ${prayer.scriptureReference}` : ""}
                    {prayer.translation ? (
                      <>
                        {" · "}
                        <TranslationLabel translation={prayer.translation} />
                      </>
                    ) : null}
                  </p>
                  <p className="mt-2 leading-7">{excerpt(prayer.body, 160)}</p>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
        {verses.length > 0 ? (
          <section className="flex flex-col gap-3">
            <h2 className="text-2xl">Verses</h2>
            <ul className="divide-y divide-border">
              {verses.map((verse) => (
                <li key={verse.id} className="py-4">
                  <p className="font-serif text-xl">{verse.reference}</p>
                  {verse.notice ? (
                    <p className="mt-2 leading-7 text-muted-foreground">{verse.notice}</p>
                  ) : (
                    <p className="mt-2 leading-7">{excerpt(verse.text, 180)}</p>
                  )}
                  {verse.notice ? null : (
                    <p className="mt-2 text-sm text-muted-foreground">
                      <TranslationLabel translation={verse.translation} />
                    </p>
                  )}
                  {verse.topics[0] ? (
                    <p className="mt-2 text-sm">
                      <Link
                        href={`/verses/${verse.topics[0].slug}`}
                        className="text-muted-foreground underline decoration-border underline-offset-4"
                      >
                        {verse.topics[0].name}
                      </Link>
                    </p>
                  ) : null}
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </div>
  );
}
