import Link from "next/link";
import { Suspense } from "react";
import { DatabaseMessage } from "@/components/database-message";
import { LibraryFallback } from "@/components/library-fallback";
import { VerseBlock } from "@/components/verse-block";
import { listTopicsWithVerses } from "@/db/queries";
import { settle } from "@/lib/settle";

export const metadata = {
  title: "Verses",
  description: "Bible verses shortlisted by topic for family prayer.",
};

export default function VersesPage() {
  return (
    <Suspense fallback={<LibraryFallback />}>
      <VerseIndex />
    </Suspense>
  );
}

async function VerseIndex() {
  const loaded = await settle(() => listTopicsWithVerses());
  if (!loaded.ok) return <DatabaseMessage error={loaded.error} />;
  const topics = loaded.data;
  return (
      <div className="flex flex-col gap-10">
        <div className="flex flex-col gap-3">
          <h1 className="text-4xl">Verses by topic</h1>
          <p className="max-w-xl leading-7 text-muted-foreground">
            A short list of passages to read when you pray. They are a place to
            begin, not a whole Bible.
          </p>
        </div>
        {topics.map((topic) => (
          <section key={topic.id} className="flex flex-col gap-2">
            <h2 className="text-3xl">
              <Link href={`/verses/${topic.slug}`} className="hover:underline">
                {topic.name}
              </Link>
            </h2>
            {topic.description ? (
              <p className="text-muted-foreground">{topic.description}</p>
            ) : null}
            {topic.verses.length === 0 ? (
              <p className="text-muted-foreground">No verses have been gathered here yet.</p>
            ) : (
              <div className="divide-y divide-border">
                {topic.verses.map((verse) => (
                  <VerseBlock key={verse.id} {...verse} heading="h3" />
                ))}
              </div>
            )}
          </section>
        ))}
      </div>
  );
}
