import TarotClient from "./TarotClient";

export const metadata = {
  title: "타로 리딩 🎴",
  description: "22장의 메이저 아르카나로 보는 오늘의 타로",
};

export default function TarotPage() {
  return <TarotClient />;
}
