"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { STORE_CONFIG } from "@/data/fragrances";
import { closeDialogWithAnimation } from "./dialogUtils";

export default function ProductModal({
  product,
  initialSize,
  onClose,
  onAddToBag,
}) {
  const dialogRef = useRef(null);
  const [sizeOverride, setSizeOverride] = useState(null);

  const selectedSize =
    (sizeOverride && product && sizeOverride.productId === product.id
      ? sizeOverride.size
      : null) ||
    initialSize ||
    product?.variants?.[1]?.size ||
    product?.variants?.[0]?.size;

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (product) {
      if (!dialog.open) {
        dialog.removeAttribute("data-closing");
        dialog.showModal();
      }
    } else if (dialog.open) {
      closeDialogWithAnimation(dialog);
    }
  }, [product]);

  const handleRequestClose = () => {
    closeDialogWithAnimation(dialogRef.current, onClose);
  };

  const activeVariant =
    product?.variants.find((v) => v.size === selectedSize) ||
    product?.variants[0];

  return (
    <dialog
      ref={dialogRef}
      className="product-dialog"
      aria-labelledby={product ? `modal-title-${product.id}` : undefined}
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
      {product && (
        <div style={{ position: "relative" }}>
          <button
            type="button"
            className="dialog-close-btn"
            aria-label="Close fragrance details"
            onClick={handleRequestClose}
            autoFocus
          >
            ×
          </button>

          <div className="modal-grid">
            <div className="modal-media">
              <Image
                src={product.image}
                alt={`${product.name} — ${product.subtitle}`}
                width={600}
                height={800}
                sizes="(max-width: 960px) 92vw, 420px"
              />
            </div>

            <div className="modal-content">
              <div>
                <p className="product-subtitle">
                  {product.category} · {product.subtitle}
                </p>
                <h2 id={`modal-title-${product.id}`} className="modal-title">
                  {product.name}
                </h2>
              </div>

              <p style={{ color: "var(--ink-secondary)", fontSize: "0.95rem" }}>
                {product.description}
              </p>

              <div className="notes-pyramid" aria-label="Olfactory Notes">
                <div className="notes-row">
                  <span className="notes-label">Top</span>
                  <span>{product.notes.top.join(", ")}</span>
                </div>
                <div className="notes-row">
                  <span className="notes-label">Heart</span>
                  <span>{product.notes.heart.join(", ")}</span>
                </div>
                <div className="notes-row">
                  <span className="notes-label">Base</span>
                  <span>{product.notes.base.join(", ")}</span>
                </div>
              </div>

              <div className="performance-bars">
                <div>
                  <div className="perf-label">Longevity</div>
                  <div className="perf-dots" aria-label={`${product.longevity} out of 5`}>
                    {[1, 2, 3, 4, 5].map((n) => (
                      <span
                        key={n}
                        className={`perf-dot ${n <= product.longevity ? "active" : ""}`}
                      />
                    ))}
                  </div>
                </div>
                <div>
                  <div className="perf-label">Sillage</div>
                  <div className="perf-dots" aria-label={`${product.sillage} out of 5`}>
                    {[1, 2, 3, 4, 5].map((n) => (
                      <span
                        key={n}
                        className={`perf-dot ${n <= product.sillage ? "active" : ""}`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <div className="perf-label" style={{ marginBottom: "0.5rem" }}>
                  Select Bottle Size
                </div>
                <div className="size-selector" role="group" aria-label="Bottle size">
                  {product.variants.map((variant) => (
                    <button
                      key={variant.size}
                      type="button"
                      className="size-chip"
                      aria-pressed={selectedSize === variant.size}
                      onClick={() =>
                        setSizeOverride({
                          productId: product.id,
                          size: variant.size,
                        })
                      }
                    >
                      {variant.size} — {variant.price}
                      {STORE_CONFIG.currencySymbol}
                    </button>
                  ))}
                </div>
              </div>

              <div
                style={{
                  marginTop: "auto",
                  paddingTop: "1rem",
                  borderTop: "1px solid var(--border-hairline)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "1rem",
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: "0.72rem",
                      textTransform: "uppercase",
                      letterSpacing: "0.12em",
                      color: "var(--ink-muted)",
                    }}
                  >
                    {activeVariant.size} · {product.occasion}
                  </div>
                  <div className="product-price" style={{ fontSize: "1.75rem" }}>
                    {activeVariant.price} {STORE_CONFIG.currencySymbol}
                  </div>
                </div>

                <button
                  type="button"
                  className="btn-primary"
                  onClick={() => {
                    onAddToBag(product, activeVariant.size, activeVariant.price);
                    handleRequestClose();
                  }}
                >
                  Add to Bag
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </dialog>
  );
}

