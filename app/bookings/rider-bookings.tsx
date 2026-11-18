"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import {
  dateRange,
  money,
  type Booking,
  type BookingStatus,
  type Message,
} from "@/lib/electria-demo";
import { updateDemo, useElectriaDemo } from "@/lib/use-electria-demo";
import styles from "./bookings.module.css";

const filters: ("All" | BookingStatus)[] = [
  "All",
  "Requested",
  "Approved",
  "Confirmed",
  "Completed",
  "Declined",
];

export default function RiderBookings({
  preferredId,
}: {
  preferredId: string;
}) {
  const { bookings, messages } = useElectriaDemo();
  const [filter, setFilter] = useState<(typeof filters)[number]>("All");
  const [selectedId, setSelectedId] = useState(preferredId);

  const visible = bookings.filter(
    (booking) => filter === "All" || booking.status === filter,
  );
  const selected =
    visible.find((booking) => booking.id === selectedId) ?? visible[0];

  return (
    <main className="container page">
      <div className="page-heading">
        <h1>My bookings</h1>
        <p className="muted">
          Track requests, pickup dates, and messages with owners.
        </p>
      </div>
      <div
        className={styles.filters}
        role="group"
        aria-label="Filter bookings by status"
      >
        {filters.map((name) => (
          <button
            key={name}
            type="button"
            aria-pressed={filter === name}
            onClick={() => setFilter(name)}
          >
            {name}
          </button>
        ))}
      </div>
      {!selected ? (
        <div className="empty">
          <h2>
            No {filter === "All" ? "" : filter.toLowerCase() + " "}bookings yet
          </h2>
          <button
            className="button secondary"
            type="button"
            onClick={() => setFilter("All")}
          >
            Show all bookings
          </button>
        </div>
      ) : (
        <div className={styles.grid}>
          <section aria-label="Booking list" className={styles.list}>
            {visible.map((booking) => (
              <button
                key={booking.id}
                type="button"
                className={styles.item}
                aria-pressed={booking.id === selected.id}
                onClick={() => setSelectedId(booking.id)}
              >
                <span className={styles.summary}>
                  <strong>{booking.listingTitle}</strong>
                  <span className="muted">
                    {dateRange(booking.start, booking.end)}
                  </span>
                </span>
                <span className="status" data-state={booking.status}>
                  {booking.status}
                </span>
              </button>
            ))}
          </section>

          <section
            className={"panel flow " + styles.details}
            aria-label="Selected booking"
          >
            <div className={styles.detailHeading}>
              <h2>{selected.listingTitle}</h2>
              <span className="status" data-state={selected.status}>
                {selected.status}
              </span>
            </div>
            <dl className={styles.facts}>
              <div>
                <dt>Pickup and return</dt>
                <dd>{dateRange(selected.start, selected.end)}</dd>
              </div>
              <div>
                <dt>Owner</dt>
                <dd>{selected.owner}</dd>
              </div>
              <div>
                <dt>Estimated total</dt>
                <dd>{money(selected.totalCents)}</dd>
              </div>
            </dl>
            <Link
              className="text-link"
              href={"/listings/" + selected.listingId}
            >
              View listing
            </Link>
            <MessageThread
              key={selected.id}
              booking={selected}
              messages={messages.filter(
                (message) => message.bookingId === selected.id,
              )}
            />
          </section>
        </div>
      )}
    </main>
  );
}

function MessageThread({
  booking,
  messages,
}: {
  booking: Booking;
  messages: Message[];
}) {
  const [draft, setDraft] = useState("");

  function addMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const text = draft.trim();
    if (!text || booking.status === "Declined") return;
    const message: Message = {
      id: crypto.randomUUID(),
      bookingId: booking.id,
      from: "rider",
      text,
    };
    updateDemo((demo) => ({ ...demo, messages: [...demo.messages, message] }));
    setDraft("");
  }

  return (
    <section
      className={"flow " + styles.thread}
      aria-labelledby="messages-heading"
    >
      <h3 id="messages-heading">Messages with {booking.owner}</h3>
      <div className={styles.bubbles} role="log" aria-label="Booking messages">
        {messages.length === 0 && <p className="muted">No messages yet.</p>}
        {messages.map((message) => (
          <div
            key={message.id}
            className={styles.bubble}
            data-from={message.from}
          >
            <strong>{message.from === "rider" ? "You" : booking.owner}</strong>
            <p>{message.text}</p>
          </div>
        ))}
      </div>
      {booking.status !== "Declined" && (
        <form onSubmit={addMessage} className={styles.compose}>
          <label className="field">
            Message
            <input
              type="text"
              maxLength={240}
              placeholder="Ask about pickup"
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
            />
          </label>
          <button className="button" type="submit" disabled={!draft.trim()}>
            Send
          </button>
        </form>
      )}
    </section>
  );
}
