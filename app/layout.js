import "./globals.css";

export const metadata = {
  title: "SafeLife AI | Monitoramento",
  description: "Vida útil inteligente para equipamentos",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
