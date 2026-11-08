import Link from "next/link";
import { Suspense } from "react";
import { DatabaseMessage } from "@/components/database-message";
import { LibraryFallback } from "@/components/library-fallback";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { listPrayers, listTopics } from "@/db/queries";
import { excerpt } from "@/lib/format";
import { settle } from "@/lib/settle";
import { cn } from "@/lib/utils";

export default function HomePage() {
  return (
    <div className="flex flex-col gap-12">
      <section className="flex flex-col gap-5">
        <p className="text-sm text-muted-foreground">For families</p>
        <h1 className="max-w-xl text-4xl leading-tight">
          Pray with the words God has given.
        </h1>
        <p className="max-w-xl text-lg leading-8 text-muted-foreground">
          A quiet place to read prayers and Bible verses together, so a family
          can pray according to God’s will. Begin with the prayers of the Apostle
          Paul, or browse verses gathered by topic.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            href="/prayers?author=Paul"
            className={cn(buttonVariants({ size: "lg" }), "h-11 px-4")}
          >
            Prayers of Paul
          </Link>
          <Link
            href="/verses"
            className={cn(buttonVariants({ variant: "outline", size: "lg" }), "h-11 px-4")}
          >
            Verses by topic
          </Link>
        </div>
      </section>
      <Suspense fallback={<LibraryFallback />}>
        <HomeLibrary />
      </Suspense>
    </div>
  );
}

async function HomeLibrary() {
  const loaded = await settle(() =>
    Promise.all([listPrayers("Paul"), listTopics()]),
  );
  if (!loaded.ok) return <DatabaseMessage error={loaded.error} />;
  const [prayers, topics] = loaded.data;
  const featured = prayers.slice(0, 3);

  return (
      <div className="flex flex-col gap-12">
        <section className="flex flex-col gap-4">
          <h2 className="text-2xl">From Paul’s prayers</h2>
          <div className="grid gap-4">
            {featured.map((prayer) => (
              <Card key={prayer.id}>
                <CardHeader>
                  <CardTitle>
                    <h3 className="text-xl">
                      <Link href={`/prayers/${prayer.id}`} className="hover:underline">
                        {prayer.title}
                      </Link>
                    </h3>
                  </CardTitle>
                  <CardDescription>{prayer.scriptureReference}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="font-serif text-lg leading-8">{excerpt(prayer.body, 180)}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
        <section className="flex flex-col gap-4">
          <h2 className="text-2xl">Verses by topic</h2>
          <ul className="grid gap-3 sm:grid-cols-2">
            {topics.map((topic) => (
              <li key={topic.id}>
                <Link
                  href={`/verses/${topic.slug}`}
                  className="block rounded-xl bg-card px-4 py-4 ring-1 ring-foreground/10 hover:bg-muted"
                >
                  <span className="font-serif text-xl">{topic.name}</span>
                  {topic.description ? (
                    <span className="mt-1 block text-sm leading-6 text-muted-foreground">
                      {topic.description}
                    </span>
                  ) : null}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>
  );
}
