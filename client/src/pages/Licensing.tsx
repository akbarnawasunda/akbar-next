import { NightFooter, NightHeader } from "@/components/NightFrequencyChrome";
import { ScrambleText } from "@/components/ScrambleText";
import { verifiedArtistProfile } from "@/content/artistPlatform";
import "./Inquiry.css";

const routes = [
  ["CONTENT & SOCIAL", "Gunakan jalur licensing bila karya akan dipakai di konten publik, kanal brand, atau distribusi dengan tujuan tertentu."],
  ["EVENT & PERFORMANCE", "Ajukan kebutuhan penggunaan rekaman, custom arrangement, atau format performance melalui inquiry agar konteks acaranya dapat ditinjau."],
  ["COMMERCIAL & BRAND", "Untuk penggunaan komersial, kampanye, atau sinkronisasi, jelaskan platform, wilayah, durasi, dan bentuk pemakaian yang direncanakan."],
];

export default function Licensing() {
  return <div className="nf-page an-licensing-page"><NightHeader /><main><section className="an-inquiry-hero"><p className="nf-page-eyebrow">LICENSING / USAGE</p><ScrambleText as="h1" interactive duration={2400} text={"USE THE\nSOUND RIGHT."} /><p>{verifiedArtistProfile.licensing}</p><div className="an-inquiry-signal"><span>OFFICIAL ROUTE</span><strong>REQUEST FIRST</strong></div></section><section className="an-license-grid">{routes.map(([title, copy], index) => <article key={title}><span>0{index + 1}</span><h2>{title}</h2><p>{copy}</p></article>)}</section><section className="an-license-terms"><div><p className="nf-page-eyebrow">BEFORE YOU SEND</p><ScrambleText as="h2" interactive duration={2400} text={"CONTEXT MAKES\nTHE SIGNAL CLEAR."} /><p>Hak, persetujuan, biaya, eksklusivitas, dan deliverable selalu dibicarakan berdasarkan kebutuhan proyek. Halaman ini adalah jalur awal inquiry, bukan penawaran harga atau pemberian izin otomatis.</p></div><a className="an-inquiry-submit" href="/inquire?type=licensing&source=licensing">REQUEST LICENSING</a></section></main><NightFooter /></div>;
}
