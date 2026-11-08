import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-4xl">That page is not in the library.</h1>
      <p className="leading-7 text-muted-foreground">
        The prayer or topic may have been mistyped.
      </p>
      <Link href="/" className="underline underline-offset-4">
        Return home
      </Link>
    </div>
  );
}
