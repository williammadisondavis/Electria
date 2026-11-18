import type { Metadata } from "next";
import Browse from "./browse";

export const metadata: Metadata = { title: "Browse" };

export default function BrowsePage() {
  return <Browse />;
}
