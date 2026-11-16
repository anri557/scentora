"use client";

let supportsDisplayTransition;

function canTransitionDisplay() {
  if (supportsDisplayTransition !== undefined) return supportsDisplayTransition;
  if (
    typeof window === "undefined" ||
    !window.CSS?.supports?.("transition-behavior", "allow-discrete") ||
    !document.body
  ) {
    return false;
  }
  const probe = document.createElement("div");
  probe.style.cssText =
    "transition: display 1s allow-discrete !important; display: block;";
  document.body.appendChild(probe);
  getComputedStyle(probe).display;
  probe.style.display = "none";
  supportsDisplayTransition = getComputedStyle(probe).display === "block";
  probe.remove();
  return supportsDisplayTransition;
}

function supportsTopLayerExit() {
  return (
    typeof window !== "undefined" &&
    window.CSS?.supports?.("overlay", "auto") &&
    canTransitionDisplay()
  );
}

/**
 * Closes a native <dialog> while preserving its exit transition across browsers
 * (using the data-closing fallback where overlay / discrete display transitions
 * are unsupported).
 */
export async function closeDialogWithAnimation(dialogEl, onClosed) {
  if (!dialogEl || !dialogEl.open) {
    onClosed?.();
    return;
  }

  if (!supportsTopLayerExit()) {
    dialogEl.setAttribute("data-closing", "");
    const animations = dialogEl.getAnimations({ subtree: true });
    if (animations.length > 0) {
      await Promise.race([
        Promise.allSettled(animations.map((a) => a.finished)),
        new Promise((resolve) => setTimeout(resolve, 600)),
      ]);
    }
    if (!dialogEl.hasAttribute("data-closing")) return;
    dialogEl.removeAttribute("data-closing");
  }

  if (dialogEl.open) {
    dialogEl.close();
  }
  onClosed?.();
}

