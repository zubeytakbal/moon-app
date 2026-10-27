import { redirect } from "next/navigation";

// Kök adres, şimdilik tek dil olan Türkçe ana sayfaya yönlendirir.
export default function Home() {
  redirect("/tr");
}
