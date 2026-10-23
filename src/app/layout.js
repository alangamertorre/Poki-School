import "./globals.css";

export const metadata = {
  title: "NEXUS//PLAY | Arcade online",
  description:
    "Entra en NEXUS//PLAY: un portal de juegos online para explorar y jugar directamente en tu navegador.",
  icons: {
    icon: "/nexus.svg",
    shortcut: "/nexus.svg",
    apple: "/nexus.svg",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
