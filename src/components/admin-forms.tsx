"use client";

import { useActionState } from "react";
import { addPrayer, addVerse } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type TopicOption = {
  id: number;
  name: string;
};

export function AdminForms({
  topics,
  esvEnabled = false,
}: {
  topics: TopicOption[];
  esvEnabled?: boolean;
}) {
  return (
    <div className="flex flex-col gap-12">
      <PrayerForm topics={topics} />
      <VerseForm topics={topics} esvEnabled={esvEnabled} />
    </div>
  );
}

function PrayerForm({ topics }: { topics: TopicOption[] }) {
  const [state, action, pending] = useActionState(addPrayer, { error: "" });

  return (
    <form action={action} className="flex flex-col gap-4">
      <div>
        <h2 className="text-2xl">Add a prayer</h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          If you include Scripture, use a public-domain translation such as the
          World English Bible (WEB) or the King James Version (KJV), and say which
          one you used.
        </p>
      </div>
      <Field id="prayer-title" label="Title" name="title" required />
      <Field id="prayer-author" label="Author" name="author" required placeholder="Paul" />
      <TextField id="prayer-body" label="Prayer" name="body" required />
      <Field
        id="prayer-reference"
        label="Scripture reference"
        name="scriptureReference"
        placeholder="Ephesians 1:15-23"
      />
      <TextField id="prayer-notes" label="Notes" name="notes" />
      <TopicFields idPrefix="prayer" topics={topics} />
      {state.error ? <p role="alert" className="text-sm text-destructive">{state.error}</p> : null}
      <Button type="submit" size="lg" disabled={pending} className="h-11 w-full sm:w-fit">
        {pending ? "Saving…" : "Save prayer"}
      </Button>
    </form>
  );
}

function VerseForm({
  topics,
  esvEnabled,
}: {
  topics: TopicOption[];
  esvEnabled: boolean;
}) {
  const [state, action, pending] = useActionState(addVerse, { error: "" });

  return (
    <form action={action} className="flex flex-col gap-4 border-t border-border pt-10">
      <div>
        <h2 className="text-2xl">Add a verse</h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          {esvEnabled
            ? "Leave the text blank to load the English Standard Version from this reference. If that cannot be loaded, paste a public-domain translation such as the World English Bible and name it."
            : "Shortlist a passage under a topic. If you paste Scripture, use a public-domain translation such as the World English Bible (WEB) or the King James Version (KJV)."}
        </p>
      </div>
      <Field id="verse-reference" label="Reference" name="reference" required placeholder="John 3:16" />
      <TextField id="verse-text" label="Text" name="text" required={!esvEnabled} />
      <Field id="verse-translation" label="Translation" name="translation" required defaultValue="WEB" />
      <TextField id="verse-vestaboard" label="Vestaboard short version" name="vestaboardText" />
      <p className="text-sm leading-6 text-muted-foreground">
        Optional. Paste a short contiguous excerpt of this verse for a 6 by 22
        Vestaboard. Tick Vestaboard under topics to let the board show it. If you
        leave the short version empty, the board fits an excerpt of the verse.
      </p>
      <TopicFields idPrefix="verse" topics={topics} />
      {state.error ? <p role="alert" className="text-sm text-destructive">{state.error}</p> : null}
      <Button type="submit" size="lg" disabled={pending} className="h-11 w-full sm:w-fit">
        {pending ? "Saving…" : "Save verse"}
      </Button>
    </form>
  );
}

function TopicFields({
  idPrefix,
  topics,
}: {
  idPrefix: string;
  topics: TopicOption[];
}) {
  return (
    <fieldset className="flex flex-col gap-3">
      <legend className="text-sm font-medium">Topics</legend>
      <div className="flex flex-col gap-2">
        {topics.map((topic) => (
          <label key={topic.id} className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="topicId"
              value={topic.id}
              className="size-4 accent-primary"
            />
            {topic.name}
          </label>
        ))}
      </div>
      <Field
        id={`${idPrefix}-new-topic`}
        label="New topic"
        name="newTopicName"
        placeholder="Optional"
      />
    </fieldset>
  );
}

function Field({
  id,
  label,
  name,
  required,
  placeholder,
  defaultValue,
}: {
  id: string;
  label: string;
  name: string;
  required?: boolean;
  placeholder?: string;
  defaultValue?: string;
}) {
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={id}>
        {label}
        {required ? <span className="text-muted-foreground"> required</span> : null}
      </Label>
      <Input
        id={id}
        name={name}
        required={required}
        placeholder={placeholder}
        defaultValue={defaultValue}
        className="h-10"
      />
    </div>
  );
}

function TextField({
  id,
  label,
  name,
  required,
}: {
  id: string;
  label: string;
  name: string;
  required?: boolean;
}) {
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={id}>
        {label}
        {required ? <span className="text-muted-foreground"> required</span> : null}
      </Label>
      <Textarea id={id} name={name} required={required} className="min-h-36" />
    </div>
  );
}
