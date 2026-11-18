import type { Metadata } from "next";
import OwnerDashboard from "./owner-dashboard";

export const metadata: Metadata = { title: "Rent out" };

export default function HostPage() {
  return <OwnerDashboard />;
}
