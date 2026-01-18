import "./globals.css";
import AppFrame from "./components/AppFrame";

export const metadata = {
  title: "My Timer Hub",
  description: "集中入口整合計時器與工具的 Next.js 版本",
};

export default function RootLayout({ children }) {
  return (
    <html lang="zh-Hant">
      <body>
        <AppFrame>{children}</AppFrame>
      </body>
    </html>
  );
}
