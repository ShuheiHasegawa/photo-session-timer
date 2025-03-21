import NextPhotographerTimer from "@/components/NextPhotographerTimer";

export const metadata = {
  title: "PS Timer - 撮影会タイマー",
  description: "撮影会のための効率的なタイマーアプリ",
};

export default function Home() {
  return (
    <main>
      <NextPhotographerTimer />
    </main>
  );
}
