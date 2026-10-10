(function () {
  var preloader = document.getElementById("akbar-preloader");
  if (!preloader) return;

  var reducedMotion = false;
  try {
    reducedMotion =
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  } catch (error) {
    reducedMotion = false;
  }

  // Full signature on first visit; repeat visits keep only the quick wordmark.
  var seen = false;
  try {
    seen = sessionStorage.getItem("an-splash-seen") === "1";
    sessionStorage.setItem("an-splash-seen", "1");
  } catch (error) {
    seen = false;
  }
  if (seen) preloader.classList.add("an-splash-quick");

  var clockEl = document.getElementById("an-splash-clock");
  var dateEl = document.getElementById("an-splash-date");
  var meterFill = document.getElementById("an-splash-meter-fill");
  var birthdayEl = document.getElementById("an-splash-birthday");
  var months = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember",
  ];

  function now() {
    return window.performance && typeof window.performance.now === "function"
      ? window.performance.now()
      : Date.now();
  }

  function pad(value) {
    return value < 10 ? "0" + value : String(value);
  }

  function getJakartaStamp(date) {
    try {
      var parts = new Intl.DateTimeFormat("en-GB", {
        timeZone: "Asia/Jakarta",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hourCycle: "h23",
        weekday: "long",
      }).formatToParts(date);
      var values = {};
      for (var i = 0; i < parts.length; i++) {
        if (parts[i].type !== "literal") values[parts[i].type] = parts[i].value;
      }
      return {
        hour: Number(values.hour) % 24,
        minute: Number(values.minute),
        second: Number(values.second),
        day: Number(values.day),
        month: Number(values.month),
        year: Number(values.year),
        weekday: values.weekday || "",
      };
    } catch (error) {
      return {
        hour: date.getHours(),
        minute: date.getMinutes(),
        second: date.getSeconds(),
        day: date.getDate(),
        month: date.getMonth() + 1,
        year: date.getFullYear(),
        weekday: "",
      };
    }
  }

  function paintTime() {
    var stamp = getJakartaStamp(new Date());
    if (clockEl) {
      clockEl.textContent =
        pad(stamp.hour) + "." + pad(stamp.minute) + "." + pad(stamp.second);
    }
    if (dateEl) {
      var weekday = stamp.weekday
        ? stamp.weekday.toUpperCase().slice(0, 3) + " · "
        : "";
      dateEl.textContent =
        weekday + stamp.day + " " + months[stamp.month - 1].toUpperCase() + " " + stamp.year;
    }
    if (stamp.month === 11 && stamp.day === 1) {
      document.documentElement.setAttribute("data-birthday", "on");
      preloader.classList.add("is-birthday");
      if (birthdayEl) birthdayEl.hidden = false;
    }
  }

  var startedAt = now();
  var minimumVisible = seen ? 240 : 530;
  // The deadline includes the exit animation; hardRemoveTimer is a final guard.
  var maximumVisible = seen ? 650 : 1300;
  var exitDuration = seen ? 150 : 220;
  var clockTimer = 0;
  var progressTimer = 0;
  var dismissTimer = 0;
  var forcedDismissTimer = 0;
  var hardRemoveTimer = 0;
  var dismissed = false;
  var removed = false;

  function clearTimers() {
    window.clearInterval(clockTimer);
    window.clearInterval(progressTimer);
    window.clearTimeout(dismissTimer);
    window.clearTimeout(forcedDismissTimer);
    window.clearTimeout(hardRemoveTimer);
  }

  function drop() {
    if (removed) return;
    removed = true;
    clearTimers();
    if (window.__dismissAkbarPreloader === requestDismiss) {
      window.__dismissAkbarPreloader = undefined;
    }
    // Hapus hanya node splash di dalam pembungkus statis. Pembungkusnya milik
    // React (Server Component) dan harus tetap di DOM — menghapus/mengganti
    // node milik React sebelum hidrasi memicu hydration mismatch (React #418)
    // yang meng-regenerasi seluruh pohon di klien.
    if (preloader.parentNode) preloader.parentNode.removeChild(preloader);
  }

  function startExit() {
    if (removed) return;
    preloader.classList.add("an-fade-out");
    // Give the browser one extra frame after the CSS transition has ended.
    dismissTimer = window.setTimeout(drop, exitDuration + 30);
  }

  function requestDismiss() {
    if (dismissed || removed) return;
    dismissed = true;
    window.clearTimeout(forcedDismissTimer);
    var elapsed = now() - startedAt;
    var remaining = Math.max(0, minimumVisible - elapsed);
    dismissTimer = window.setTimeout(startExit, remaining);
  }

  if (reducedMotion) {
    drop();
    return;
  }

  window.__dismissAkbarPreloader = requestDismiss;
  paintTime();
  clockTimer = window.setInterval(paintTime, 1000);

  function paintProgress() {
    var elapsed = now() - startedAt;
    if (meterFill) {
      var activeDuration = Math.max(1, maximumVisible - exitDuration);
      meterFill.style.transform = "scaleX(" + Math.min(1, elapsed / activeDuration) + ")";
    }
  }
  paintProgress();
  progressTimer = window.setInterval(paintProgress, 200);

  // Do not wait for React hydration: the page HTML already exists beneath the
  // splash. Dismiss after the first paint, with a short floor for the motion.
  if (window.requestAnimationFrame) {
    window.requestAnimationFrame(function () {
      window.requestAnimationFrame(requestDismiss);
    });
  } else {
    window.setTimeout(requestDismiss, 16);
  }

  // Force the exit to begin early enough that it finishes inside this deadline.
  forcedDismissTimer = window.setTimeout(
    requestDismiss,
    Math.max(0, maximumVisible - exitDuration),
  );
  // If timers or the animation are interrupted, never leave a blocking layer.
  hardRemoveTimer = window.setTimeout(drop, maximumVisible + 40);
})();
