// Password lock. If SITE_CONFIG.passwordHash is set, the site stays hidden until the password is entered
// (remembered on this device). Set or change it from the Connect GitHub dialog.
(function () {
  var KEY = "golf-unlock";
  var cfg = (typeof SITE_CONFIG !== "undefined" && SITE_CONFIG) || {};
  function hex(buf) { return Array.prototype.map.call(new Uint8Array(buf), function (b) { return b.toString(16).padStart(2, "0"); }).join(""); }
  function hash(pw, salt) {
    var enc = new TextEncoder();
    return crypto.subtle.importKey("raw", enc.encode(pw), "PBKDF2", false, ["deriveBits"]).then(function (k) {
      return crypto.subtle.deriveBits({ name: "PBKDF2", salt: enc.encode(salt), iterations: 200000, hash: "SHA-256" }, k, 256);
    }).then(hex);
  }
  function unlocked() { try { return !cfg.passwordHash || localStorage.getItem(KEY) === cfg.passwordHash; } catch (e) { return false; } }
  window.SiteGate = {
    hash: hash,
    newSalt: function () { var a = new Uint8Array(16); crypto.getRandomValues(a); return hex(a.buffer); },
    remember: function (h) { try { if (h) localStorage.setItem(KEY, h); else localStorage.removeItem(KEY); } catch (e) {} },
    lock: function () { try { localStorage.removeItem(KEY); } catch (e) {} location.reload(); },
    enabled: function () { return !!cfg.passwordHash; }
  };
  if (unlocked()) return;
  var st = document.createElement("style");
  st.id = "gate-style";
  st.textContent = "html.locked body>*:not(#gate){display:none!important}" +
    "#gate{position:fixed;inset:0;display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,#0B5B3C,#062e1f);font-family:Inter,system-ui,sans-serif;padding:20px;z-index:9999}" +
    "#gate form{background:#fff;border-radius:16px;padding:28px 26px;width:100%;max-width:340px;box-shadow:0 20px 60px rgba(0,0,0,.35);text-align:center}" +
    "#gate .m{width:46px;height:46px;border-radius:12px;background:#0B5B3C;color:#fff;display:inline-flex;align-items:center;justify-content:center;font-size:22px;margin-bottom:10px}" +
    "#gate h1{margin:0 0 4px;font-size:20px;font-weight:800;letter-spacing:-.02em;color:#121814}#gate p{margin:0 0 16px;color:#5C665F;font-size:13.5px}" +
    "#gate input{width:100%;box-sizing:border-box;font:inherit;font-size:15px;border:1px solid #E4E8E2;border-radius:10px;padding:11px 12px;margin-bottom:10px;text-align:center}" +
    "#gate button{width:100%;font:inherit;font-weight:700;font-size:14px;border:0;border-radius:10px;padding:11px;background:#0B5B3C;color:#fff;cursor:pointer}" +
    "#gate .e{color:#B3392A;font-size:13px;min-height:18px;margin-top:8px}";
  document.head.appendChild(st);
  document.documentElement.classList.add("locked");
  function mount() {
    var g = document.createElement("div"); g.id = "gate";
    g.innerHTML = '<form><div class="m">&#9971;</div><h1>Nick\'s Golf</h1><p>This site is private.</p><input type="password" id="gate-pw" placeholder="Password" autocomplete="current-password" autofocus><button type="submit">Unlock</button><div class="e" id="gate-e"></div></form>';
    document.body.appendChild(g);
    g.querySelector("form").addEventListener("submit", function (e) {
      e.preventDefault();
      var pw = g.querySelector("#gate-pw").value; if (!pw) return;
      g.querySelector("#gate-e").textContent = "Checking…";
      hash(pw, cfg.salt || "").then(function (h) {
        if (h === cfg.passwordHash) { SiteGate.remember(h); document.documentElement.classList.remove("locked"); g.remove(); }
        else { g.querySelector("#gate-e").textContent = "That's not it."; g.querySelector("#gate-pw").select(); }
      });
    });
    setTimeout(function () { var i = g.querySelector("#gate-pw"); if (i) i.focus(); }, 50);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", mount); else mount();
})();
