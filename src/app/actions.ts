"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function getTodos() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("todos")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data;
}

export async function addTodo(formData: FormData) {
  const title = formData.get("title") as string;
  if (!title?.trim()) return;

  const supabase = await createClient();
  const { error } = await supabase
    .from("todos")
    .insert({ title: title.trim() });

  if (error) throw new Error(error.message);
  revalidatePath("/");
}

export async function toggleTodo(id: string, isCompleted: boolean) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("todos")
    .update({ is_completed: !isCompleted })
    .eq("id", id);

  if (error) throw new Error(error.message);
  revalidatePath("/");
}

export async function deleteTodo(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("todos").delete().eq("id", id);

  if (error) throw new Error(error.message);
  revalidatePath("/");
}
