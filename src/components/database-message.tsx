import { DatabaseConfigError } from "@/db/errors";

export function DatabaseMessage({ error }: { error: unknown }) {
  const message =
    error instanceof DatabaseConfigError
      ? error.message
      : "The library could not be opened. On Vercel, connect a Turso database and redeploy. With Docker, wait a moment and refresh this page.";

  return (
    <div role="alert" className="rounded-xl bg-card px-5 py-4 ring-1 ring-foreground/10">
      <h2 className="text-xl">The library is not ready</h2>
      <p className="mt-2 leading-7 text-muted-foreground">{message}</p>
    </div>
  );
}
