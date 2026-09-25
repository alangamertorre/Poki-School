import "./globals.css";

export const metadata = {
  title: "Poki School | Juegos online",
  description: "Una colección de juegos online para jugar en el navegador.",
  icons: {
    icon: "/poki.svg",
    shortcut: "/poki.svg",
    apple: "/poki.svg",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
