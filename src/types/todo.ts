export type Category = "morning" | "afternoon" | "evening";

export type Todo = {
  id: string;
  title: string;
  is_completed: boolean;
  category: Category;
  created_at: string;
};

export const CATEGORIES: { value: Category; label: string; emoji: string }[] = [
  { value: "morning", label: "아침", emoji: "🌅" },
  { value: "afternoon", label: "점심", emoji: "☀️" },
  { value: "evening", label: "저녁", emoji: "🌙" },
];
