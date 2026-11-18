import type { Metadata } from "next";
import RiderBookings from "./rider-bookings";

export const metadata: Metadata = { title: "Bookings" };

export default async function BookingsPage({
  searchParams,
}: {
  searchParams: Promise<{ booking?: string | string[] }>;
}) {
  const { booking } = await searchParams;
  return (
    <RiderBookings preferredId={typeof booking === "string" ? booking : ""} />
  );
}
