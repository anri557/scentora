"use client";

import { useCallback, useMemo, useState, useSyncExternalStore } from "react";
import Image from "next/image";
import { LuClock, LuPackage, LuSparkles } from "react-icons/lu";
import { FaFacebookF, FaInstagram, FaTiktok, FaWhatsapp } from "react-icons/fa6";
import {
  CATEGORIES,
  FRAGRANCES,
  STORE_CONFIG,
} from "@/data/fragrances";
import ProductModal from "./ProductModal";
import BagDrawer from "./BagDrawer";
import WishlistDrawer from "./WishlistDrawer";
import NavDrawer from "./NavDrawer";

const STORAGE_KEY = "scentora_bag_v1";
const WISHLIST_KEY = "scentora_wishlist_v1";
const EMPTY_BAG = [];
let cachedRaw = null;
let cachedParsed = EMPTY_BAG;
let cachedWishlistRaw = null;
let cachedWishlistParsed = EMPTY_BAG;

function subscribeToBag(callback) {
  const handleStorage = (e) => {
    if (!e.key || e.key === STORAGE_KEY) callback();
  };
  window.addEventListener("storage", handleStorage);
  window.addEventListener("scentora-bag-change", callback);
  return () => {
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener("scentora-bag-change", callback);
  };
}

function getBagSnapshot() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === cachedRaw) return cachedParsed;
    cachedRaw = raw;
    if (!raw) {
      cachedParsed = EMPTY_BAG;
    } else {
      const parsed = JSON.parse(raw);
      cachedParsed = Array.isArray(parsed) ? parsed : EMPTY_BAG;
    }
    return cachedParsed;
  } catch {
    return EMPTY_BAG;
  }
}

function subscribeToWishlist(callback) {
  const handleStorage = (e) => {
    if (!e.key || e.key === WISHLIST_KEY) callback();
  };
  window.addEventListener("storage", handleStorage);
  window.addEventListener("scentora-wishlist-change", callback);
  return () => {
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener("scentora-wishlist-change", callback);
  };
}

function getWishlistSnapshot() {
  try {
    const raw = localStorage.getItem(WISHLIST_KEY);
    if (raw === cachedWishlistRaw) return cachedWishlistParsed;
    cachedWishlistRaw = raw;
    if (!raw) {
      cachedWishlistParsed = EMPTY_BAG;
    } else {
      const parsed = JSON.parse(raw);
      cachedWishlistParsed = Array.isArray(parsed) ? parsed : EMPTY_BAG;
    }
    return cachedWishlistParsed;
  } catch {
    return EMPTY_BAG;
  }
}

function getServerBagSnapshot() {
  return EMPTY_BAG;
}

function writeBag(nextItems) {
  try {
    const raw = JSON.stringify(nextItems);
    cachedRaw = raw;
    cachedParsed = nextItems;
    localStorage.setItem(STORAGE_KEY, raw);
    window.dispatchEvent(new Event("scentora-bag-change"));
  } catch {
    // Ignore storage errors
  }
}

function writeWishlist(nextIds) {
  try {
    const raw = JSON.stringify(nextIds);
    cachedWishlistRaw = raw;
    cachedWishlistParsed = nextIds;
    localStorage.setItem(WISHLIST_KEY, raw);
    window.dispatchEvent(new Event("scentora-wishlist-change"));
  } catch {
    // Ignore storage errors
  }
}

export default function StorefrontClient() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("featured");

  // Track chosen bottle size per product card (defaults to 50ml or first variant)
  const [cardSizes, setCardSizes] = useState(() => {
    const initial = {};
    for (const item of FRAGRANCES) {
      initial[item.id] = item.variants[1]?.size || item.variants[0]?.size;
    }
    return initial;
  });

  const bagItems = useSyncExternalStore(
    subscribeToBag,
    getBagSnapshot,
    getServerBagSnapshot
  );
  const wishlistIds = useSyncExternalStore(
    subscribeToWishlist,
    getWishlistSnapshot,
    getServerBagSnapshot
  );
  const [bagOpen, setBagOpen] = useState(false);
  const [wishlistOpen, setWishlistOpen] = useState(false);
  const [navOpen, setNavOpen] = useState(false);
  const [activeModal, setActiveModal] = useState(null); // { product, size }
  const [recentlyAddedId, setRecentlyAddedId] = useState(null);

  const toggleWishlist = useCallback((productId) => {
    const current = getWishlistSnapshot();
    const next = current.includes(productId)
      ? current.filter((id) => id !== productId)
      : [...current, productId];
    writeWishlist(next);
  }, []);

  const updateBag = useCallback((updater) => {
    const current = getBagSnapshot();
    const next = typeof updater === "function" ? updater(current) : updater;
    writeBag(next);
  }, []);

  const totalBagCount = bagItems.reduce((sum, item) => sum + item.quantity, 0);

  const filteredFragrances = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    const list = FRAGRANCES.filter((item) => {
      if (selectedCategory !== "All" && item.category !== selectedCategory) {
        return false;
      }
      if (!q) return true;

      const haystack = [
        item.name,
        item.subtitle,
        item.category,
        item.scentFamily,
        item.description,
        ...item.notes.top,
        ...item.notes.heart,
        ...item.notes.base,
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(q);
    });

    if (sortBy === "price-asc") {
      return [...list].sort(
        (a, b) =>
          (a.variants.find((v) => v.size === cardSizes[a.id])?.price ??
            a.variants[0].price) -
          (b.variants.find((v) => v.size === cardSizes[b.id])?.price ??
            b.variants[0].price)
      );
    }
    if (sortBy === "price-desc") {
      return [...list].sort(
        (a, b) =>
          (b.variants.find((v) => v.size === cardSizes[b.id])?.price ??
            b.variants[0].price) -
          (a.variants.find((v) => v.size === cardSizes[a.id])?.price ??
            a.variants[0].price)
      );
    }
    return list;
  }, [selectedCategory, searchQuery, sortBy, cardSizes]);

  const handleAddToBag = (product, size, price) => {
    updateBag((prev) => {
      const idx = prev.findIndex(
        (i) => i.id === product.id && i.size === size
      );
      if (idx > -1) {
        const next = [...prev];
        next[idx] = { ...next[idx], quantity: next[idx].quantity + 1 };
        return next;
      }
      return [
        ...prev,
        {
          id: product.id,
          name: product.name,
          subtitle: product.subtitle,
          image: product.image,
          size,
          price,
          quantity: 1,
        },
      ];
    });

    setRecentlyAddedId(`${product.id}-${size}`);
    setTimeout(() => setRecentlyAddedId(null), 1300);
  };

  const handleUpdateQty = (id, size, newQty) => {
    if (newQty <= 0) {
      handleRemoveItem(id, size);
      return;
    }
    updateBag((prev) =>
      prev.map((item) =>
        item.id === id && item.size === size
          ? { ...item, quantity: newQty }
          : item
      )
    );
  };

  const handleRemoveItem = (id, size) => {
    updateBag((prev) =>
      prev.filter((item) => !(item.id === id && item.size === size))
    );
  };

  const jumpToCategory = (cat) => {
    setSelectedCategory(cat);
    document
      .getElementById("collection")
      ?.scrollIntoView({ behavior: "smooth" });
  };

  const signatureFragrance = FRAGRANCES[0];

  return (
    <>
      <div className="announcement-bar">
        Complimentary Courier Delivery Over{" "}
        <span>
          {STORE_CONFIG.freeShippingThreshold} {STORE_CONFIG.currencySymbol}
        </span>{" "}
        · Signature Gift Box Included
      </div>

      <header className="site-header">
        <div className="container header-inner">
          <div className="header-left">
            <button
              type="button"
              className="hamburger-btn"
              aria-label="Open navigation menu"
              aria-expanded={navOpen}
              onClick={() => setNavOpen(true)}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
                aria-hidden="true"
              >
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
              <span className="hamburger-label">Menu</span>
            </button>

            <nav className="header-nav" aria-label="Primary Navigation">
              <button
                type="button"
                className="nav-link"
                onClick={() => jumpToCategory("All")}
              >
                Collection
              </button>
              <button
                type="button"
                className="nav-link"
                onClick={() => jumpToCategory("Male")}
              >
                Male
              </button>
              <button
                type="button"
                className="nav-link"
                onClick={() => jumpToCategory("Female")}
              >
                Female
              </button>
              <button
                type="button"
                className="nav-link"
                onClick={() => jumpToCategory("Unisex")}
              >
                Unisex
              </button>
              <a href="#story" className="nav-link">
                Atelier
              </a>
            </nav>
          </div>

          <a href="#" className="brand-logo-link" aria-label="Scentora Home">
            <Image
              src="/scentora-logo-header.jpeg"
              alt="SCENTORA — Whispering Aromas"
              width={143}
              height={32}
              priority
              className="brand-logo-img"
            />
          </a>

          <div className="header-actions">
            <button
              type="button"
              className="icon-btn"
              onClick={() => setWishlistOpen(true)}
              aria-label={`Open wishlist, ${wishlistIds.length} saved items`}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill={wishlistIds.length > 0 ? "currentColor" : "none"}
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
              </svg>
              <span className="wishlist-count">{wishlistIds.length}</span>
            </button>

            <button
              type="button"
              className="icon-btn bag-btn"
              onClick={() => setBagOpen(true)}
              aria-label={`Open shopping bag, ${totalBagCount} items`}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
                <path d="M3 6h18" />
                <path d="M16 10a4 4 0 0 1-8 0" />
              </svg>
              <span className="bag-count">{totalBagCount}</span>
            </button>
          </div>
        </div>
      </header>

      <main>
        {/* Editorial Hero */}
        <section className="hero">
          <div className="container hero-grid">
            <div>
              <p className="hero-eyebrow">Scentora Authentic Fragrances</p>
              <h1 className="hero-title">
                Authentic <em>Designer</em> &amp; Niche Fragrances.
              </h1>
              <div className="hero-copy">
                <ul style={{ listStyle: "none", display: "grid", gap: "0.5rem" }}>
                  <li style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                    <LuSparkles
                      size={16}
                      style={{ color: "var(--accent-gold)", flexShrink: 0 }}
                      aria-hidden="true"
                    />
                    <span>Original fragrances by the milliliter</span>
                  </li>
                  <li style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                    <LuPackage
                      size={16}
                      style={{ color: "var(--accent-gold)", flexShrink: 0 }}
                      aria-hidden="true"
                    />
                    <span>Nationwide delivery across Georgia</span>
                  </li>
                  <li style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                    <LuClock
                      size={16}
                      style={{ color: "var(--accent-gold)", flexShrink: 0 }}
                      aria-hidden="true"
                    />
                    <span>Orders accepted 24/7</span>
                  </li>
                </ul>
              </div>
              <div className="hero-cta-row">
                <a href="#collection" className="btn-primary">
                  Explore Collection
                </a>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() =>
                    setActiveModal({
                      product: signatureFragrance,
                      size: "5ml",
                    })
                  }
                >
                  Discover Signature Scent
                </button>
              </div>

              <div className="hero-metrics">
                <div>
                  <div className="metric-value">3 / 5 / 10ml</div>
                  <div className="metric-label">Decant Options</div>
                </div>
                <div>
                  <div className="metric-value">100%</div>
                  <div className="metric-label">Authentic Fragrances</div>
                </div>
                <div>
                  <div className="metric-value">Same-Day</div>
                  <div className="metric-label">Tbilisi Concierge</div>
                </div>
              </div>
            </div>

            <div className="hero-visual">
              <div
                className="hero-visual-frame"
                style={{ cursor: "pointer" }}
                onClick={() =>
                  setActiveModal({
                    product: signatureFragrance,
                    size: "5ml",
                  })
                }
              >
                <Image
                  src={signatureFragrance.image}
                  alt={`${signatureFragrance.name} — ${signatureFragrance.subtitle}`}
                  fill
                  priority
                  sizes="(max-width: 960px) 90vw, 400px"
                  style={{ objectFit: "cover" }}
                />
              </div>
              <div className="hero-visual-caption">
                <div>
                  <strong>{signatureFragrance.name}</strong>
                  <div
                    style={{
                      fontSize: "0.82rem",
                      color: "var(--ink-muted)",
                    }}
                  >
                    {signatureFragrance.notes.top.join(" · ")}
                  </div>
                </div>
                <span>
                  From {signatureFragrance.variants[0].price}{" "}
                  {STORE_CONFIG.currencySymbol}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Fragrance Collection */}
        <section id="collection" className="catalog-section">
          <div className="container">
            <div className="section-header">
              <div>
                <p className="section-eyebrow">The Collection</p>
                <h2 className="section-title">Perfumes, Colognes &amp; Extraits</h2>
              </div>
              <p className="section-count">
                Showing {filteredFragrances.length} of {FRAGRANCES.length}{" "}
                fragrances
              </p>
            </div>

            <div className="filter-toolbar">
              <div className="filter-row">
                <div className="pill-group" role="group" aria-label="Filter by category">
                  <span className="pill-group-label">Type</span>
                  {CATEGORIES.map((category) => (
                    <button
                      key={category}
                      type="button"
                      className="filter-pill"
                      aria-pressed={selectedCategory === category}
                      onClick={() => setSelectedCategory(category)}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>

              <div className="filter-row">
                <search className="search-sort-group">
                  <div className="search-box">
                    <svg
                      className="search-icon"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.75"
                      aria-hidden="true"
                    >
                      <circle cx="11" cy="11" r="8" />
                      <path d="m21 21-4.3-4.3" />
                    </svg>
                    <label htmlFor="fragrance-search" className="visually-hidden">
                      Search fragrances by name or note
                    </label>
                    <input
                      id="fragrance-search"
                      type="search"
                      className="search-input"
                      placeholder="Search by scent, note (e.g. oud, rose, bergamot)..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>

                  <label htmlFor="fragrance-sort" className="visually-hidden">
                    Sort fragrances
                  </label>
                  <select
                    id="fragrance-sort"
                    className="sort-select"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                  >
                    <option value="featured">Sort: Featured</option>
                    <option value="price-asc">Price: Low to High</option>
                    <option value="price-desc">Price: High to Low</option>
                  </select>
                </search>
              </div>
            </div>

            {filteredFragrances.length === 0 ? (
              <div className="empty-state">
                <h3>No fragrances match your selection</h3>
                <p>
                  Try clearing your search or switching back to all fragrance
                  types.
                </p>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => {
                    setSelectedCategory("All");
                    setSearchQuery("");
                  }}
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              <div className="product-grid">
                {filteredFragrances.map((item) => {
                  const activeSize =
                    cardSizes[item.id] || item.variants[0].size;
                  const activeVariant =
                    item.variants.find((v) => v.size === activeSize) ||
                    item.variants[0];
                  const isJustAdded =
                    recentlyAddedId === `${item.id}-${activeVariant.size}`;

                  return (
                    <article key={item.id} className="product-card">
                      <div
                        className="product-media"
                        onClick={() =>
                          setActiveModal({
                            product: item,
                            size: activeVariant.size,
                          })
                        }
                      >
                        <Image
                          src={item.image}
                          alt={`${item.name} — ${item.subtitle}`}
                          width={600}
                          height={800}
                          sizes="(max-width: 600px) 92vw, (max-width: 960px) 46vw, 380px"
                        />
                        {item.badge && (
                          <span className="product-badge">{item.badge}</span>
                        )}
                        <span className="product-category-tag">
                          {item.category}
                        </span>
                        <button
                          type="button"
                          className="wishlist-card-btn"
                          aria-pressed={wishlistIds.includes(item.id)}
                          aria-label={
                            wishlistIds.includes(item.id)
                              ? `Remove ${item.name} from wishlist`
                              : `Save ${item.name} to wishlist`
                          }
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleWishlist(item.id);
                          }}
                        >
                          <svg
                            width="17"
                            height="17"
                            viewBox="0 0 24 24"
                            fill={
                              wishlistIds.includes(item.id)
                                ? "currentColor"
                                : "none"
                            }
                            stroke="currentColor"
                            strokeWidth="1.75"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden="true"
                          >
                            <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                          </svg>
                        </button>
                      </div>

                      <div className="product-body">
                        <div className="product-meta-top">
                          <span className="product-subtitle">
                            {item.subtitle}
                          </span>
                          <span className="product-family">
                            {item.scentFamily}
                          </span>
                        </div>

                        <button
                          type="button"
                          className="product-title-btn"
                          onClick={() =>
                            setActiveModal({
                              product: item,
                              size: activeVariant.size,
                            })
                          }
                        >
                          {item.name}
                        </button>

                        <p className="product-notes-preview">
                          {item.notes.top.slice(0, 2).join(", ")},{" "}
                          {item.notes.heart[0]}, {item.notes.base[0]}
                        </p>

                        <div
                          className="size-selector"
                          role="group"
                          aria-label={`Select size for ${item.name}`}
                        >
                          {item.variants.map((variant) => (
                            <button
                              key={variant.size}
                              type="button"
                              className="size-chip"
                              aria-pressed={activeVariant.size === variant.size}
                              onClick={() =>
                                setCardSizes((prev) => ({
                                  ...prev,
                                  [item.id]: variant.size,
                                }))
                              }
                            >
                              {variant.size}
                            </button>
                          ))}
                        </div>

                        <div className="product-footer">
                          <span className="product-price">
                            {activeVariant.price} {STORE_CONFIG.currencySymbol}
                          </span>
                          <button
                            type="button"
                            className="add-btn"
                            onClick={() =>
                              handleAddToBag(
                                item,
                                activeVariant.size,
                                activeVariant.price
                              )
                            }
                          >
                            {isJustAdded ? "Added ✓" : "Add to Bag"}
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* Brand Philosophy Section */}
        <section id="story" className="story-section">
          <div className="container story-grid">
            <div>
              <p className="section-eyebrow">The Scentora Atelier</p>
              <h2 className="section-title" style={{ marginBottom: "1.25rem" }}>
                Quiet Luxury in Every Drop
              </h2>
              <p
                style={{
                  color: "var(--ink-secondary)",
                  maxWidth: "46ch",
                  marginBottom: "1.5rem",
                }}
              >
                We believe fragrance should never shout across a room. Scentora
                compositions are macerated in small batches for six weeks so
                each note unfolds seamlessly on warm skin.
              </p>
              <button
                type="button"
                className="btn-primary"
                onClick={() => setBagOpen(true)}
              >
                View Your Bag ({totalBagCount})
              </button>
            </div>

            <div className="story-pillars">
              <div className="pillar-card">
                <span className="pillar-num">01</span>
                <div>
                  <h3>Three Decant Sizes</h3>
                  <p>
                    Available in 3ml, 5ml, and 10ml atomizers — experience
                    authentic designer and niche scents by the milliliter.
                  </p>
                </div>
              </div>
              <div className="pillar-card">
                <span className="pillar-num">02</span>
                <div>
                  <h3>Personal Concierge Ordering</h3>
                  <p>
                    Order directly online or message our fragrance specialists
                    via WhatsApp for tailored scent pairing.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* 20% Obsidian Black Footer */}
      <footer className="site-footer">
        <div className="container">
          <div className="footer-grid">
            <div>
              <div className="footer-brand-name">{STORE_CONFIG.brandName}</div>
              <div className="footer-tagline">{STORE_CONFIG.tagline}</div>
            </div>

            <div>
              <div className="footer-heading">Collection</div>
              <ul className="footer-list">
                <li>
                  <a href="#collection" onClick={() => jumpToCategory("All")}>
                    All Fragrances
                  </a>
                </li>
                <li>
                  <a
                    href="#collection"
                    onClick={() => jumpToCategory("Male")}
                  >
                    Male
                  </a>
                </li>
                <li>
                  <a
                    href="#collection"
                    onClick={() => jumpToCategory("Female")}
                  >
                    Female
                  </a>
                </li>
                <li>
                  <a
                    href="#collection"
                    onClick={() => jumpToCategory("Unisex")}
                  >
                    Unisex
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <div className="footer-heading">Concierge</div>
              <ul className="footer-list">
                <li>{STORE_CONFIG.location}</li>
                <li>
                  <a href={`tel:+${STORE_CONFIG.whatsappNumber}`}>
                    {STORE_CONFIG.phoneDisplay}
                  </a>
                </li>
                <li>Daily Delivery · 10:00 – 21:00</li>
                <li style={{ paddingTop: "0.35rem", display: "flex", alignItems: "center", gap: "1rem" }}>
                  <a
                    href={STORE_CONFIG.instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Scentora on Instagram"
                    style={{ display: "inline-flex", alignItems: "center" }}
                  >
                    <FaInstagram size={18} aria-hidden="true" />
                  </a>
                  <a
                    href={STORE_CONFIG.facebookUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Scentora on Facebook"
                    style={{ display: "inline-flex", alignItems: "center" }}
                  >
                    <FaFacebookF size={17} aria-hidden="true" />
                  </a>
                  <a
                    href={STORE_CONFIG.tiktokUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Scentora on TikTok"
                    style={{ display: "inline-flex", alignItems: "center" }}
                  >
                    <FaTiktok size={17} aria-hidden="true" />
                  </a>
                  <a
                    href={`https://wa.me/${STORE_CONFIG.whatsappNumber}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Scentora on WhatsApp"
                    style={{ display: "inline-flex", alignItems: "center" }}
                  >
                    <FaWhatsapp size={19} aria-hidden="true" />
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="footer-bottom">
            <span>
              © 2026 {STORE_CONFIG.brandName}. All rights reserved.
            </span>
            <span>Prices in {STORE_CONFIG.currencyCode} (₾)</span>
          </div>
        </div>
      </footer>

      <ProductModal
        product={activeModal?.product || null}
        initialSize={activeModal?.size}
        onClose={() => setActiveModal(null)}
        onAddToBag={handleAddToBag}
      />

      <BagDrawer
        isOpen={bagOpen}
        items={bagItems}
        onClose={() => setBagOpen(false)}
        onUpdateQty={handleUpdateQty}
        onRemoveItem={handleRemoveItem}
        onClearBag={() => updateBag([])}
      />

      <WishlistDrawer
        isOpen={wishlistOpen}
        wishlistIds={wishlistIds}
        onClose={() => setWishlistOpen(false)}
        onRemove={toggleWishlist}
        onMoveToBag={handleAddToBag}
        onInspect={(product, size) => setActiveModal({ product, size })}
      />

      <NavDrawer
        isOpen={navOpen}
        onClose={() => setNavOpen(false)}
        onSelectCategory={jumpToCategory}
        onOpenWishlist={() => setWishlistOpen(true)}
        onOpenBag={() => setBagOpen(true)}
        wishlistCount={wishlistIds.length}
        bagCount={totalBagCount}
      />
    </>
  );
}

