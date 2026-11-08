import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-3 px-5 py-6 text-sm leading-6 text-muted-foreground">
        <p>
          Scripture is quoted from the World English Bible, which is in the public
          domain. Where that translation says “assembly,” many readers are used to
          the word “church.”
        </p>
        <p>
          <Link href="/admin" className="underline decoration-border underline-offset-4 hover:decoration-foreground">
            Care for this library
          </Link>
        </p>
      </div>
    </footer>
  );
}
