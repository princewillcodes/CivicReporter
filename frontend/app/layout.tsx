import type { Metadata } from "next";
import "./globals.css";
import { ReportStoreProvider } from "../components/ReportStore";

export const metadata: Metadata = {
  title: "CivicReporter | Ghana",
  description: "Report civic problems to the right local assembly.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en"><body><ReportStoreProvider>{children}</ReportStoreProvider></body></html>
  );
}
