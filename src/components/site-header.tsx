import Link from "next/link";
import { Input } from "@/components/ui/input";

export function SiteHeader() {
  return (
    <header className="border-b border-border">
      <a
        href="#content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-10 focus:rounded-lg focus:bg-card focus:px-3 focus:py-2"
      >
        Skip to content
      </a>
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-4 px-5 py-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-baseline sm:justify-between">
          <Link href="/" className="font-serif text-xl text-foreground">
            Family Devotion
          </Link>
          <nav aria-label="Primary" className="flex flex-wrap gap-x-4 gap-y-2 text-sm">
            <Link href="/prayers?author=Paul" className="hover:underline">
              Prayers of Paul
            </Link>
            <Link href="/prayers" className="hover:underline">
              All prayers
            </Link>
            <Link href="/verses" className="hover:underline">
              Verses
            </Link>
          </nav>
        </div>
        <form action="/search" className="flex">
          <label htmlFor="site-search" className="sr-only">
            Search prayers and verses
          </label>
          <Input
            id="site-search"
            name="q"
            type="search"
            placeholder="Search prayers and verses"
            className="h-10"
          />
        </form>
      </div>
    </header>
  );
}
