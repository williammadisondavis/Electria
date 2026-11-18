import type { Metadata } from "next";
import ListingDetail from "./listing-detail";

export const metadata: Metadata = { title: "Ride details" };

export default async function ListingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ListingDetail key={id} id={id} />;
}
