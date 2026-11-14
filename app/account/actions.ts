"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { currentMember, endMemberSession, loginMember, registerMember, updateMemberProfile } from "@/lib/user-auth";

const text = (data: FormData, key: string) => String(data.get(key) ?? "");

/** Yalnızca sitenin kendi içindeki yollara yönlendir (açık yönlendirme açığı olmasın). */
function safeNext(value: string) {
  return value.startsWith("/") && !value.startsWith("//") && !value.includes("\\") ? value : "/account";
}

function back(path: string, errors: Record<string, string>, extra: Record<string, string> = {}): never {
  const params = new URLSearchParams({ ...extra, ...(Object.keys(errors).length ? { error: Object.values(errors)[0], field: Object.keys(errors)[0] } : {}) });
  redirect(`${path}?${params.toString()}`);
}

export async function registerAction(formData: FormData) {
  const next = safeNext(text(formData, "next"));
  const result = await registerMember({ name: text(formData, "name"), email: text(formData, "email"), password: text(formData, "password") });
  if (!result.ok) back("/account/register", result.errors, { name: text(formData, "name"), email: text(formData, "email"), next });
  revalidatePath("/", "layout");
  redirect(next);
}

export async function loginAction(formData: FormData) {
  const next = safeNext(text(formData, "next"));
  const result = await loginMember(text(formData, "email"), text(formData, "password"));
  if (!result.ok) back("/account/login", result.errors, { email: text(formData, "email"), next });
  revalidatePath("/", "layout");
  redirect(next);
}

export async function logoutAction() {
  await endMemberSession();
  revalidatePath("/", "layout");
  redirect("/?cikis=1");
}

export async function profileAction(formData: FormData) {
  const member = await currentMember();
  if (!member) redirect("/account/login");
  const result = updateMemberProfile(member.id, { name: text(formData, "name"), phone: text(formData, "phone"), address: text(formData, "address"), city: text(formData, "city") });
  if (!result.ok) back("/account", result.errors);
  revalidatePath("/", "layout");
  redirect("/account?saved=1");
}
