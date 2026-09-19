import { ArrowUpRight } from "lucide-react";
import { Link } from "wouter";

export default function NotFound() {
  return (
    <main
      style={{
        minHeight: "100dvh",
        display: "grid",
        placeItems: "center",
        background: "var(--ink)",
        color: "var(--paper)",
        padding: "clamp(24px, 6vw, 80px)",
        fontFamily: "var(--font-body)",
      }}
    >
      <div style={{ maxWidth: "560px", width: "100%" }}>
        <p
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.62rem",
            fontWeight: 600,
            letterSpacing: "0.24em",
            color: "var(--acid)",
            textTransform: "uppercase",
            margin: 0,
          }}
        >
          ERROR 404 · SIGNAL LOST
        </p>
        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 400,
            fontSize: "clamp(3rem, 12vw, 8rem)",
            lineHeight: 0.86,
            letterSpacing: "-0.05em",
            margin: "20px 0 24px",
            color: "var(--paper)",
          }}
        >
          Halaman
          <br />
          tidak
          <br />
          ditemukan.
        </h1>
        <p
          style={{
            color: "var(--mute)",
            fontSize: "1rem",
            lineHeight: 1.7,
            margin: "0 0 40px",
            maxWidth: "42ch",
          }}
        >
          Frekuensi ini tidak aktif. Mungkin URL salah ketik, atau
          halaman sudah dipindahkan.
        </p>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "16px 28px",
            borderTop: "1px solid var(--paper)",
            paddingTop: "28px",
          }}
        >
          <Link
            href="/"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "10px",
              padding: "16px 22px",
              background: "var(--acid)",
              color: "var(--ink)",
              fontFamily: "var(--font-mono)",
              fontSize: "0.66rem",
              fontWeight: 700,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
            }}
          >
            KEMBALI KE HOME
          </Link>
          <Link
            href="/music"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "10px",
              paddingBottom: "8px",
              borderBottom: "1px solid var(--paper)",
              color: "var(--paper)",
              fontFamily: "var(--font-mono)",
              fontSize: "0.66rem",
              fontWeight: 600,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
            }}
          >
            LIHAT MUSIK <ArrowUpRight size={14} />
          </Link>
        </div>
      </div>
    </main>
  );
}
