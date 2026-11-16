"use client";

import { useEffect, useId, useRef } from "react";
import { STORE_CONFIG } from "@/data/fragrances";
import { closeDialogWithAnimation } from "./dialogUtils";

export default function NavDrawer({
  isOpen,
  onClose,
  onSelectCategory,
  onOpenWishlist,
  onOpenBag,
  wishlistCount,
  bagCount,
}) {
  const dialogRef = useRef(null);
  const headingId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      if (!dialog.open) {
        dialog.removeAttribute("data-closing");
        dialog.showModal();
      }
    } else if (dialog.open) {
      closeDialogWithAnimation(dialog);
    }
  }, [isOpen]);

  const handleRequestClose = () => {
    closeDialogWithAnimation(dialogRef.current, onClose);
  };

  const navigateCategory = (cat) => {
    handleRequestClose();
    onSelectCategory(cat);
  };

  return (
    <dialog
      ref={dialogRef}
      className="nav-dialog"
      aria-labelledby={headingId}
      onCancel={(e) => {
        if (e.cancelable) {
          e.preventDefault();
          handleRequestClose();
        }
      }}
      onClick={(e) => {
        if (e.target === dialogRef.current) {
          handleRequestClose();
        }
      }}
    >
      <div className="bag-shell">
        <div className="bag-header">
          <div>
            <h2 id={headingId}>{STORE_CONFIG.brandName}</h2>
            <p
              style={{
                fontSize: "0.68rem",
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                color: "var(--accent-gold)",
              }}
            >
              {STORE_CONFIG.tagline}
            </p>
          </div>
          <button
            type="button"
            className="dialog-close-btn"
            style={{ position: "static" }}
            aria-label="Close navigation menu"
            onClick={handleRequestClose}
            autoFocus
          >
            ×
          </button>
        </div>

        <nav className="bag-body" aria-label="Main Menu">
          <ul className="nav-drawer-list">
            <li>
              <button
                type="button"
                className="nav-drawer-link"
                onClick={() => navigateCategory("All")}
              >
                <span>All Fragrances</span>
                <span className="nav-drawer-arrow">→</span>
              </button>
            </li>
            <li>
              <button
                type="button"
                className="nav-drawer-link"
                onClick={() => navigateCategory("Perfume")}
              >
                <span>Perfumes</span>
                <span className="nav-drawer-arrow">→</span>
              </button>
            </li>
            <li>
              <button
                type="button"
                className="nav-drawer-link"
                onClick={() => navigateCategory("Cologne")}
              >
                <span>Colognes</span>
                <span className="nav-drawer-arrow">→</span>
              </button>
            </li>
            <li>
              <button
                type="button"
                className="nav-drawer-link"
                onClick={() => navigateCategory("Unisex")}
              >
                <span>Unisex Extraits</span>
                <span className="nav-drawer-arrow">→</span>
              </button>
            </li>
            <li>
              <a
                href="#story"
                className="nav-drawer-link"
                onClick={handleRequestClose}
              >
                <span>The Scentora Atelier</span>
                <span className="nav-drawer-arrow">→</span>
              </a>
            </li>
          </ul>

          <div
            style={{
              marginTop: "1rem",
              paddingTop: "1.25rem",
              borderTop: "1px solid var(--border-hairline)",
              display: "grid",
              gap: "0.65rem",
            }}
          >
            <button
              type="button"
              className="btn-secondary"
              style={{ width: "100%", justifyContent: "space-between" }}
              onClick={() => {
                handleRequestClose();
                onOpenWishlist();
              }}
            >
              <span>Wishlist</span>
              <span>{wishlistCount}</span>
            </button>
            <button
              type="button"
              className="btn-primary"
              style={{ width: "100%", justifyContent: "space-between" }}
              onClick={() => {
                handleRequestClose();
                onOpenBag();
              }}
            >
              <span>Shopping Bag</span>
              <span>{bagCount}</span>
            </button>
          </div>
        </nav>

        <div className="bag-footer">
          <div style={{ fontSize: "0.8rem", color: "var(--ink-secondary)" }}>
            <div>{STORE_CONFIG.location}</div>
            <div>{STORE_CONFIG.email}</div>
          </div>
        </div>
      </div>
    </dialog>
  );
}

