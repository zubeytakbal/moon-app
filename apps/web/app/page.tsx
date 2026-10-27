import { redirect } from "next/navigation";

// Geçici: ana sayfa hazır olana kadar "Bugün ay nasıl" sayfasına yönlendirir.
export default function Home() {
  redirect("/tr/bugun-ay");
}
