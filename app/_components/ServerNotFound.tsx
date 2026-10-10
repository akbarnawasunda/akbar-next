import Link from "next/link";

export default function ServerNotFound({
  locale,
}: {
  locale: "id" | "en";
}) {
  const english = locale === "en";
  return (
    <main id="main-content" className="an-notfound-page">
      <section className="an-page-hero">
        <div className="an-page-hero-copy">
          <p className="an-kicker">{english ? "ERROR 404 · SIGNAL LOST" : "ERROR 404 · SINYAL HILANG"}</p>
          <h1>{english ? "This page is not on the frequency." : "Halaman ini tidak ada di frekuensi."}</h1>
          <p className="an-lede">
            {english
              ? "The address you requested is not part of this site. It may be mistyped, or the page has moved."
              : "Alamat yang diminta bukan bagian dari situs ini. Mungkin salah ketik, atau halaman sudah dipindahkan."}
          </p>
          <div className="an-actions">
            <Link className="an-btn an-btn--solid" href={english ? "/en" : "/"}>
              {english ? "Back to home" : "Kembali ke beranda"}
            </Link>
            <Link className="an-btn an-btn--quiet" href={english ? "/en/music" : "/music"}>
              {english ? "Listen to music" : "Lihat musik"}
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
