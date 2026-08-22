import { ArrowDownToLine, ArrowUpRight, FileText, Mail, PackageOpen } from "lucide-react";
import { NightFooter, NightHeader } from "@/components/NightFrequencyChrome";
import { useSanityArtistContent } from "@/sanity/publicContent";
import "./EcosystemPages.css";
import "./VercelAssetOverrides.css";
import "./ArtistModules.css";

const mail = (address: string, subject: string) => `mailto:${address}?subject=${encodeURIComponent(subject)}`;

export default function PressKit() {
  const cms = useSanityArtistContent();
  const press = cms.data?.pressKit;
  const bookingEmail = press?.bookingEmail || "akbarnawasunda@gmail.com";
  const pressEmail = press?.pressEmail || bookingEmail;
  const packs = [
    { label: "ONE-SHEET", title: "PRESS PDF", copy: "Bio ringkas, contact, dan artist overview untuk media atau promoter.", href: press?.oneSheetUrl, request: "One-sheet EPK request" },
    { label: "VISUAL ASSETS", title: "PHOTO PACK", copy: "Foto high-resolution untuk editorial, poster, dan kebutuhan promosi.", href: press?.photoPackUrl, request: "Press photo pack request" },
    { label: "BRAND ASSETS", title: "LOGO PACK", copy: "Logo resmi dan varian asset brand untuk materi publikasi.", href: press?.logoPackUrl, request: "Logo pack request" },
    { label: "LIVE TECH", title: "TECH RIDER", copy: "Technical rider dapat diterbitkan saat format performance telah dikonfirmasi.", href: press?.technicalRiderUrl, request: "Technical rider request" },
  ];
  return <div className="nf-page"><NightHeader /><main><section className="nf-epk-hero"><p className="nf-page-eyebrow">AKBAR NAWASUNDA / PRESS & BOOKING</p><h1>THE PRESS<br/><em>SIGNAL.</em></h1><p>{press?.intro || "Materi ringkas untuk promotor, media, playlist editor, dan calon kolaborator. Akbar Nawasunda adalah produser dan remixer elektronik dari Bandung Barat, Indonesia."}</p><div className="nf-press-actions"><a className="nf-button" href={mail(pressEmail, "Press asset request")}><Mail size={16}/> REQUEST PRESS ASSETS</a><a className="nf-text-button" href={mail(bookingEmail, "Booking inquiry")}>BOOKING INQUIRY <ArrowUpRight size={15}/></a></div></section><section className="nf-section"><div className="an-press-intro"><p className="nf-page-eyebrow">PRESS MATERIALS</p><h2>READY WHEN<br/><em>THE SIGNAL IS.</em></h2><p>Download tersedia langsung saat materi resmi sudah diterbitkan melalui Studio. Sebelum itu, setiap request dikirim ke jalur resmi agar format, resolusi, dan hak penggunaan dapat disiapkan dengan benar.</p></div><div className="an-press-grid">{packs.map(pack => <article className="an-press-pack" key={pack.title}><span>{pack.label}</span><div><h3>{pack.title}</h3><p>{pack.copy}</p></div>{pack.href ? <a href={pack.href} target="_blank" rel="noreferrer"><ArrowDownToLine size={14}/> DOWNLOAD <ArrowUpRight size={13}/></a> : <a href={mail(pressEmail, pack.request)}><PackageOpen size={14}/> REQUEST PACK <ArrowUpRight size={13}/></a>}</article>)}</div></section><section className="nf-section dark-panel"><div className="an-booking-grid"><div><p className="nf-page-eyebrow">BOOKING / COLLABORATION</p><h2>BUILD THE<br/><em>NEXT ROOM.</em></h2><p>Untuk booking show, DJ set, remix, kolaborasi, lisensi, atau request press—gunakan jalur yang sesuai agar brief dapat ditangani lebih cepat.</p></div><div className="an-booking-actions"><a href={mail(bookingEmail, "Booking inquiry — Akbar Nawasunda")}>BOOK A PERFORMANCE <ArrowUpRight size={16}/></a><a href={mail(bookingEmail, "Remix / collaboration inquiry — Akbar Nawasunda")}>REMIX / COLLABORATE <ArrowUpRight size={16}/></a><a href={mail(pressEmail, "Press / media inquiry — Akbar Nawasunda")}>PRESS / MEDIA <FileText size={16}/></a></div></div></section></main><NightFooter /></div>;
}
