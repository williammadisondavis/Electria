"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { categories, categoryImages, money } from "@/lib/electria-demo";
import { useElectriaDemo } from "@/lib/use-electria-demo";
import styles from "./browse.module.css";

export default function Browse() {
  const { listings } = useElectriaDemo();
  const [city, setCity] = useState("");
  const [category, setCategory] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sort, setSort] = useState("featured");

  const active = listings.filter((listing) => listing.active);
  const cities = Array.from(
    new Set(active.map((listing) => listing.city)),
  ).sort();
  const results = active.filter(
    (listing) =>
      (!city || city === listing.city) &&
      (!category || category === listing.category) &&
      (maxPrice === "" || listing.centsPerDay <= Number(maxPrice) * 100),
  );

  if (sort === "price-low") {
    results.sort((a, b) => a.centsPerDay - b.centsPerDay);
  }
  if (sort === "price-high") {
    results.sort((a, b) => b.centsPerDay - a.centsPerDay);
  }

  function resetFilters() {
    setCity("");
    setCategory("");
    setMaxPrice("");
    setSort("featured");
  }

  return (
    <main className={"container page " + styles.page}>
      <section className={styles.hero} aria-labelledby="browse-title">
        <div className={styles.intro}>
          <p className="eyebrow">Atlanta &amp; Decatur</p>
          <h1 id="browse-title">Find a ride.</h1>
          <p>Rent e-bikes, scooters, and boards from local owners.</p>
          <a href="#listings" className="button accent">
            Explore rides <span aria-hidden="true">↓</span>
          </a>
        </div>
        <div className={styles.heroImage}>
          <Image
            src="/electria/hero.webp"
            alt="Black electric bicycle in profile"
            fill
            preload
            sizes="(max-width: 680px) 94vw, 55vw"
          />
        </div>
      </section>

      <section
        id="listings"
        aria-labelledby="listings-title"
        className={styles.listings}
      >
        <div className={styles.sectionTitle}>
          <h2 id="listings-title">Rides near you</h2>
          <button className={styles.clear} type="button" onClick={resetFilters}>
            Clear filters
          </button>
        </div>
        <div className={"panel " + styles.filters}>
          <label className="field">
            Pickup city
            <select
              value={city}
              onChange={(event) => setCity(event.target.value)}
            >
              <option value="">Any city</option>
              {cities.map((name) => (
                <option key={name}>{name}</option>
              ))}
            </select>
          </label>
          <label className="field">
            Vehicle type
            <select
              value={category}
              onChange={(event) => setCategory(event.target.value)}
            >
              <option value="">All vehicle types</option>
              {categories.map((name) => (
                <option key={name}>{name}</option>
              ))}
            </select>
          </label>
          <label className="field">
            Max price per day
            <input
              type="number"
              min="0"
              step="1"
              placeholder="Any price"
              value={maxPrice}
              onChange={(event) => setMaxPrice(event.target.value)}
            />
          </label>
        </div>
        <div className={styles.resultBar}>
          <p className="muted" role="status">
            {results.length} {results.length === 1 ? "ride" : "rides"} found
          </p>
          <label className={"field " + styles.sort}>
            Sort by
            <select
              value={sort}
              onChange={(event) => setSort(event.target.value)}
            >
              <option value="featured">Recommended</option>
              <option value="price-low">Price: low to high</option>
              <option value="price-high">Price: high to low</option>
            </select>
          </label>
        </div>
        {results.length > 0 ? (
          <div className={styles.grid}>
            {results.map((listing) => (
              <Link
                href={"/listings/" + listing.id}
                className={styles.card}
                key={listing.id}
              >
                <div
                  className={styles.cardImage}
                  data-category={listing.category}
                >
                  <Image
                    src={categoryImages[listing.category]}
                    alt=""
                    fill
                    sizes="(max-width: 550px) 95vw, (max-width: 960px) 47vw, 33vw"
                  />
                </div>
                <div className={styles.cardBody}>
                  <p className="eyebrow">
                    {listing.category} · {listing.city}
                  </p>
                  <div className={styles.cardTitle}>
                    <h3>{listing.title}</h3>
                    <span>
                      <strong>{money(listing.centsPerDay)}</strong>
                      <span className="muted"> / day</span>
                    </span>
                  </div>
                  <p className={"muted " + styles.location}>{listing.area}</p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="empty">
            <h3>No rides match these filters.</h3>
            <p className="muted">Try another city, vehicle type, or price.</p>
            <button
              type="button"
              className="button secondary"
              onClick={resetFilters}
            >
              Show all rides
            </button>
          </div>
        )}
      </section>
    </main>
  );
}
