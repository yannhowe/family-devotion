"use client";

import { Button } from "@/components/ui/button";

export default function ErrorPage({ reset }: { error: Error; reset: () => void }) {
  return (
    <div role="alert" className="flex flex-col gap-4">
      <h1 className="text-4xl">Something got in the way.</h1>
      <p className="leading-7 text-muted-foreground">
        This page could not be opened. You can try again.
      </p>
      <Button type="button" size="lg" className="h-11 w-fit" onClick={() => reset()}>
        Try again
      </Button>
    </div>
  );
}
