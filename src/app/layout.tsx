import { Provider } from "../components/provider";
import "./globals.css";

export const metadata = {
  title: "GitHub Stars",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Provider>{children}</Provider>
      </body>
    </html>
  );
}
