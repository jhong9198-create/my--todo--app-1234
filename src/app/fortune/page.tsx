import FortuneClient from "./FortuneClient";

export const metadata = {
  title: "오늘의 운세 ✨",
  description: "생년월일로 보는 오늘의 운세",
};

export default function FortunePage() {
  return <FortuneClient />;
}
