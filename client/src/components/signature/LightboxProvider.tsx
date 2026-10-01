import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { ArrowLeft, ArrowRight, X } from "lucide-react";
import "./Lightbox.css";

/**
 * Lightbox global.
 *
 * Tidak pernah ada di HTML SSR (hanya dirender setelah mount + dibuka user),
 * punya focus trap, ESC, panah kiri/kanan, swipe, caption editorial, dan
 * mengembalikan fokus ke elemen pemicu saat ditutup.
 */

export type LightboxItem = {
  id: string;
  src: string;
  alt: string;
  caption?: string;
  meta?: string;
  href?: string;
};

type LightboxApi = {
  open: (items: LightboxItem[], index: number) => void;
  close: () => void;
};

const LightboxContext = createContext<LightboxApi | null>(null);

export function useLightbox(): LightboxApi {
  return (
    useContext(LightboxContext) ?? {
      open: () => undefined,
      close: () => undefined,
    }
  );
}

export function LightboxProvider({
  children,
  lang = "id",
}: {
  children: ReactNode;
  lang?: "id" | "en";
}) {
  const [items, setItems] = useState<LightboxItem[]>([]);
  const [index, setIndex] = useState(0);
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLElement | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const touchStart = useRef<{ x: number; y: number } | null>(null);

  const api = useMemo<LightboxApi>(
    () => ({
      open(nextItems, nextIndex) {
        if (!nextItems.length) return;
        triggerRef.current =
          document.activeElement instanceof HTMLElement
            ? document.activeElement
            : null;
        setItems(nextItems);
        setIndex(Math.max(0, Math.min(nextIndex, nextItems.length - 1)));
        setOpen(true);
      },
      close() {
        setOpen(false);
      },
    }),
    []
  );

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (open) return;
    const trigger = triggerRef.current;
    if (!trigger) return;
    // Fokus kembali ke pemicu setelah overlay benar-benar dilepas.
    const frame = requestAnimationFrame(() => trigger.focus());
    return () => cancelAnimationFrame(frame);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const dialog = dialogRef.current;
    dialog?.focus();

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        close();
        return;
      }
      if (event.key === "ArrowRight") {
        event.preventDefault();
        setIndex(value => (value + 1) % items.length);
        return;
      }
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        setIndex(value => (value - 1 + items.length) % items.length);
        return;
      }
      if (event.key !== "Tab" || !dialog) return;
      const focusable = dialog.querySelectorAll<HTMLElement>(
        "button, a[href], [tabindex]:not([tabindex='-1'])"
      );
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [close, items.length, open]);

  // Preload tetangga supaya navigasi terasa instan.
  useEffect(() => {
    if (!open || items.length < 2) return;
    [index - 1, index + 1].forEach(position => {
      const item = items[(position + items.length) % items.length];
      if (!item) return;
      const image = new Image();
      image.src = item.src;
    });
  }, [index, items, open]);

  const current = items[index];
  const copy =
    lang === "en"
      ? { close: "Close", next: "Next image", previous: "Previous image", label: "Image viewer" }
      : { close: "Tutup", next: "Gambar berikutnya", previous: "Gambar sebelumnya", label: "Penampil gambar" };

  return (
    <LightboxContext.Provider value={api}>
      {children}
      {open && current ? (
        <div
          className="an-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label={copy.label}
          onPointerDown={event => {
            if (event.target === event.currentTarget) close();
          }}
        >
          <div
            className="an-lightbox-frame"
            ref={dialogRef}
            tabIndex={-1}
            onTouchStart={event => {
              const touch = event.touches[0];
              touchStart.current = { x: touch.clientX, y: touch.clientY };
            }}
            onTouchEnd={event => {
              const start = touchStart.current;
              if (!start) return;
              const touch = event.changedTouches[0];
              const dx = touch.clientX - start.x;
              const dy = touch.clientY - start.y;
              touchStart.current = null;
              if (Math.abs(dx) < 48 || Math.abs(dx) < Math.abs(dy)) return;
              setIndex(value =>
                dx < 0
                  ? (value + 1) % items.length
                  : (value - 1 + items.length) % items.length
              );
            }}
          >
            <button
              type="button"
              className="an-lightbox-close"
              onClick={close}
              aria-label={copy.close}
            >
              <X size={16} />
            </button>

            <figure className="an-lightbox-figure">
              <img src={current.src} alt={current.alt} />
              <figcaption>
                {current.meta ? <span>{current.meta}</span> : null}
                <strong>{current.caption || current.alt}</strong>
                <small>
                  {index + 1} / {items.length}
                </small>
              </figcaption>
            </figure>

            {items.length > 1 ? (
              <div className="an-lightbox-nav">
                <button
                  type="button"
                  onClick={() =>
                    setIndex(value => (value - 1 + items.length) % items.length)
                  }
                  aria-label={copy.previous}
                >
                  <ArrowLeft size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => setIndex(value => (value + 1) % items.length)}
                  aria-label={copy.next}
                >
                  <ArrowRight size={16} />
                </button>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </LightboxContext.Provider>
  );
}
