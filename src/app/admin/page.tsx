import { Suspense } from "react";
import { login, logout } from "@/app/admin/actions";
import { AdminForms } from "@/components/admin-forms";
import { DatabaseMessage } from "@/components/database-message";
import { LibraryFallback } from "@/components/library-fallback";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { listTopics } from "@/db/queries";
import { esvApiKey } from "@/lib/esv-api";
import { getAdminPassword } from "@/lib/password";
import { firstParam } from "@/lib/params";
import { isAdmin } from "@/lib/session";
import { settle } from "@/lib/settle";

export const metadata = {
  title: "Care for this library",
};

const errors: Record<string, string> = {
  password: "That password does not match.",
  readonly: "Adding is turned off until ADMIN_PASSWORD is set on this copy of the site.",
};

export default function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string | string[] }>;
}) {
  return (
    <Suspense fallback={<LibraryFallback />}>
      <AdminContent searchParams={searchParams} />
    </Suspense>
  );
}

async function AdminContent({
  searchParams,
}: {
  searchParams: Promise<{ error?: string | string[] }>;
}) {
  const errorCode = firstParam((await searchParams).error);
  const message = errorCode ? errors[errorCode] : undefined;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-3">
        <h1 className="text-4xl">Care for this library</h1>
        <p className="max-w-xl leading-7 text-muted-foreground">
          Anyone can read. If a password is set for this copy of the site, the
          people who know it can add a prayer or a shortlisted verse. There are
          no accounts.
        </p>
      </div>
      {message ? (
        <p role="alert" className="text-sm text-destructive">
          {message}
        </p>
      ) : null}
      <AdminGate />
    </div>
  );
}

async function AdminGate() {
  if (!getAdminPassword()) {
    return (
      <p className="leading-7">
        This copy is read-only. To allow additions, set ADMIN_PASSWORD and open
        this page again.
      </p>
    );
  }

  if (!(await isAdmin())) {
    return (
      <form action={login} className="flex max-w-sm flex-col gap-3">
        <Label htmlFor="admin-password">Password</Label>
        <Input
          id="admin-password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="h-10"
        />
        <Button type="submit" size="lg" className="h-11 w-fit">
          Continue
        </Button>
      </form>
    );
  }

  const loaded = await settle(() => listTopics());
  if (!loaded.ok) return <DatabaseMessage error={loaded.error} />;

  return (
    <div className="flex flex-col gap-8">
      <form action={logout}>
        <Button type="submit" variant="outline" size="lg" className="h-10">
          Lock additions
        </Button>
      </form>
      <AdminForms
        esvEnabled={Boolean(esvApiKey())}
        topics={loaded.data.map((topic) => ({ id: topic.id, name: topic.name }))}
      />
    </div>
  );
}
