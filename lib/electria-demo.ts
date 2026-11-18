export const categories = ["E-bike", "E-scooter", "E-skateboard"] as const;
export type Category = (typeof categories)[number];

export type Listing = {
  id: string;
  title: string;
  category: Category;
  city: string;
  area: string;
  centsPerDay: number;
  owner: string;
  description: string;
  active: boolean;
  managed?: boolean;
};

export type BookingStatus =
  "Requested" | "Approved" | "Confirmed" | "Completed" | "Declined";

export type Booking = {
  id: string;
  listingId: string;
  listingTitle: string;
  owner: string;
  start: string;
  end: string;
  totalCents: number;
  status: BookingStatus;
};

export type Message = {
  id: string;
  bookingId: string;
  from: "rider" | "owner";
  text: string;
};

export type AvailabilityBlock = {
  id: string;
  listingId: string;
  start: string;
  end: string;
};

export type Demo = {
  listings: Listing[];
  bookings: Booking[];
  messages: Message[];
  blocks: AvailabilityBlock[];
};

export const demoOwner = "Morgan L.";
export const serviceFeeCents = 500;
export const categoryImages: Record<Category, string> = {
  "E-bike": "/electria/bike.webp",
  "E-scooter": "/electria/scooter.webp",
  "E-skateboard": "/electria/board.webp",
};

export const initialDemo: Demo = {
  listings: [
    {
      id: "radcity",
      title: "RadCity commuter",
      category: "E-bike",
      city: "Decatur",
      area: "Downtown Decatur",
      centsPerDay: 3200,
      owner: demoOwner,
      description:
        "A comfortable step-through ride for errands and the ride across town. A lock and charger come with the rental.",
      active: true,
      managed: true,
    },
    {
      id: "xiaomi-m365",
      title: "Xiaomi M365",
      category: "E-scooter",
      city: "Atlanta",
      area: "Midtown",
      centsPerDay: 1800,
      owner: "Dana K.",
      description:
        "A folding scooter for short trips. Pick it up fully charged near Midtown and bring it back folded or ready to ride.",
      active: true,
    },
    {
      id: "electric-longboard",
      title: "Electric longboard",
      category: "E-skateboard",
      city: "Atlanta",
      area: "Old Fourth Ward",
      centsPerDay: 2500,
      owner: "Alex T.",
      description:
        "A flexible electric longboard with a handheld remote. Best for riders who are comfortable with a standard longboard.",
      active: true,
    },
    {
      id: "greenway-ebike",
      title: "Greenway e-bike",
      category: "E-bike",
      city: "Atlanta",
      area: "Grant Park",
      centsPerDay: 3800,
      owner: "Sam R.",
      description:
        "An upright e-bike for paved paths and neighborhood rides. The rear rack has room for a small bag.",
      active: true,
    },
    {
      id: "folding-scooter",
      title: "Folding city scooter",
      category: "E-scooter",
      city: "Decatur",
      area: "Oakhurst",
      centsPerDay: 2200,
      owner: demoOwner,
      description:
        "A compact scooter with adjustable speed settings. Meet in Oakhurst for a quick overview of the controls.",
      active: false,
      managed: true,
    },
  ],
  bookings: [
    {
      id: "radcity-request",
      listingId: "radcity",
      listingTitle: "RadCity commuter",
      owner: demoOwner,
      start: "2026-12-03",
      end: "2026-12-05",
      totalCents: 6900,
      status: "Requested",
    },
    {
      id: "xiaomi-weekend",
      listingId: "xiaomi-m365",
      listingTitle: "Xiaomi M365",
      owner: "Dana K.",
      start: "2026-12-12",
      end: "2026-12-14",
      totalCents: 4100,
      status: "Confirmed",
    },
    {
      id: "longboard-fall",
      listingId: "electric-longboard",
      listingTitle: "Electric longboard",
      owner: "Alex T.",
      start: "2026-10-14",
      end: "2026-10-16",
      totalCents: 5500,
      status: "Completed",
    },
  ],
  messages: [
    {
      id: "midtown-pickup",
      bookingId: "xiaomi-weekend",
      from: "owner",
      text: "I can meet you by the Midtown entrance. Let me know what time works for you.",
    },
    {
      id: "midtown-reply",
      bookingId: "xiaomi-weekend",
      from: "rider",
      text: "10 a.m. works for me. Thanks!",
    },
  ],
  blocks: [],
};

const dollars = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2,
  minimumFractionDigits: 0,
});

const shortDate = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  timeZone: "UTC",
});

export function money(cents: number) {
  return dollars.format(cents / 100);
}

export function dateRange(start: string, end: string) {
  return (
    shortDate.format(new Date(start)) + " – " + shortDate.format(new Date(end))
  );
}

export function rentalDays(start: string, end: string) {
  return (Date.parse(end) - Date.parse(start)) / 86_400_000;
}

export function isUnavailable(
  demo: Demo,
  listingId: string,
  start: string,
  end: string,
  currentBooking?: string,
) {
  const overlaps = (period: {
    listingId: string;
    start: string;
    end: string;
  }) =>
    period.listingId === listingId && period.start < end && start < period.end;

  return (
    demo.blocks.some(overlaps) ||
    demo.bookings.some(
      (booking) =>
        booking.id !== currentBooking &&
        (booking.status === "Confirmed" || booking.status === "Approved") &&
        overlaps(booking),
    )
  );
}
