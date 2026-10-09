(function () {
        var preloader = document.getElementById("akbar-preloader");
        if (!preloader) return;

        var reduced = false;
        try {
          reduced =
            window.matchMedia &&
            window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        } catch (error) {
          reduced = false;
        }

        // Splash hanya untuk kunjungan pertama dalam satu sesi. Kunjungan
        // berikutnya (dan navigasi antar-rute) langsung melihat konten.
        var seen = false;
        try {
          seen = sessionStorage.getItem("an-splash-seen") === "1";
          sessionStorage.setItem("an-splash-seen", "1");
        } catch (error) {
          seen = false;
        }

        // --- Jam studio: selalu waktu Jakarta (WIB), apa pun zona perangkat. ---
        var jakartaFormat = null;
        try {
          jakartaFormat = new Intl.DateTimeFormat("en-GB", {
            timeZone: "Asia/Jakarta",
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hourCycle: "h23",
            weekday: "long",
          });
        } catch (error) {
          jakartaFormat = null;
        }

        var MONTHS = [
          "Januari",
          "Februari",
          "Maret",
          "April",
          "Mei",
          "Juni",
          "Juli",
          "Agustus",
          "September",
          "Oktober",
          "November",
          "Desember",
        ];

        function jakartaStamp(date) {
          if (jakartaFormat) {
            try {
              var out = {};
              var parts = jakartaFormat.formatToParts(date);
              for (var i = 0; i < parts.length; i++) {
                if (parts[i].type !== "literal")
                  out[parts[i].type] = parts[i].value;
              }
              return {
                h: Number(out.hour) % 24,
                m: Number(out.minute),
                s: Number(out.second),
                day: Number(out.day),
                month: Number(out.month),
                year: Number(out.year),
                weekday: out.weekday || "",
              };
            } catch (error) {
              /* jatuh ke waktu perangkat di bawah */
            }
          }
          return {
            h: date.getHours(),
            m: date.getMinutes(),
            s: date.getSeconds(),
            day: date.getDate(),
            month: date.getMonth() + 1,
            year: date.getFullYear(),
            weekday: "",
          };
        }

        var clockEl = document.getElementById("an-splash-clock");
        var dateEl = document.getElementById("an-splash-date");
        var elapsedEl = document.getElementById("an-splash-elapsed");
        var meterFill = document.getElementById("an-splash-meter-fill");
        var birthdayEl = document.getElementById("an-splash-birthday");

        function pad(value) {
          return value < 10 ? "0" + value : String(value);
        }

        function paintTime() {
          var stamp = jakartaStamp(new Date());
          if (clockEl) {
            clockEl.textContent =
              pad(stamp.h) + "." + pad(stamp.m) + "." + pad(stamp.s);
          }
          if (dateEl) {
            var day = stamp.weekday
              ? stamp.weekday.toUpperCase().slice(0, 3) + " · "
              : "";
            dateEl.textContent =
              day +
              stamp.day +
              " " +
              MONTHS[stamp.month - 1].toUpperCase() +
              " " +
              stamp.year;
          }
          // 1 November waktu Jakarta: situs merayakan sendiri, tiap tahun.
          if (stamp.month === 11 && stamp.day === 1) {
            document.documentElement.setAttribute("data-birthday", "on");
            preloader.classList.add("is-birthday");
            if (birthdayEl) birthdayEl.hidden = false;
          }
        }

        paintTime();
        var clockTimer = setInterval(paintTime, 1000);

        function drop() {
          clearInterval(clockTimer);
          clearInterval(progressTimer);
          if (preloader && preloader.parentNode) {
            preloader.parentNode.removeChild(preloader);
          }
        }

        if (reduced) {
          window.__dismissAkbarPreloader = drop;
          drop();
          return;
        }

        // Kunjungan kedua dalam satu sesi TIDAK lagi melewatkan splash diam-
        // diam — dulu inilah sebabnya layar pembuka terasa "tidak ada" di
        // desktop (sekali reload, hilang selamanya sampai tab ditutup).
        // Sekarang ia tampil ringkas: hanya aksara + nama, ±0,46 dtk.
        if (seen) preloader.classList.add("an-splash-quick");

        var dismissed = false;
        var shownAt = Date.now();
        // Durasi splash: minimal 1.4 detik supaya seluruh sekuens terbaca,
        // dan tidak pernah lebih dari 2.2 detik.
        // Sekuens penuh selesai di ±1,25 dtk (aksara 0-0,62; nama 0,3-1,12;
        // garis 0,62-1,40). MIN_VISIBLE tidak boleh lebih pendek dari itu,
        // kalau tidak animasinya terpotong di tengah pada koneksi cepat.
        var MIN_VISIBLE = seen ? 460 : 1450;
        var MAX_VISIBLE = seen ? 900 : 2200;

        // Angka durasi = waktu yang benar-benar berjalan sejak splash tampil.
        function paintProgress() {
          var elapsed = Date.now() - shownAt;
          if (elapsedEl) elapsedEl.textContent = (elapsed / 1000).toFixed(1);
          if (meterFill) {
            meterFill.style.transform =
              "scaleX(" + Math.min(1, elapsed / MAX_VISIBLE) + ")";
          }
        }
        paintProgress();
        var progressTimer = setInterval(paintProgress, 100);

        function remove() {
          if (!preloader) return;
          preloader.classList.add("an-fade-out");
          setTimeout(drop, 560);
        }

        window.__dismissAkbarPreloader = function () {
          if (dismissed) return;
          dismissed = true;
          var wait = Math.max(0, MIN_VISIBLE - (Date.now() - shownAt));
          setTimeout(remove, wait);
        };

        // Jaring pengaman: splash tidak pernah menahan konten lebih lama dari ini.
        setTimeout(function () {
          if (typeof window.__dismissAkbarPreloader === "function") {
            window.__dismissAkbarPreloader();
          }
        }, MAX_VISIBLE);
      })();
