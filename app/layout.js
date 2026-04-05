import { Nunito } from "next/font/google";
import "./globals.css";

const nunito = Nunito({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

export const metadata = {
  title: "NutriAndré — Nutrición Infantil",
  description: "App de nutrición y salud infantil para bebés de 0-5 años",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es" className={nunito.className}>
      <body>{children}</body>
    </html>
  );
}
