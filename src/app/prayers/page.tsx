import Link from "next/link";
import { Suspense } from "react";
import { DatabaseMessage } from "@/components/database-message";
import { LibraryFallback } from "@/components/library-fallback";
import { PrayerList } from "@/components/prayer-list";
import { listAuthors, listPrayers } from "@/db/queries";
import { firstParam } from "@/lib/params";
import { presentPrayers } from "@/lib/present-scripture";
import { settle } from "@/lib/settle";
import { cn } from "@/lib/utils";

export const metadata = {
  title: "Prayers",
  description: "Prayers to read with your family, including the prayers of the Apostle Paul.",
};

export default function PrayersPage({
  searchParams,
}: {
  searchParams: Promise<{ author?: string | string[] }>;
}) {
  return (
    <Suspense fallback={<LibraryFallback />}>
      <PrayerIndex searchParams={searchParams} />
    </Suspense>
  );
}

async function PrayerIndex({
  searchParams,
}: {
  searchParams: Promise<{ author?: string | string[] }>;
}) {
  const author = firstParam((await searchParams).author);
  const paul = author?.toLowerCase() === "paul";
  const loaded = await settle(() => Promise.all([listPrayers(author), listAuthors()]));
  if (!loaded.ok) return <DatabaseMessage error={loaded.error} />;
  const [prayerRows, authors] = loaded.data;
  const prayers = await presentPrayers(prayerRows);

  return (
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-3">
          <h1 className="text-4xl">
            {paul ? "Prayers of Paul" : author ? `Prayers of ${author}` : "Prayers"}
          </h1>
          <p className="max-w-xl leading-7 text-muted-foreground">
            {paul
              ? "These are prayers the Apostle Paul wrote down in his letters. Read one slowly, then pray it in your own words."
              : "Read a prayer through, then pray it together. Paul’s prayers are a steady place to begin."}
          </p>
        </div>
        <nav aria-label="Filter by author" className="flex flex-wrap gap-2">
          <AuthorLink href="/prayers" current={!author}>
            All
          </AuthorLink>
          {authors.map((name) => (
            <AuthorLink
              key={name}
              href={`/prayers?author=${encodeURIComponent(name)}`}
              current={author?.toLowerCase() === name.toLowerCase()}
            >
              {name === "Paul" ? "Prayers of Paul" : name}
            </AuthorLink>
          ))}
        </nav>
        <PrayerList prayers={prayers} />
      </div>
  );
}

function AuthorLink({
  href,
  current,
  children,
}: {
  href: string;
  current: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      aria-current={current ? "page" : undefined}
      className={cn(
        "rounded-full px-3 py-1 text-sm ring-1 ring-foreground/10",
        current ? "bg-primary text-primary-foreground" : "bg-card hover:bg-muted",
      )}
    >
      {children}
    </Link>
  );
}
