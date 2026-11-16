"use client";

import { useEffect, useId, useRef, useState } from "react";
import Image from "next/image";
import { STORE_CONFIG } from "@/data/fragrances";
import { closeDialogWithAnimation } from "./dialogUtils";

export default function BagDrawer({
  isOpen,
  items,
  onClose,
  onUpdateQty,
  onRemoveItem,
  onClearBag,
}) {
  const dialogRef = useRef(null);
  const nameInputRef = useRef(null);
  const phoneInputRef = useRef(null);
  const addressInputRef = useRef(null);

  const [step, setStep] = useState("bag"); // "bag" | "checkout" | "confirmed"
  const [giftWrap, setGiftWrap] = useState(false);
  const [orderRef, setOrderRef] = useState("");
  const [customer, setCustomer] = useState({
    name: "",
    phone: "",
    city: "Tbilisi",
    address: "",
    note: "",
  });
  const [touched, setTouched] = useState({});
  const [errors, setErrors] = useState({});
  const [announcement, setAnnouncement] = useState("");

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
    closeDialogWithAnimation(dialogRef.current, () => {
      if (step === "confirmed") {
        setStep("bag");
      }
      onClose();
    });
  };

  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const shippingFee =
    subtotal === 0 || subtotal >= STORE_CONFIG.freeShippingThreshold ? 0 : 12;
  const total = subtotal + shippingFee;
  const remainingForFreeShipping = Math.max(
    0,
    STORE_CONFIG.freeShippingThreshold - subtotal
  );

  const validateField = (field, value) => {
    if (field === "name" && value.trim().length < 2) {
      return "Please enter your full name.";
    }
    if (field === "phone" && value.replace(/\D/g, "").length < 7) {
      return "Please enter a valid phone number.";
    }
    if (field === "address" && value.trim().length < 5) {
      return "Please enter your delivery street address.";
    }
    return "";
  };

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const msg = validateField(field, customer[field]);
    setErrors((prev) => ({ ...prev, [field]: msg }));
    if (msg) {
      setAnnouncement(msg);
    }
  };

  const handleFieldChange = (field, value) => {
    setCustomer((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      const msg = validateField(field, value);
      if (!msg) {
        setErrors((prev) => ({ ...prev, [field]: "" }));
        setAnnouncement("");
      }
    }
  };

  const handleCheckoutSubmit = (e) => {
    e.preventDefault();
    const nextErrors = {
      name: validateField("name", customer.name),
      phone: validateField("phone", customer.phone),
      address: validateField("address", customer.address),
    };
    setTouched({ name: true, phone: true, address: true });
    setErrors(nextErrors);

    if (nextErrors.name) {
      nameInputRef.current?.focus();
      setAnnouncement(nextErrors.name);
      return;
    }
    if (nextErrors.phone) {
      phoneInputRef.current?.focus();
      setAnnouncement(nextErrors.phone);
      return;
    }
    if (nextErrors.address) {
      addressInputRef.current?.focus();
      setAnnouncement(nextErrors.address);
      return;
    }

    const refCode = `SCN-${Math.floor(1000 + Math.random() * 9000)}`;
    setOrderRef(refCode);
    setStep("confirmed");
    onClearBag();
  };

  const buildWhatsAppUrl = () => {
    const lines = [
      `Hello ${STORE_CONFIG.brandName}, I would like to place an order:`,
      "",
      ...items.map(
        (item) =>
          `• ${item.name} (${item.size}) × ${item.quantity} — ${
            item.price * item.quantity
          } ${STORE_CONFIG.currencySymbol}`
      ),
      "",
      `Gift wrapping: ${giftWrap ? "Yes (Complimentary)" : "No"}`,
      `Subtotal: ${subtotal} ${STORE_CONFIG.currencySymbol}`,
      `Delivery: ${
        shippingFee === 0
          ? "Complimentary"
          : `${shippingFee} ${STORE_CONFIG.currencySymbol}`
      }`,
      `Total: ${total} ${STORE_CONFIG.currencySymbol}`,
    ];
    return `https://wa.me/${STORE_CONFIG.whatsappNumber}?text=${encodeURIComponent(
      lines.join("\n")
    )}`;
  };

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
          <h2 id={headingId}>
            {step === "bag" && "Your Bag"}
            {step === "checkout" && "Delivery Details"}
            {step === "confirmed" && "Order Confirmed"}
          </h2>
          <button
            type="button"
            className="dialog-close-btn"
            style={{ position: "static" }}
            aria-label="Close shopping bag"
            onClick={handleRequestClose}
            autoFocus
          >
            ×
          </button>
        </div>

        <div className="bag-body">
          <div className="visually-hidden" aria-live="polite">
            {announcement}
          </div>

          {step === "confirmed" ? (
            <div className="order-confirmation">
              <span className="order-ref">Reference {orderRef}</span>
              <h3
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "1.8rem",
                  fontWeight: 500,
                }}
              >
                Thank you, {customer.name}
              </h3>
              <p style={{ color: "var(--ink-secondary)", fontSize: "0.92rem" }}>
                Your Scentora order request has been recorded for{" "}
                <strong>{customer.city}</strong>. Our concierge will contact you
                at <strong>{customer.phone}</strong> to confirm delivery timing.
              </p>
              <button
                type="button"
                className="btn-primary"
                style={{ marginTop: "0.5rem" }}
                onClick={handleRequestClose}
              >
                Continue Browsing
              </button>
            </div>
          ) : items.length === 0 ? (
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
                Your bag is empty
              </p>
              <p style={{ fontSize: "0.9rem", marginBottom: "1.5rem" }}>
                Explore our perfumes, colognes, and unisex extraits to begin.
              </p>
              <button
                type="button"
                className="btn-secondary"
                onClick={handleRequestClose}
              >
                Explore Collection
              </button>
            </div>
          ) : step === "bag" ? (
            <>
              <div
                style={{
                  padding: "0.75rem 1rem",
                  backgroundColor: "var(--bg-soft)",
                  border: "1px solid var(--border-hairline)",
                  fontSize: "0.82rem",
                  color: "var(--ink-secondary)",
                }}
              >
                {remainingForFreeShipping === 0 ? (
                  <span>
                    You have unlocked{" "}
                    <strong style={{ color: "var(--ink-primary)" }}>
                      complimentary courier delivery
                    </strong>
                    .
                  </span>
                ) : (
                  <span>
                    Add{" "}
                    <strong>
                      {remainingForFreeShipping} {STORE_CONFIG.currencySymbol}
                    </strong>{" "}
                    more for complimentary delivery.
                  </span>
                )}
              </div>

              {items.map((item) => (
                <div key={`${item.id}-${item.size}`} className="bag-item">
                  <Image
                    src={item.image}
                    alt={item.name}
                    width={74}
                    height={96}
                    className="bag-item-img"
                  />
                  <div>
                    <div className="bag-item-top">
                      <span className="bag-item-title">{item.name}</span>
                      <span style={{ fontWeight: 600 }}>
                        {item.price * item.quantity}{" "}
                        {STORE_CONFIG.currencySymbol}
                      </span>
                    </div>
                    <div className="bag-item-variant">
                      {item.subtitle} · {item.size}
                    </div>
                    <div className="bag-item-controls">
                      <div className="qty-stepper">
                        <button
                          type="button"
                          aria-label={`Decrease quantity of ${item.name}`}
                          onClick={() =>
                            onUpdateQty(item.id, item.size, item.quantity - 1)
                          }
                        >
                          −
                        </button>
                        <span>{item.quantity}</span>
                        <button
                          type="button"
                          aria-label={`Increase quantity of ${item.name}`}
                          onClick={() =>
                            onUpdateQty(item.id, item.size, item.quantity + 1)
                          }
                        >
                          +
                        </button>
                      </div>
                      <button
                        type="button"
                        className="remove-link"
                        onClick={() => onRemoveItem(item.id, item.size)}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.65rem",
                  fontSize: "0.86rem",
                  paddingTop: "0.25rem",
                  cursor: "pointer",
                }}
              >
                <input
                  type="checkbox"
                  checked={giftWrap}
                  onChange={(e) => setGiftWrap(e.target.checked)}
                  style={{ accentColor: "var(--surface-dark)", width: 16, height: 16 }}
                />
                <span>Include complimentary Scentora signature gift box</span>
              </label>
            </>
          ) : (
            <form
              id="scentora-checkout-form"
              className="checkout-form"
              onSubmit={handleCheckoutSubmit}
              noValidate
            >
              <div className="form-field">
                <label htmlFor="checkout-name">
                  Full Name <span aria-hidden="true">*</span>
                </label>
                <input
                  ref={nameInputRef}
                  id="checkout-name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  value={customer.name}
                  aria-invalid={Boolean(touched.name && errors.name)}
                  aria-describedby={
                    touched.name && errors.name ? "checkout-name-err" : undefined
                  }
                  onBlur={() => handleBlur("name")}
                  onChange={(e) => handleFieldChange("name", e.target.value)}
                />
                {touched.name && errors.name && (
                  <span id="checkout-name-err" className="field-error">
                    {errors.name}
                  </span>
                )}
              </div>

              <div className="form-field">
                <label htmlFor="checkout-phone">
                  Phone Number <span aria-hidden="true">*</span>
                </label>
                <input
                  ref={phoneInputRef}
                  id="checkout-phone"
                  name="tel"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  required
                  placeholder="+995 5XX XXX XXX"
                  value={customer.phone}
                  aria-invalid={Boolean(touched.phone && errors.phone)}
                  aria-describedby={
                    touched.phone && errors.phone
                      ? "checkout-phone-err"
                      : undefined
                  }
                  onBlur={() => handleBlur("phone")}
                  onChange={(e) => handleFieldChange("phone", e.target.value)}
                />
                {touched.phone && errors.phone && (
                  <span id="checkout-phone-err" className="field-error">
                    {errors.phone}
                  </span>
                )}
              </div>

              <div className="form-field">
                <label htmlFor="checkout-city">City</label>
                <select
                  id="checkout-city"
                  name="city"
                  value={customer.city}
                  onChange={(e) => handleFieldChange("city", e.target.value)}
                >
                  <option value="Tbilisi">Tbilisi (Same / Next Day)</option>
                  <option value="Batumi">Batumi (1–2 Days)</option>
                  <option value="Kutaisi">Kutaisi (1–2 Days)</option>
                  <option value="Other Region">Other Region in Georgia</option>
                </select>
              </div>

              <div className="form-field">
                <label htmlFor="checkout-address">
                  Delivery Address <span aria-hidden="true">*</span>
                </label>
                <input
                  ref={addressInputRef}
                  id="checkout-address"
                  name="street-address"
                  type="text"
                  autoComplete="street-address"
                  required
                  value={customer.address}
                  aria-invalid={Boolean(touched.address && errors.address)}
                  aria-describedby={
                    touched.address && errors.address
                      ? "checkout-address-err"
                      : undefined
                  }
                  onBlur={() => handleBlur("address")}
                  onChange={(e) => handleFieldChange("address", e.target.value)}
                />
                {touched.address && errors.address && (
                  <span id="checkout-address-err" className="field-error">
                    {errors.address}
                  </span>
                )}
              </div>

              <div className="form-field">
                <label htmlFor="checkout-note">Gift Note (Optional)</label>
                <textarea
                  id="checkout-note"
                  name="note"
                  placeholder="Write a personal note for the recipient..."
                  value={customer.note}
                  onChange={(e) => handleFieldChange("note", e.target.value)}
                />
              </div>
            </form>
          )}
        </div>

        {items.length > 0 && step !== "confirmed" && (
          <div className="bag-footer">
            <div className="bag-subtotal-row">
              <span>
                Total{" "}
                <span style={{ fontSize: "0.78rem", color: "var(--ink-muted)" }}>
                  ({shippingFee === 0 ? "Free delivery" : `+${shippingFee} ₾ delivery`})
                </span>
              </span>
              <strong>
                {total} {STORE_CONFIG.currencySymbol}
              </strong>
            </div>

            {step === "bag" ? (
              <>
                <button
                  type="button"
                  className="btn-primary"
                  style={{ width: "100%" }}
                  onClick={() => setStep("checkout")}
                >
                  Proceed to Checkout
                </button>
                <a
                  href={buildWhatsAppUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="whatsapp-btn"
                >
                  Order via WhatsApp
                </a>
              </>
            ) : (
              <div style={{ display: "grid", gap: "0.6rem" }}>
                <button
                  type="submit"
                  form="scentora-checkout-form"
                  className="btn-primary"
                  style={{ width: "100%" }}
                >
                  Confirm Order · {total} {STORE_CONFIG.currencySymbol}
                </button>
                <button
                  type="button"
                  className="btn-secondary"
                  style={{ width: "100%" }}
                  onClick={() => setStep("bag")}
                >
                  Back to Bag
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </dialog>
  );
}

