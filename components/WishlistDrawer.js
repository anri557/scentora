"use client";

import { useEffect, useId, useRef } from "react";
import Image from "next/image";
import { FRAGRANCES, STORE_CONFIG } from "@/data/fragrances";
import { closeDialogWithAnimation } from "./dialogUtils";

export default function WishlistDrawer({
  isOpen,
  wishlistIds,
  onClose,
  onRemove,
  onMoveToBag,
  onInspect,
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

  const savedFragrances = FRAGRANCES.filter((item) =>
    wishlistIds.includes(item.id)
  );

  return (
    <dialog
      ref={dialogRef}
      className="bag-dialog"
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
          <h2 id={headingId}>Wishlist</h2>
          <button
            type="button"
            className="dialog-close-btn"
            style={{ position: "static" }}
            aria-label="Close wishlist"
            onClick={handleRequestClose}
            autoFocus
          >
            ×
          </button>
        </div>

        <div className="bag-body">
          {savedFragrances.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                paddingBlock: "3.5rem",
                color: "var(--ink-secondary)",
              }}
            >
              <p
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "1.5rem",
                  color: "var(--ink-primary)",
                  marginBottom: "0.5rem",
                }}
              >
                Your wishlist is empty
              </p>
              <p style={{ fontSize: "0.9rem", marginBottom: "1.5rem" }}>
                Tap the heart icon on any fragrance to save your favorites for
                later.
              </p>
              <button
                type="button"
                className="btn-secondary"
                onClick={handleRequestClose}
              >
                Explore Collection
              </button>
            </div>
          ) : (
            savedFragrances.map((item) => {
              const defaultVariant = item.variants[1] || item.variants[0];
              return (
                <div key={item.id} className="bag-item">
                  <Image
                    src={item.image}
                    alt={item.name}
                    width={74}
                    height={96}
                    className="bag-item-img"
                    style={{ cursor: "pointer" }}
                    onClick={() => {
                      handleRequestClose();
                      onInspect(item, defaultVariant.size);
                    }}
                  />
                  <div>
                    <div className="bag-item-top">
                      <button
                        type="button"
                        className="bag-item-title"
                        style={{ textAlign: "left" }}
                        onClick={() => {
                          handleRequestClose();
                          onInspect(item, defaultVariant.size);
                        }}
                      >
                        {item.name}
                      </button>
                      <span style={{ fontWeight: 600 }}>
                        {defaultVariant.price} {STORE_CONFIG.currencySymbol}
                      </span>
                    </div>
                    <div className="bag-item-variant">
                      {item.subtitle} · {defaultVariant.size}
                    </div>
                    <div className="bag-item-controls">
                      <button
                        type="button"
                        className="add-btn"
                        style={{ minHeight: 34, padding: "0.35rem 0.85rem" }}
                        onClick={() => {
                          onMoveToBag(
                            item,
                            defaultVariant.size,
                            defaultVariant.price
                          );
                          onRemove(item.id);
                        }}
                      >
                        Move to Bag
                      </button>
                      <button
                        type="button"
                        className="remove-link"
                        onClick={() => onRemove(item.id)}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </dialog>
  );
}

