import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { DatabaseMessage } from "@/components/database-message";
import { LibraryFallback } from "@/components/library-fallback";
import { VerseBlock } from "@/components/verse-block";
import { getTopicBySlug, listVersesForTopic } from "@/db/queries";
import { settle } from "@/lib/settle";

export const metadata = {
  title: "Verses",
};

export default function TopicPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  return (
    <Suspense fallback={<LibraryFallback />}>
      <TopicDetail params={params} />
    </Suspense>
  );
}

async function TopicDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const loaded = await settle(async () => {
    const topic = await getTopicBySlug(slug);
    if (!topic) return null;
    const verses = await listVersesForTopic(topic.id);
    return { topic, verses };
  });
  if (!loaded.ok) return <DatabaseMessage error={loaded.error} />;
  if (!loaded.data) notFound();
  const { topic, verses } = loaded.data;

  return (
    <div className="flex flex-col gap-6">
      <p>
        <Link
          href="/verses"
          className="text-sm text-muted-foreground underline decoration-border underline-offset-4 hover:decoration-foreground"
        >
          All topics
        </Link>
      </p>
      <header className="flex flex-col gap-2">
        <h1 className="text-4xl">{topic.name}</h1>
        {topic.description ? (
          <p className="max-w-xl leading-7 text-muted-foreground">{topic.description}</p>
        ) : null}
      </header>
      {verses.length === 0 ? (
        <p className="text-muted-foreground">No verses have been gathered under this topic yet.</p>
      ) : (
        <div className="divide-y divide-border">
          {verses.map((verse) => (
            <VerseBlock key={verse.id} {...verse} />
          ))}
        </div>
      )}
    </div>
  );
}
