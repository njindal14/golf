// GitHub sync for the golf site.
// Once a device is connected (Sync button -> paste a fine-grained token that can write to this repo),
// every edit is committed straight to GitHub, and every page load pulls the latest data from GitHub.
// Without a token the site still works read-only from the published files (edits stay in that browser).
(function () {
  var TOKEN_KEY = "golf-gh-token", REPO_KEY = "golf-gh-repo", BRANCH = "main";
  function defaultRepo() {
    var h = location.hostname, p = location.pathname.split("/").filter(Boolean);
    if (/\.github\.io$/.test(h)) return h.split(".")[0] + "/" + (p[0] || h);
    return "njindal14/golf";
  }
  function get(k) { try { return localStorage.getItem(k) || ""; } catch (e) { return ""; } }
  function set(k, v) { try { if (v) localStorage.setItem(k, v); else localStorage.removeItem(k); } catch (e) {} }

  var shas = {}, timers = {}, chain = Promise.resolve(), pending = 0, lastError = "", listeners = [];
  function token() { return get(TOKEN_KEY); }
  function repo() { return get(REPO_KEY) || defaultRepo(); }
  function connected() { return !!token(); }
  function emit() { listeners.forEach(function (f) { try { f(); } catch (e) {} }); paint(); }

  function api(path, opts) {
    opts = opts || {};
    var headers = { "Accept": "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28" };
    if (token()) headers.Authorization = "Bearer " + token();
    if (opts.body) headers["Content-Type"] = "application/json";
    return fetch("https://api.github.com/repos/" + repo() + "/" + path, { method: opts.method || "GET", headers: headers, body: opts.body ? JSON.stringify(opts.body) : undefined, cache: "no-store" })
      .then(function (r) {
        if (r.status === 404 && opts.allow404) return null;
        if (!r.ok) return r.text().then(function (t) { var e = new Error(r.status + " " + (t || r.statusText).slice(0, 200)); e.status = r.status; throw e; });
        return r.status === 204 ? {} : r.json();
      });
  }
  function enc(path) { return path.split("/").map(encodeURIComponent).join("/"); }
  function b64utf8(text) { var bytes = new TextEncoder().encode(text), s = ""; for (var i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000)); return btoa(s); }
  function utf8b64(b64) { var bin = atob(b64.replace(/\n/g, "")), bytes = new Uint8Array(bin.length); for (var i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i); return new TextDecoder().decode(bytes); }

  // Read a text file from the repo (fresh, not the Pages cache). Resolves null if not connected or missing.
  function read(path) {
    if (!connected()) return Promise.resolve(null);
    return api("contents/" + enc(path) + "?ref=" + BRANCH, { allow404: true }).then(function (j) {
      if (!j) return null; shas[path] = j.sha; return utf8b64(j.content || "");
    }).catch(function (e) { lastError = e.message; emit(); return null; });
  }
  function shaOf(path) {
    return api("contents/" + enc(path) + "?ref=" + BRANCH, { allow404: true }).then(function (j) { shas[path] = j ? j.sha : undefined; return shas[path]; });
  }
  // All writes go through one queue so commits never race each other.
  function enqueue(fn) {
    pending++; emit();
    var p = chain.then(fn);
    chain = p.catch(function () {});
    return p.then(function (v) { pending--; lastError = ""; emit(); return v; }, function (e) { pending--; lastError = e.message; emit(); throw e; });
  }
  function putB64(path, b64, message) {
    function attempt(retry) {
      var body = { message: message, content: b64, branch: BRANCH };
      var go = function (sha) { if (sha) body.sha = sha; return api("contents/" + enc(path), { method: "PUT", body: body }); };
      var p = (path in shas) ? go(shas[path]) : shaOf(path).then(go);
      return p.then(function (j) { shas[path] = j.content && j.content.sha; return j; }, function (e) {
        if (retry && (e.status === 409 || e.status === 422)) { delete shas[path]; return attempt(false); }
        throw e;
      });
    }
    return attempt(true);
  }
  function write(path, text, message) { return enqueue(function () { return putB64(path, b64utf8(text), message || "Update " + path + " from the site"); }); }
  function writeBinary(path, b64, message) { return enqueue(function () { return putB64(path, b64, message || "Add " + path); }); }
  function remove(path, message) {
    return enqueue(function () {
      return shaOf(path).then(function (sha) {
        if (!sha) return {};
        return api("contents/" + enc(path), { method: "DELETE", body: { message: message || "Remove " + path, sha: sha, branch: BRANCH } }).then(function (j) { delete shas[path]; return j; });
      });
    });
  }
  // Debounced save: textFn is called when the timer fires so it always sends the latest state.
  function queue(path, textFn, message, onDone) {
    if (!connected()) return false;
    clearTimeout(timers[path]);
    pending++; emit();
    timers[path] = setTimeout(function () {
      pending--;
      write(path, textFn(), message).then(function () { if (onDone) onDone(true); }, function () { if (onDone) onDone(false); });
    }, 1200);
    return true;
  }
  // Run a data file (e.g. "const LEDGER_DATA = [...]") and return the named value.
  function evalData(text, name) { try { return new Function(text + "\n;return typeof " + name + " !== 'undefined' ? " + name + " : undefined;")(); } catch (e) { return undefined; } }

  // ---------- Sync button + settings ----------
  var CSS = ".sync-pill{display:inline-flex;align-items:center;gap:6px;margin-right:6px}" +
    ".sync-dot{width:8px;height:8px;border-radius:50%;background:var(--faint)}.sync-dot.ok{background:#2f7a45}.sync-dot.busy{background:var(--amber)}.sync-dot.err{background:#B3392A}" +
    ".sy-scrim{position:fixed;inset:0;background:rgba(18,24,20,.45);display:flex;align-items:flex-start;justify-content:center;padding:40px 14px;overflow:auto;z-index:80}" +
    ".sy-modal{background:var(--surface);border-radius:14px;max-width:540px;width:100%;padding:20px;box-shadow:0 20px 50px rgba(0,0,0,.2);display:grid;gap:12px;font-size:14px}" +
    ".sy-modal h3{margin:0;font-size:20px;font-weight:800}.sy-modal ol{margin:0;padding-left:20px;display:grid;gap:4px;color:var(--muted)}" +
    ".sy-modal label{display:grid;gap:4px;font-size:12px;color:var(--muted);font-weight:600}" +
    ".sy-modal input{font:inherit;font-size:14px;border:1px solid var(--line);border-radius:8px;padding:8px 10px}" +
    ".sy-msg{font-size:13px}.sy-msg.err{color:#B3392A}.sy-msg.ok{color:#2f7a45}";
  var st = document.createElement("style"); st.textContent = CSS; document.head.appendChild(st);
  var btn = null;
  function paint() {
    if (!btn) return;
    var cls = !connected() ? "" : lastError ? "err" : pending ? "busy" : "ok";
    var label = !connected() ? "Connect GitHub" : lastError ? "Save failed — retry" : pending ? "Saving…" : "Saved to GitHub";
    btn.innerHTML = '<span class="sync-dot ' + cls + '"></span>' + label;
    btn.title = lastError ? lastError : connected() ? "Edits commit to github.com/" + repo() : "Connect this device so edits save to GitHub";
  }
  function settings() {
    var s = document.createElement("div"); s.className = "sy-scrim";
    var tokenUrl = "https://github.com/settings/personal-access-tokens/new?name=" + encodeURIComponent("golf site (" + (navigator.platform || "device") + ")") +
      "&description=" + encodeURIComponent("Lets the golf site save edits to " + repo()) + "&target_name=" + encodeURIComponent(repo().split("/")[0]) + "&expires_in=366&contents=write";
    s.innerHTML = '<div class="sy-modal"><h3>Save edits to GitHub</h3>' +
      (connected() ? '<p class="sy-msg ok">This device is connected — edits commit to <b>' + repo() + "</b>.</p>" : "<p>Connect this device once and every edit you make here is committed to the repo automatically — no copying files.</p>") +
      '<ol><li><a href="' + tokenUrl + '" target="_blank" rel="noopener">Create a fine-grained token</a> (opens GitHub).</li><li>Repository access → <b>Only select repositories</b> → <b>' + repo().split("/")[1] + "</b>.</li><li>Permissions → Repository → <b>Contents: Read and write</b> (may be pre-set).</li><li>Generate, copy it, paste below. It's stored only in this browser.</li></ol>" +
      '<label>Token' + (connected() ? " (leave blank to keep the current one)" : "") + '<input id="sy-token" type="password" autocomplete="off" placeholder="github_pat_…" value=""></label>' +
      '<label>Repository<input id="sy-repo" value="' + repo() + '"></label>' +
      '<div class="sy-msg" id="sy-msg"></div>' +
      (connected() && window.SiteGate ? '<hr style="border:0;border-top:1px solid var(--line);margin:4px 0"><h3 style="font-size:16px">Site password</h3>' +
        '<p class="sy-msg" style="color:var(--muted)">' + (SiteGate.enabled() ? "The site is locked with a password. Each device asks for it once." : "Lock the site so only people with the password can open it.") + " It hides the site, but GitHub repos on free plans are public, so the raw files can still be read on github.com.</p>" +
        '<label>New password<input id="sy-pw1" type="password" autocomplete="new-password"></label><label>Confirm<input id="sy-pw2" type="password" autocomplete="new-password"></label>' +
        '<div style="display:flex;gap:8px;justify-content:flex-end">' + (SiteGate.enabled() ? '<button class="btn btn-ghost btn-sm" id="sy-pwoff">Remove password</button>' : "") + '<button class="btn btn-primary btn-sm" id="sy-pwset">' + (SiteGate.enabled() ? "Change password" : "Set password") + "</button></div>" +
        '<div class="sy-msg" id="sy-pwmsg"></div>' : "") +
      '<div style="display:flex;gap:8px;justify-content:space-between;flex-wrap:wrap"><div>' + (connected() ? '<button class="btn btn-danger btn-sm" id="sy-off">Disconnect this device</button>' : "") + '</div>' +
      '<div style="display:flex;gap:8px"><button class="btn btn-ghost btn-sm" id="sy-close">Close</button><button class="btn btn-primary btn-sm" id="sy-save">' + (connected() ? "Update" : "Connect") + "</button></div></div></div>";
    document.body.appendChild(s);
    function close() { s.remove(); }
    s.addEventListener("mousedown", function (e) { if (e.target === s) close(); });
    s.querySelector("#sy-close").onclick = close;
    function writeConfig(cfg, okText) {
      var m = s.querySelector("#sy-pwmsg"); m.className = "sy-msg"; m.textContent = "Saving…";
      write("site-config.js", "// Site settings — written by the site's \"Connect GitHub\" dialog. Don't edit by hand.\nconst SITE_CONFIG = " + JSON.stringify(cfg) + ";\n", "Site: update password").then(function () {
        SiteGate.remember(cfg.passwordHash); m.className = "sy-msg ok"; m.textContent = okText;
      }, function (e) { m.className = "sy-msg err"; m.textContent = "Couldn't save: " + e.message; });
    }
    var pwset = s.querySelector("#sy-pwset");
    if (pwset) pwset.onclick = function () {
      var a = s.querySelector("#sy-pw1").value, b = s.querySelector("#sy-pw2").value, m = s.querySelector("#sy-pwmsg");
      if (a.length < 6) { m.className = "sy-msg err"; m.textContent = "Use at least 6 characters."; return; }
      if (a !== b) { m.className = "sy-msg err"; m.textContent = "Those don't match."; return; }
      var salt = SiteGate.newSalt();
      SiteGate.hash(a, salt).then(function (h) { writeConfig({ passwordHash: h, salt: salt }, "Password set. The public site locks in about a minute; this device stays unlocked."); });
    };
    var pwoff = s.querySelector("#sy-pwoff");
    if (pwoff) pwoff.onclick = function () { writeConfig({ passwordHash: "", salt: "" }, "Password removed — the site will be open in about a minute."); };
    var off = s.querySelector("#sy-off"); if (off) off.onclick = function () { set(TOKEN_KEY, ""); shas = {}; lastError = ""; emit(); close(); };
    s.querySelector("#sy-save").onclick = function () {
      var t = s.querySelector("#sy-token").value.trim(), r = s.querySelector("#sy-repo").value.trim(), msg = s.querySelector("#sy-msg");
      var oldT = get(TOKEN_KEY), oldR = get(REPO_KEY);
      if (r) set(REPO_KEY, r === defaultRepo() ? "" : r);
      if (t) set(TOKEN_KEY, t);
      if (!token()) { msg.className = "sy-msg err"; msg.textContent = "Paste a token first."; return; }
      msg.className = "sy-msg"; msg.textContent = "Checking…";
      fetch("https://api.github.com/repos/" + repo(), { headers: { Authorization: "Bearer " + token(), Accept: "application/vnd.github+json" } })
        .then(function (res) { return res.ok ? res.json() : Promise.reject(new Error(res.status === 401 ? "GitHub didn't accept that token." : res.status === 404 ? "Can't see " + repo() + " with that token — check it has access to this repo." : "GitHub said " + res.status)); })
        .then(function (j) {
          if (j.permissions && !j.permissions.push) throw new Error("That token can read but not write — give it Contents: Read and write.");
          shas = {}; lastError = ""; emit();
          msg.className = "sy-msg ok"; msg.textContent = "Connected. Reloading with the latest data from GitHub…";
          setTimeout(function () { location.reload(); }, 900);
        })
        .catch(function (e) { set(TOKEN_KEY, oldT); set(REPO_KEY, oldR); msg.className = "sy-msg err"; msg.textContent = e.message; emit(); });
    };
  }
  function mount() {
    var navAdd = document.getElementById("nav-add");
    if (!navAdd || btn) return;
    btn = document.createElement("button");
    btn.className = "btn btn-ghost btn-sm sync-pill"; btn.id = "sync-btn"; btn.type = "button";
    btn.onclick = function () { if (lastError && connected()) { lastError = ""; emit(); } settings(); };
    navAdd.parentNode.insertBefore(btn, navAdd);
    paint();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", mount); else mount();
  window.addEventListener("beforeunload", function (e) { if (pending) { e.preventDefault(); e.returnValue = ""; } });

  window.GHSync = { connected: connected, repo: repo, read: read, write: write, writeBinary: writeBinary, remove: remove, queue: queue, evalData: evalData, onChange: function (f) { listeners.push(f); }, busy: function () { return pending > 0; } };
})();
