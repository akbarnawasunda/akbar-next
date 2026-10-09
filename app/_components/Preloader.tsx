export function Preloader() {
  return (
    <div
      id="akbar-preloader"
      role="status"
      aria-label="Memuat situs Akbar Nawasunda"
    >
      <div className="an-splash-inner">
        <p className="an-splash-top">
          <span className="an-splash-live">
            <i aria-hidden="true" />WIB <span id="an-splash-clock">--.--.--</span>
          </span>
          <span id="an-splash-date">Bandung Barat</span>
        </p>
        <span className="an-splash-line">
          <span className="an-splash-word">Akbar</span>
        </span>
        <span className="an-splash-line">
          <span className="an-splash-word">Nawasunda</span>
        </span>
        <span className="an-splash-aksara" aria-hidden="true" lang="su-Sund">
          ᮃᮊ᮪ᮘᮁ ᮔᮝᮞᮥᮔ᮪ᮓ
        </span>
        <div className="an-splash-steps" aria-hidden="true">
          <span />
          <span />
          <span />
          <span />
          <span />
          <span />
          <span />
          <span />
        </div>
        <div className="an-splash-rule" aria-hidden="true" />
        <div className="an-splash-meter" aria-hidden="true">
          <i id="an-splash-meter-fill" />
        </div>
        <div className="an-splash-caption">
          <span>Producer · Remixer · Bandung Barat</span>
          <span className="an-splash-elapsed">
            <span id="an-splash-elapsed">0.0</span>s
          </span>
        </div>
        <p className="an-splash-birthday" id="an-splash-birthday" hidden>
          Selamat ulang tahun, Akbar · 01 November
        </p>
      </div>
    </div>
  );
}
