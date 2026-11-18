"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, type FormEvent } from "react";
import {
  categoryImages,
  isUnavailable,
  money,
  rentalDays,
  serviceFeeCents,
} from "@/lib/electria-demo";
import { updateDemo, useElectriaDemo } from "@/lib/use-electria-demo";
import styles from "./listing.module.css";

export default function ListingDetail({ id }: { id: string }) {
  const demo = useElectriaDemo();
  const listing = demo.listings.find((item) => item.id === id && item.active);
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [error, setError] = useState("");
  const [submittedId, setSubmittedId] = useState("");

  if (!listing) {
    return (
      <main className="container page">
        <div className="empty">
          <h1>Ride unavailable</h1>
          <p className="muted">This listing may have been paused or removed.</p>
          <Link className="button" href="/browse">
            Browse other rides
          </Link>
        </div>
      </main>
    );
  }

  const { title, category, city, area, owner, description, centsPerDay } =
    listing;
  const days = rentalDays(start, end);
  const validRange = Number.isInteger(days) && days > 0;
  const subtotal = validRange ? days * centsPerDay : 0;
  const total = subtotal + serviceFeeCents;

  function requestBooking(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const dates = new FormData(event.currentTarget);
    const pickup = String(dates.get("pickup") ?? "");
    const returns = String(dates.get("return") ?? "");
    const requestedDays = rentalDays(pickup, returns);
    setStart(pickup);
    setEnd(returns);
    if (!pickup || !returns) {
      setError("Choose both a pickup date and a return date.");
      return;
    }
    if (!Number.isInteger(requestedDays) || requestedDays <= 0) {
      setError("The return date must be after the pickup date.");
      return;
    }
    if (isUnavailable(demo, id, pickup, returns)) {
      setError("Those dates are unavailable. Choose another date range.");
      return;
    }
    if (
      demo.bookings.some(
        (booking) =>
          booking.listingId === id &&
          booking.start === pickup &&
          booking.end === returns &&
          booking.status === "Requested",
      )
    ) {
      setError("You already requested this ride for those dates.");
      return;
    }

    const bookingId = crypto.randomUUID();
    updateDemo((current) => ({
      ...current,
      bookings: [
        {
          id: bookingId,
          listingId: id,
          listingTitle: title,
          owner,
          start: pickup,
          end: returns,
          totalCents: requestedDays * centsPerDay + serviceFeeCents,
          status: "Requested",
        },
        ...current.bookings,
      ],
    }));
    setError("");
    setSubmittedId(bookingId);
  }

  return (
    <main className="container page">
      <Link className="text-link" href="/browse">
        ← Back to browse
      </Link>
      <div className={styles.grid}>
        <section className={styles.details} aria-labelledby="ride-title">
          <div className={styles.image} data-category={category}>
            <Image
              src={categoryImages[category]}
              alt={category + " example photo"}
              fill
              preload
              sizes="(max-width: 800px) 95vw, 60vw"
            />
          </div>
          <div className="flow">
            <p className="eyebrow">
              {category} · {city}
            </p>
            <h1 id="ride-title">{title}</h1>
            <p className="muted">{description}</p>
            <dl className={styles.facts}>
              <div>
                <dt>Pickup area</dt>
                <dd>
                  {area}, {city}
                </dd>
              </div>
              <div>
                <dt>Owner</dt>
                <dd>{owner}</dd>
              </div>
            </dl>
          </div>
        </section>

        <aside
          className={"panel flow " + styles.booking}
          aria-labelledby="request-title"
        >
          <div className={styles.price}>
            <strong>{money(centsPerDay)}</strong>{" "}
            <span className="muted">/ day</span>
          </div>
          <h2 id="request-title">Request this ride</h2>
          {submittedId ? (
            <div className="flow">
              <p className="notice" role="status">
                Request saved. It is waiting for the owner’s response.
              </p>
              <Link
                className="button"
                href={{
                  pathname: "/bookings",
                  query: { booking: submittedId },
                }}
              >
                View my booking
              </Link>
            </div>
          ) : (
            <form className="flow" onSubmit={requestBooking} noValidate>
              <div className="field-row">
                <label className="field">
                  Pickup date
                  <input
                    type="date"
                    required
                    name="pickup"
                    onBlur={(event) => setStart(event.currentTarget.value)}
                    onInput={(event) => {
                      setStart(event.currentTarget.value);
                      setError("");
                    }}
                  />
                </label>
                <label className="field">
                  Return date
                  <input
                    type="date"
                    required
                    min={start || undefined}
                    name="return"
                    onBlur={(event) => setEnd(event.currentTarget.value)}
                    onInput={(event) => {
                      setEnd(event.currentTarget.value);
                      setError("");
                    }}
                  />
                </label>
              </div>
              {validRange && (
                <dl className={styles.cost} aria-label="Estimated price">
                  <div>
                    <dt>
                      {days} {days === 1 ? "day" : "days"} ×{" "}
                      {money(centsPerDay)}
                    </dt>
                    <dd>{money(subtotal)}</dd>
                  </div>
                  <div>
                    <dt>Service fee</dt>
                    <dd>{money(serviceFeeCents)}</dd>
                  </div>
                  <div>
                    <dt>Estimated total</dt>
                    <dd>{money(total)}</dd>
                  </div>
                </dl>
              )}
              {error && (
                <p className="error" role="alert">
                  {error}
                </p>
              )}
              <button className="button" type="submit">
                Request to book
              </button>
            </form>
          )}
        </aside>
      </div>
    </main>
  );
}
