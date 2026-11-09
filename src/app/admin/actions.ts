"use server";

import { redirect } from "next/navigation";
import { createPrayer, createVerse } from "@/db/writes";
import { getAdminPassword } from "@/lib/password";
import { endAdminSession, isAdmin, startAdminSession } from "@/lib/session";

export async function login(formData: FormData) {
  if (!getAdminPassword()) redirect("/admin?error=readonly");
  const password = String(formData.get("password") ?? "");
  const signedIn = await startAdminSession(password);
  if (!signedIn) redirect("/admin?error=password");
  redirect("/admin");
}

export async function logout() {
  await endAdminSession();
  redirect("/admin");
}

export async function addPrayer(
  _state: { error: string },
  formData: FormData,
): Promise<{ error: string }> {
  await requireAdmin();
  const result = await createPrayer({
    title: String(formData.get("title") ?? ""),
    author: String(formData.get("author") ?? ""),
    body: String(formData.get("body") ?? ""),
    scriptureReference: String(formData.get("scriptureReference") ?? ""),
    notes: String(formData.get("notes") ?? ""),
    topicIds: topicIds(formData),
    newTopicName: String(formData.get("newTopicName") ?? ""),
  });
  if (!result.ok) return { error: result.error };
  redirect(`/prayers/${result.id}`);
}

export async function addVerse(
  _state: { error: string },
  formData: FormData,
): Promise<{ error: string }> {
  await requireAdmin();
  const result = await createVerse({
    reference: String(formData.get("reference") ?? ""),
    text: String(formData.get("text") ?? ""),
    translation: String(formData.get("translation") ?? ""),
    topicIds: topicIds(formData),
    newTopicName: String(formData.get("newTopicName") ?? ""),
    vestaboardText: String(formData.get("vestaboardText") ?? ""),
    vestaboardReference: String(formData.get("vestaboardReference") ?? ""),
  });
  if (!result.ok) return { error: result.error };
  redirect(result.topicSlug ? `/verses/${result.topicSlug}` : "/verses");
}

async function requireAdmin() {
  if (!getAdminPassword()) redirect("/admin?error=readonly");
  if (!(await isAdmin())) redirect("/admin?error=password");
}

function topicIds(formData: FormData) {
  return formData.getAll("topicId").flatMap((value) => {
    const id = Number(value);
    return Number.isInteger(id) && id > 0 ? [id] : [];
  });
}
