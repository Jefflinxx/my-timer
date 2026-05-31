import "./globals.css";
import StyledComponentsRegistry from "./components/StyledComponentsRegistry";
import GlobalStyles from "./components/GlobalStyles";
import { Noto_Sans_TC, Nunito } from "next/font/google";

const nunito = Nunito({
  subsets: ["latin"],
  weight: ["300", "600", "800"],
  display: "swap",
  variable: "--font-nunito",
});

const notoSansTc = Noto_Sans_TC({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
  variable: "--font-noto-tc",
});

export const metadata = {
  title: "Eye Guardian",
  description: "20/20/20 護眼專注計時器",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="zh-Hant"
      className={`${nunito.variable} ${notoSansTc.variable}`}
      style={{ backgroundColor: "#1b1917" }}
    >
      <body style={{ margin: 0, backgroundColor: "#1b1917" }}>
        <StyledComponentsRegistry>
          <GlobalStyles />
          {children}
        </StyledComponentsRegistry>
      </body>
    </html>
  );
}
