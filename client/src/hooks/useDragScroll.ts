import { useEffect, type RefObject } from "react";

/** Jarak minimum (px) sebelum pointerdown dianggap sebagai drag sungguhan. */
const DRAG_THRESHOLD_PX = 6;

/**
 * Drag-to-scroll untuk rail horizontal (katalog rilisan, dsb).
 *
 * Hanya aktif untuk mouse — layar sentuh sudah bisa digeser secara native
 * (momentum scroll bawaan), jadi menambah logika sentuh di sini justru akan
 * merusaknya. Klik yang berakhir sebagai drag sungguhan ditekan supaya kartu
 * di dalam rail tidak ikut ter-navigasi setelah menggeser.
 */
export function useDragScroll(ref: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let down = false;
    let dragging = false;
    let startX = 0;
    let startScroll = 0;
    let pointerId: number | null = null;

    const reset = () => {
      down = false;
      dragging = false;
      pointerId = null;
    };

    const onPointerDown = (event: PointerEvent) => {
      if (event.pointerType !== "mouse" || event.button !== 0) return;
      down = true;
      dragging = false;
      startX = event.clientX;
      startScroll = el.scrollLeft;
      pointerId = event.pointerId;
    };

    const onPointerMove = (event: PointerEvent) => {
      if (!down || event.pointerId !== pointerId) return;
      const delta = event.clientX - startX;
      if (!dragging && Math.abs(delta) > DRAG_THRESHOLD_PX) {
        dragging = true;
        el.dataset.dragging = "true";
        try {
          el.setPointerCapture(pointerId);
        } catch {
          // Target sudah lepas dari DOM atau pointer sudah invalid — abaikan.
        }
      }
      if (dragging) {
        el.scrollLeft = startScroll - delta;
      }
    };

    const onPointerUp = () => {
      if (dragging) {
        // Klik yang menyusul drag ini (mouseup di atas kartu) ditekan satu
        // kali saja, supaya menggeser rail tidak membuka rilisan di bawah
        // kursor secara tidak sengaja.
        const onClickOnce = (clickEvent: MouseEvent) => {
          clickEvent.preventDefault();
          clickEvent.stopPropagation();
        };
        el.addEventListener("click", onClickOnce, { capture: true, once: true });
      }
      if (dragging && pointerId !== null) {
        try {
          el.releasePointerCapture(pointerId);
        } catch {
          // no-op
        }
      }
      reset();
    };

    el.addEventListener("pointerdown", onPointerDown);
    el.addEventListener("pointermove", onPointerMove);
    el.addEventListener("pointerup", onPointerUp);
    el.addEventListener("pointercancel", reset);

    return () => {
      el.removeEventListener("pointerdown", onPointerDown);
      el.removeEventListener("pointermove", onPointerMove);
      el.removeEventListener("pointerup", onPointerUp);
      el.removeEventListener("pointercancel", reset);
    };
  }, [ref]);
}
