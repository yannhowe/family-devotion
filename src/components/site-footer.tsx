import Link from "next/link";
import { io } from "next/cache";
import { ESV_COPYRIGHT_NOTICE, ESV_SITE_URL, esvApiKey } from "@/lib/esv-api";

export async function SiteFooter() {
  await io();
  const esv = Boolean(esvApiKey());

  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-3 px-5 py-6 text-sm leading-6 text-muted-foreground">
        {esv ? (
          <p>
            {ESV_COPYRIGHT_NOTICE}{" "}
            <a
              href={ESV_SITE_URL}
              className="underline decoration-border underline-offset-4 hover:decoration-foreground"
            >
              Read the ESV at esv.org
            </a>
            . When a passage cannot be loaded from the ESV, it is shown from the
            World English Bible, which is in the public domain.
          </p>
        ) : (
          <p>
            Scripture is quoted from the World English Bible, which is in the public
            domain. Where that translation says “assembly,” many readers are used to
            the word “church.”
          </p>
        )}
        <p>
          <Link href="/admin" className="underline decoration-border underline-offset-4 hover:decoration-foreground">
            Care for this library
          </Link>
        </p>
      </div>
    </footer>
  );
}
