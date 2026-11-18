"use client";

import { useState, type FormEvent } from "react";
import {
  categories,
  dateRange,
  demoOwner,
  isUnavailable,
  money,
  rentalDays,
  type Booking,
  type Category,
  type Listing,
} from "@/lib/electria-demo";
import { updateDemo, useElectriaDemo } from "@/lib/use-electria-demo";
import styles from "./host.module.css";

export default function OwnerDashboard() {
  const demo = useElectriaDemo();
  const listings = demo.listings.filter((item) => item.managed);
  const requests = demo.bookings.filter((booking) =>
    listings.some((listing) => listing.id === booking.listingId),
  );
  const [editingId, setEditingId] = useState("");
  const editing = listings.find((listing) => listing.id === editingId);
  const [notice, setNotice] = useState("");
  const [decisionError, setDecisionError] = useState("");

  function saveListing(listing: Listing) {
    updateDemo((current) => ({
      ...current,
      listings: editing
        ? current.listings.map((row) => (row.id === listing.id ? listing : row))
        : [...current.listings, listing],
    }));
    setNotice(editing ? "Listing updated." : "Listing published.");
    setEditingId("");
  }

  function toggleListing(listing: Listing) {
    updateDemo((current) => ({
      ...current,
      listings: current.listings.map((row) =>
        row.id === listing.id ? { ...row, active: !row.active } : row,
      ),
    }));
    setNotice(listing.active ? "Listing paused." : "Listing published.");
  }

  function decide(booking: Booking, status: "Approved" | "Declined") {
    if (
      status === "Approved" &&
      isUnavailable(
        demo,
        booking.listingId,
        booking.start,
        booking.end,
        booking.id,
      )
    ) {
      setDecisionError(
        "These dates are unavailable. Check the listing’s availability.",
      );
      return;
    }
    updateDemo((current) => ({
      ...current,
      bookings: current.bookings.map((item) =>
        item.id === booking.id && item.status === "Requested"
          ? { ...item, status }
          : item,
      ),
    }));
    setDecisionError("");
  }

  return (
    <main className="container page">
      <div className="page-heading">
        <h1>Rent out your ride</h1>
        <p className="muted">
          Manage listings, availability, and booking requests.
        </p>
      </div>
      <div className={styles.columns}>
        <div className="flow">
          <section className="panel flow" aria-labelledby="my-listings">
            <h2 id="my-listings">My listings</h2>
            {notice && (
              <p className="notice" role="status">
                {notice}
              </p>
            )}
            <div className={styles.rows}>
              {listings.map((listing) => (
                <div className={styles.row} key={listing.id}>
                  <div>
                    <h3>{listing.title}</h3>
                    <p className={"muted " + styles.small}>
                      {listing.category} · {money(listing.centsPerDay)}/day
                    </p>
                  </div>
                  <div className={styles.actions}>
                    <span
                      className="status"
                      data-state={listing.active ? "Active" : "Paused"}
                    >
                      {listing.active ? "Active" : "Paused"}
                    </span>
                    <button
                      aria-label={"Edit " + listing.title}
                      className="button secondary"
                      type="button"
                      onClick={() => {
                        setEditingId(listing.id);
                        setNotice("");
                      }}
                    >
                      Edit
                    </button>
                    <button
                      aria-label={
                        (listing.active ? "Pause " : "Publish ") + listing.title
                      }
                      className="button secondary"
                      type="button"
                      onClick={() => toggleListing(listing)}
                    >
                      {listing.active ? "Pause" : "Publish"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="panel flow" aria-labelledby="requests">
            <h2 id="requests">Booking requests</h2>
            {decisionError && (
              <p className="error" role="alert">
                {decisionError}
              </p>
            )}
            {requests.length === 0 && <p className="muted">No requests yet.</p>}
            <div className={styles.rows}>
              {requests.map((booking) => (
                <div className={styles.row} key={booking.id}>
                  <div>
                    <h3>{booking.listingTitle}</h3>
                    <p className={"muted " + styles.small}>
                      {dateRange(booking.start, booking.end)} ·{" "}
                      {money(booking.totalCents)}
                    </p>
                  </div>
                  <div className={styles.actions}>
                    <span className="status" data-state={booking.status}>
                      {booking.status}
                    </span>
                    {booking.status === "Requested" && (
                      <>
                        <button
                          className="button"
                          type="button"
                          onClick={() => decide(booking, "Approved")}
                        >
                          Approve
                        </button>
                        <button
                          className="button secondary"
                          type="button"
                          onClick={() => decide(booking, "Declined")}
                        >
                          Decline
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="flow">
          <ListingForm
            key={editing?.id ?? "new"}
            listing={editing}
            onSave={saveListing}
            onCancel={() => setEditingId("")}
          />
          <Availability listings={listings} />
        </div>
      </div>
    </main>
  );
}

function ListingForm({
  listing,
  onSave,
  onCancel,
}: {
  listing?: Listing;
  onSave: (listing: Listing) => void;
  onCancel: () => void;
}) {
  const [error, setError] = useState("");

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const fields = new FormData(event.currentTarget);
    const value = (name: string) => String(fields.get(name) ?? "").trim();
    const title = value("title");
    const city = value("city");
    const area = value("area");
    const description = value("description");
    const category = value("category") as Category;
    const centsPerDay = Math.round(Number(value("rate")) * 100);
    if (
      !title ||
      !city ||
      !area ||
      !description ||
      !categories.includes(category)
    ) {
      setError(
        "Enter a title, category, pickup city, pickup area, and description.",
      );
      return;
    }
    if (
      !Number.isSafeInteger(centsPerDay) ||
      centsPerDay < 100 ||
      centsPerDay > 100000
    ) {
      setError("Enter a daily rate between $1 and $1,000.");
      return;
    }

    onSave({
      id: listing?.id ?? crypto.randomUUID(),
      title,
      city,
      area,
      description,
      category,
      centsPerDay,
      owner: listing?.owner ?? demoOwner,
      active: listing?.active ?? true,
      managed: true,
    });
    setError("");
    if (!listing) event.currentTarget.reset();
  }

  return (
    <section className="panel flow" aria-labelledby="listing-form">
      <h2 id="listing-form">{listing ? "Edit listing" : "New listing"}</h2>
      <form className="flow" onSubmit={submit} noValidate>
        <label className="field">
          Listing title
          <input
            name="title"
            required
            maxLength={75}
            defaultValue={listing?.title}
            placeholder="Example: Weekend e-bike"
          />
        </label>
        <div className="field-row">
          <label className="field">
            Vehicle type
            <select name="category" defaultValue={listing?.category}>
              {categories.map((category) => (
                <option key={category}>{category}</option>
              ))}
            </select>
          </label>
          <label className="field">
            Daily rate ($)
            <input
              name="rate"
              type="number"
              min="1"
              max="1000"
              step="0.01"
              required
              defaultValue={listing ? listing.centsPerDay / 100 : undefined}
              placeholder="25"
            />
          </label>
        </div>
        <div className="field-row">
          <label className="field">
            Pickup city
            <input
              name="city"
              required
              maxLength={45}
              defaultValue={listing?.city}
              placeholder="Atlanta"
            />
          </label>
          <label className="field">
            Pickup area
            <input
              name="area"
              required
              maxLength={55}
              defaultValue={listing?.area}
              placeholder="Grant Park"
            />
          </label>
        </div>
        <label className="field">
          Description
          <textarea
            name="description"
            required
            rows={3}
            maxLength={240}
            defaultValue={listing?.description}
            placeholder="What should a rider know?"
          />
        </label>
        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}
        <div className={styles.formActions}>
          <button className="button" type="submit">
            {listing ? "Save changes" : "Publish listing"}
          </button>
          {listing && (
            <button
              className="button secondary"
              type="button"
              onClick={onCancel}
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </section>
  );
}

function Availability({ listings }: { listings: Listing[] }) {
  const demo = useElectriaDemo();
  const [id, setId] = useState("");
  const listing = listings.find((item) => item.id === id) ?? listings[0];
  const [error, setError] = useState("");
  const blocks = demo.blocks.filter((block) => block.listingId === listing?.id);

  function addBlock(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!listing) return;
    const fields = new FormData(event.currentTarget);
    const start = String(fields.get("blockStart") ?? "");
    const end = String(fields.get("blockEnd") ?? "");
    if (!(rentalDays(start, end) > 0)) {
      setError("The end of the block must be after the start.");
      return;
    }
    if (isUnavailable(demo, listing.id, start, end)) {
      setError("This range overlaps an existing block or booking.");
      return;
    }
    updateDemo((current) => ({
      ...current,
      blocks: [
        ...current.blocks,
        { id: crypto.randomUUID(), listingId: listing.id, start, end },
      ],
    }));
    setError("");
    event.currentTarget.reset();
  }

  return (
    <section className="panel flow" aria-labelledby="availability">
      <h2 id="availability">Availability</h2>
      {listing && (
        <>
          <label className="field">
            Listing
            <select
              value={listing.id}
              onChange={(event) => {
                setId(event.target.value);
                setError("");
              }}
            >
              {listings.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.title}
                </option>
              ))}
            </select>
          </label>
          {blocks.length === 0 && (
            <p className="muted">No dates blocked for this listing.</p>
          )}
          {blocks.map((block) => (
            <div className={styles.row} key={block.id}>
              <span>{dateRange(block.start, block.end)}</span>
              <button
                className="button secondary"
                type="button"
                aria-label={
                  "Remove blocked dates " + dateRange(block.start, block.end)
                }
                onClick={() =>
                  updateDemo((current) => ({
                    ...current,
                    blocks: current.blocks.filter(
                      (item) => item.id !== block.id,
                    ),
                  }))
                }
              >
                Remove
              </button>
            </div>
          ))}
          <form className="flow" onSubmit={addBlock} noValidate>
            <div className="field-row">
              <label className="field">
                Block from
                <input type="date" name="blockStart" required />
              </label>
              <label className="field">
                Block until
                <input type="date" name="blockEnd" required />
              </label>
            </div>
            {error && (
              <p className="error" role="alert">
                {error}
              </p>
            )}
            <div className={styles.formActions}>
              <button className="button secondary">Block dates</button>
            </div>
          </form>
        </>
      )}
    </section>
  );
}
