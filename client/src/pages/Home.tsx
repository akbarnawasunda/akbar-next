import { ArrowDownRight, ArrowUpRight, Disc3, Headphones, Mail, Play, Radio, Sparkles, Ticket, Waves } from "lucide-react";
import { FormEvent, useState } from "react";
import { toast } from "sonner";
import { currentRelease, futureModules, officialBrand, platformLinks, releases, videos } from "@/content/artistPlatform";
import { trpc } from "@/lib/trpc";
import "@/components/OfficialBrand.css";
import "./Home.css";
import "./HomeStates.css";

const heroImage = officialBrand.socialPreview;

export default function Home() {
  const [email, setEmail] = useState("");
  const contentQuery = trpc.content.list.useQuery();
  const managedContent = contentQuery.data ?? [];
  const managedHero = managedContent.find(item => item.kind === "hero");
  const managedRelease = managedContent.find(item => item.kind === "release");
  const managedVideos = managedContent.filter(item => item.kind === "video").slice(0, 3);
  const managedLive = managedContent.find(item => item.kind === "live");
  const activeRelease = managedRelease ? { ...currentRelease, title: managedRelease.title, type: managedRelease.label || currentRelease.type, href: managedRelease.href || currentRelease.href, image: managedRelease.imageUrl || currentRelease.image } : currentRelease;
  const activeVideos = managedVideos.length ? managedVideos.map(item => ({ title: item.title, label: item.label || "VISUAL", href: item.href || "https://www.youtube.com/@akbarnawasunda", image: item.imageUrl || officialBrand.socialPreview })) : videos;
  const contentState = contentQuery.isLoading ? "SYNCING CONTENT" : contentQuery.isError ? "ARCHIVE VIEW" : managedContent.length ? "LIVE CONTENT" : "ARCHIVE VIEW";
  const subscribe = trpc.fanSignal.subscribe.useMutation({
    onSuccess: () => {
      setEmail("");
      toast.success("Sinyal diterima. Kamu masuk jalur update Akbar Nawasunda.");
    },
    onError: () => toast.error("Sinyal belum terkirim. Coba lagi dalam beberapa saat."),
  });

  const submitSignal = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!email.trim()) return;
    subscribe.mutate({ email, source: "home" });
  };

  return (
    <div className="an-site">
      <header className="an-nav">
        <a className="an-wordmark" href="#top" aria-label="Akbar Nawasunda home">
          <img className="an-brand-logo" src={officialBrand.logo} alt="" /><span>AKBAR NAWASUNDA</span>
        </a>
        <nav aria-label="Navigasi utama">
          <a href="/music">MUSIC</a>
          <a href="/visuals">VISUALS</a>
          <a href="/live">LIVE</a>
          <a href="/universe">UNIVERSE</a>
          <a href="/lab">LAB</a>
        </nav>
        <a className="nav-signal" href="#signal"><Radio size={14} /> FAN SIGNAL</a>
      </header>

      <main id="top">
        <section className="an-hero" style={{ "--hero-image": `url(${heroImage})` } as React.CSSProperties}>
          <div className="hero-grain" aria-hidden="true" />
          <div className="hero-copy">
            <p className="eyebrow"><span /> {managedHero?.label || "INDONESIA · ELECTRONIC / BASS"}</p>
            <h1>{managedHero ? managedHero.title : <>MAKE<br /><em>THE NIGHT</em><br />MOVE.</>}</h1>
            <p className="hero-description">{managedHero?.subtitle || "Produser, remixer, dan arsitek energi malam. Suara baru dari Bandung Barat untuk speaker, layar, dan lantai dansa."}</p>
            <div className="hero-actions">
              <a className="button-primary" href={managedHero?.href || activeRelease.href} target="_blank" rel="noreferrer"><Play size={15} fill="currentColor" /> DENGAR SEKARANG</a>
              <a className="button-quiet" href="#signal">MASUK FAN SIGNAL <ArrowDownRight size={16} /></a>
            </div>
          </div>
          <aside className="hero-status" aria-label="Status artis">
            <div><span>NOW PLAYING</span><strong>{activeRelease.title}</strong><small>{activeRelease.type}</small></div>
            <div className="status-row"><span>{contentState}</span><b>ONLINE</b><i /></div>
          </aside>
          <div className="hero-footer"><span>SCROLL TO EXPLORE</span><span className="scroll-line" /><span>01 / 06</span></div>
        </section>

        <section className="section section-current" id="music">
          <div className="section-heading"><p className="eyebrow">01 · CURRENT FREQUENCY</p><h2>THE RELEASE<br /><em>IN FOCUS.</em></h2></div>
          {contentQuery.isLoading ? <p className="content-state">SYNCING MANAGED CONTENT…</p> : contentQuery.isError ? <p className="content-state content-state-warn">LIVE CONTENT IS UNAVAILABLE — SHOWING VERIFIED ARCHIVE CONTENT.</p> : !managedContent.length ? <p className="content-state">ARCHIVE VIEW — OWNER-PUBLISHED CONTENT WILL APPEAR HERE WHEN AVAILABLE.</p> : <p className="content-state content-state-live">LIVE CONTENT — THIS MODULE IS MANAGED FROM AN // STUDIO.</p>}
          <div className="feature-release">
            <div className="release-cover"><img src={activeRelease.image} alt="Abstract visual for current release" /><span className="cover-orbit" /></div>
            <div className="release-detail">
              <p className="mono-label">{managedRelease?.label ? `MANAGED RELEASE · ${managedRelease.label}` : currentRelease.eyebrow}</p>
              <h3>{activeRelease.title}</h3>
              <p>{managedRelease?.subtitle || "Energi breakbeat, hook yang familiar, dan detail produksi yang dirancang untuk momentum tinggi."}</p>
              <div className="release-detail-actions"><a className="text-link" href={activeRelease.href} target="_blank" rel="noreferrer">OPEN RELEASE <ArrowUpRight size={16} /></a><span>{activeRelease.type}</span></div>
            </div>
          </div>
        </section>

        <section className="section release-section">
          <div className="section-inline"><div><p className="eyebrow">RELEASE VAULT</p><h2>EVERY DROP<br /><em>HAS A SIGNAL.</em></h2></div><a className="text-link" href="https://open.spotify.com/artist/5teZ2VRr7VBSDqZ0ueP3hd" target="_blank" rel="noreferrer">OPEN SPOTIFY <ArrowUpRight size={16} /></a></div>
          <div className="release-grid">
            {releases.map((release, index) => <a className="release-card" key={release.title} href={release.href} target="_blank" rel="noreferrer"><span className="release-number">0{index + 1}</span><Disc3 size={23} /><p>{release.format} · {release.year}</p><h3>{release.title}</h3><span>{release.platform} <ArrowUpRight size={14} /></span></a>)}
          </div>
        </section>

        <section className="section visual-section" id="visuals">
          <div className="section-heading"><p className="eyebrow">02 · MOTION / VISUAL</p><h2>TURN THE<br /><em>VOLUME INTO LIGHT.</em></h2></div>
          <div className="video-grid">
            {activeVideos.map((video, index) => <a key={video.title} className={`video-card video-${index + 1}`} href={video.href} target="_blank" rel="noreferrer"><img src={video.image} alt="" /><div className="video-overlay" /><div className="video-content"><span>{video.label}</span><h3>{video.title}</h3><div className="round-play"><Play size={17} fill="currentColor" /></div></div></a>)}
          </div>
        </section>

        <section className="section live-section" id="live">
          <div className="live-backdrop" style={{ backgroundImage: `url(/manus-storage/an-night-frequency-stage_113bf174.jpg)` }} />
          <div className="live-copy"><p className="eyebrow">03 · LIVE SIGNAL</p><h2>WHEN THE<br /><em>ROOM IS READY.</em></h2><p>{managedLive?.subtitle || "Jadwal pertunjukan akan tampil di sini ketika tanggal diumumkan. Masuk ke Fan Signal untuk mendengar kabar lebih dulu."}</p><a className="button-primary" href={managedLive?.href || "#signal"} target={managedLive?.href ? "_blank" : undefined} rel={managedLive?.href ? "noreferrer" : undefined}><Ticket size={16} /> GET FIRST NOTICE</a></div>
          <div className="live-status"><span>{managedLive?.label || "NEXT LIVE"}</span><strong>{managedLive?.title || <>NO DATE<br />ANNOUNCED</>}</strong><small>{managedLive ? "LIVE UPDATE" : "WATCH THIS SPACE"}</small></div>
        </section>

        <section className="section lab-section">
          <div className="lab-heading"><div><p className="eyebrow">04 · THE INTERACTIVE LAB</p><h2>DON&apos;T JUST<br /><em>LISTEN.</em></h2></div><p>Masuk ke ruang eksperimen: Jedag Pad, sequencer, dan mini game yang dibangun langsung dari dunia suara Akbar Nawasunda.</p></div>
          <a className="lab-launch" href="/lab"><div><Waves size={36} /><span>AN / LAB</span></div><h3>OPEN THE<br />INSTRUMENT</h3><ArrowUpRight size={32} /></a>
        </section>

        <section className="section future-section">
          <p className="eyebrow">05 · BUILT FOR WHAT&apos;S NEXT</p><div className="future-head"><h2>AN ARTIST WORLD,<br /><em>NOT A SINGLE PAGE.</em></h2><p>Platform ini disusun untuk tumbuh bersama rilisan, pertunjukan, dan komunitas—tanpa kehilangan fokus pada musik.</p></div>
          <div className="future-grid">{futureModules.map(module => <article key={module.number}><span>{module.number}</span><h3>{module.title}</h3><p>{module.copy}</p></article>)}</div>
        </section>

        <section className="signal-section" id="signal">
          <div><p className="eyebrow"><Sparkles size={14} /> FAN SIGNAL</p><h2>THE NEXT DROP<br />STARTS <em>HERE.</em></h2><p>Terima kabar tentang rilisan, visual, dan momen berikutnya langsung dari sumbernya.</p></div>
          <form onSubmit={submitSignal}>
            <label htmlFor="fan-email">EMAIL ADDRESS</label>
            <div className="signal-input"><Mail size={18} /><input id="fan-email" type="email" value={email} onChange={event => setEmail(event.target.value)} placeholder="nama@kamu.com" autoComplete="email" required /><button type="submit" disabled={subscribe.isPending}>{subscribe.isPending ? "SENDING" : "JOIN"}<ArrowUpRight size={17} /></button></div>
            <small>Dengan mendaftar, kamu setuju menerima update dari Akbar Nawasunda. Berhenti kapan saja.</small>
          </form>
        </section>
      </main>

      <footer className="an-footer"><div className="footer-brand"><span className="an-mark">AN</span><strong>AKBAR NAWASUNDA</strong><p>PRODUCER / REMIXER / INDONESIA</p></div><div className="footer-links"><span>CONNECT</span>{platformLinks.map(link => <a key={link.label} href={link.href} target="_blank" rel="noreferrer">{link.label} <ArrowUpRight size={13} /></a>)}</div><div className="footer-links"><span>ACCESS</span><a href="/epk">Electronic Press Kit <ArrowUpRight size={13} /></a><a href="mailto:akbarnawasunda@gmail.com">Book / Collaborate <ArrowUpRight size={13} /></a><a href="/privacy">Privacy <ArrowUpRight size={13} /></a></div><p className="footer-bottom">© {new Date().getFullYear()} AKBAR NAWASUNDA · ALL SIGNALS RESERVED</p></footer>
    </div>
  );
}
