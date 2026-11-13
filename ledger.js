// Course Ledger tab for Course Log — every course you've played (or want to), grouped by architect.
// Data lives in ledger-data.js (LEDGER_DATA); edits save on this device and export with "Copy ledger-data.js".
// Photos: put image files in a photos/ folder in the repo and list their filenames on the course.
(function () {
  var LS_KEY = "golf-ledger-v1";
  var VIEW_KEY = "golf-ledger-view";
  var ROUNDS_LS = "golf-log-rounds-v1";
  var STATES = { CT: "Connecticut", NY: "New York", NJ: "New Jersey", PA: "Pennsylvania", OH: "Ohio", IN: "Indiana", CA: "California", SC: "South Carolina", FL: "Florida", ME: "Maine", DR: "Dominican Republic", RI: "Rhode Island", MA: "Massachusetts", MI: "Michigan", IL: "Illinois", WI: "Wisconsin", NC: "North Carolina", NE: "Nebraska", KS: "Kansas", OK: "Oklahoma" };

  var CSS = "" +
  ".lg-hero{display:grid;gap:10px;margin-bottom:6px}" +
  ".lg-tally{display:flex;flex-wrap:wrap;gap:6px 18px;font-size:13px;color:var(--muted)}.lg-tally b{color:var(--ink);font-variant-numeric:tabular-nums}" +
  ".lg-bar{height:6px;background:var(--line);border-radius:3px;overflow:hidden}.lg-bar i{display:block;height:100%;background:var(--green);transition:width .4s}" +
  ".lg-tools{position:sticky;top:58px;z-index:5;background:var(--bg);padding:12px 0;border-bottom:1px solid var(--line);display:grid;gap:10px;margin-bottom:6px}" +
  ".lg-row{display:flex;flex-wrap:wrap;gap:8px;align-items:center}" +
  ".lg-row input[type=search]{flex:1 1 220px;font:inherit;font-size:14px;border:1px solid var(--line);border-radius:8px;padding:8px 10px;background:var(--surface);color:var(--ink)}" +
  ".lg-seg{display:inline-flex;border:1px solid var(--line);border-radius:8px;overflow:hidden}" +
  ".lg-seg button{font:600 12.5px inherit;font-family:inherit;background:var(--surface);color:var(--muted);border:0;padding:7px 11px;cursor:pointer}" +
  ".lg-seg button+button{border-left:1px solid var(--line)}.lg-seg button.on{background:var(--green);color:#fff}" +
  ".lg-chip{font:600 11.5px inherit;font-family:inherit;letter-spacing:.04em;border:1px solid var(--line);background:transparent;color:var(--muted);border-radius:999px;padding:3px 9px;cursor:pointer}" +
  ".lg-chip.on{border-color:var(--green);color:var(--green);background:var(--surface)}" +
  ".lg-group{margin-top:22px}.lg-group h2{display:flex;align-items:baseline;gap:10px;margin:0 0 6px;font-size:18px;font-weight:800;letter-spacing:-.02em}" +
  ".lg-group h2 small{font-size:12px;color:var(--faint);font-weight:600}" +
  ".lg-list{list-style:none;margin:0;padding:0;border-top:1px solid var(--line);background:var(--surface);border-radius:0 0 10px 10px}" +
  ".lg-item{border-bottom:1px solid var(--line)}" +
  ".lg-line{display:grid;grid-template-columns:28px 1fr auto;gap:12px;align-items:center;padding:10px 8px}" +
  ".lg-ball{width:22px;height:22px;border-radius:50%;border:1.5px solid var(--faint);background:transparent;cursor:pointer;display:grid;place-items:center;padding:0}" +
  ".lg-ball.on{background:var(--green);border-color:var(--green)}" +
  ".lg-ball.on::after{content:'';width:8px;height:4px;border:2px solid #fff;border-top:0;border-right:0;transform:translateY(-1px) rotate(-45deg)}" +
  ".lg-main{min-width:0;cursor:pointer;background:none;border:0;text-align:left;color:inherit;font:inherit;padding:0}" +
  ".lg-name{font-weight:650;font-weight:600}.lg-item.played .lg-name{color:var(--green)}" +
  ".lg-meta{font-size:12.5px;color:var(--muted);overflow-wrap:anywhere}.lg-meta .a{color:var(--ink)}" +
  ".lg-right{display:flex;gap:6px;align-items:center;font-size:11.5px;color:var(--faint);font-variant-numeric:tabular-nums}" +
  ".lg-st{border:1px solid var(--line);border-radius:4px;padding:0 5px;font-weight:600}" +
  ".lg-tagp{background:var(--green-soft);color:var(--green);border-radius:99px;padding:0 7px;font-weight:700;font-size:10.5px}" +
  ".lg-tagr{background:var(--amber-soft);color:var(--amber);border-radius:99px;padding:0 7px;font-weight:700;font-size:10.5px}" +
  ".lg-det{padding:2px 8px 16px 48px;display:grid;gap:10px}" +
  ".lg-det label{display:grid;gap:4px;font-size:11.5px;color:var(--muted);font-weight:600;text-transform:uppercase;letter-spacing:.05em}" +
  ".lg-det input,.lg-det textarea{font:inherit;font-size:14px;text-transform:none;letter-spacing:0;border:1px solid var(--line);border-radius:8px;padding:7px 9px;background:#fff;color:var(--ink)}" +
  ".lg-det textarea{min-height:80px;resize:vertical}" +
  ".lg-g2{display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:10px}" +
  ".lg-photos{display:grid;grid-template-columns:repeat(auto-fill,minmax(120px,1fr));gap:8px}" +
  ".lg-photos figure{margin:0;aspect-ratio:4/3;border-radius:6px;overflow:hidden;background:#ECEFE9}.lg-photos img{width:100%;height:100%;object-fit:cover;display:block}" +
  ".lg-note{font-size:12.5px;color:var(--muted)}" +
  ".lg-date{color:var(--green);font-weight:600}.lg-rks{display:flex;gap:4px;margin-top:4px;flex-wrap:wrap}.lg-rk{font-size:10.5px;font-weight:700;padding:1px 7px;border-radius:99px;background:#ECEFE9;color:var(--muted)}.lg-rk.u{background:#E3EBF5;color:#264d77}.lg-rk.w{background:#1f3a2b;color:#fff}.lg-rk.s{background:var(--green-soft);color:var(--green)}" +
  ".lg-ph{position:relative}.lg-phdel{position:absolute;top:4px;right:4px;z-index:2;width:22px;height:22px;border-radius:50%;border:0;background:rgba(0,0,0,.6);color:#fff;font-size:14px;line-height:22px;cursor:pointer;padding:0}" +
  ".lg-empty{padding:40px 0;color:var(--muted);text-align:center;font-size:16px}" +
  ".lg-scrim{position:fixed;inset:0;background:rgba(18,24,20,.45);display:flex;align-items:flex-start;justify-content:center;padding:40px 14px;overflow:auto;z-index:60}" +
  ".lg-modal{background:var(--surface);border-radius:14px;max-width:520px;width:100%;padding:20px;box-shadow:0 20px 50px rgba(0,0,0,.2);display:grid;gap:10px}" +
  ".lg-modal h3{font-size:20px;font-weight:800;margin:0 0 4px}" +
  ".lg-modal label{display:grid;gap:4px;font-size:12px;color:var(--muted);font-weight:600}" +
  ".lg-modal input,.lg-modal select{font:inherit;font-size:14px;border:1px solid var(--line);border-radius:8px;padding:7px 9px;background:#fff;color:var(--ink)}" +
  "@media (max-width:560px){.lg-det{padding-left:8px}.lg-right .yr{display:none}}";
  var st = document.createElement("style"); st.textContent = CSS; document.head.appendChild(st);

  // ---------- state ----------
  function seed() { return normalize(JSON.parse(JSON.stringify(typeof LEDGER_DATA !== "undefined" ? LEDGER_DATA : []))); }
  function normalize(l) { return l.map(function (c) { return Object.assign({ town: "", state: "", year: null, played: false, playedYear: "", datePlayed: "", architects: [], renovations: [], notes: "", photos: [], t100State: null, t100USA: null, t100World: null, t100Slug: "", myState: null, myUSA: null }, c); }); }
  var DIRTY_KEY = LS_KEY + "-dirty";
  var ledgerListeners = [];
  function isDirty() { try { return !!localStorage.getItem(DIRTY_KEY); } catch (e) { return false; } }
  function setDirty(v) { try { if (v) localStorage.setItem(DIRTY_KEY, "1"); else localStorage.removeItem(DIRTY_KEY); } catch (e) {} }
  // Local edits only win while they haven't reached GitHub yet; otherwise the file (or GitHub) is the truth.
  var courses = (function () { try { var r = localStorage.getItem(LS_KEY); if (r && isDirty()) return normalize(JSON.parse(r)); } catch (e) {} return seed(); })();
  var photoMap = JSON.parse(JSON.stringify(typeof PHOTOS !== "undefined" ? PHOTOS : {}));
  var previews = {}; // freshly uploaded photo path -> object URL (until GitHub Pages redeploys)
  var upMsg = {};
  function fileText() { return "// COURSE LEDGER DATA — edited from the site or by Claude; committed to GitHub automatically\n// photos live in photos/<course-id>/ (see photos.js)\n\nconst LEDGER_DATA = [\n" + courses.map(function (c) { return JSON.stringify(c); }).join(",\n") + "\n];\n"; }
  function photosFileText() { return "// GENERATED — by update_photos.py or the site's photo uploader.\n\nconst PHOTOS = " + JSON.stringify(photoMap, null, 1) + ";\n"; }
  function persist() {
    try { localStorage.setItem(LS_KEY, JSON.stringify(courses)); } catch (e) {}
    setDirty(true);
    if (window.GHSync) GHSync.queue("ledger-data.js", fileText, "Ledger: update from the site", function (ok) { if (ok) setDirty(false); });
  }
  if (window.GHSync && GHSync.connected()) {
    if (isDirty()) persist();
    else GHSync.read("ledger-data.js").then(function (t) { var d = t && GHSync.evalData(t, "LEDGER_DATA"); if (d && !isDirty()) { courses = normalize(d); ledgerListeners.forEach(function (f) { f(); }); if (host && location.hash.indexOf("ledger") >= 0) render(host); } });
    GHSync.read("photos.js").then(function (t) { var d = t && GHSync.evalData(t, "PHOTOS"); if (d) { photoMap = d; if (host && location.hash.indexOf("ledger") >= 0) render(host); } });
  }
  var S = { group: "architect", show: "all", states: {}, q: "", open: {}, confirmDel: null };
  try { var v = JSON.parse(localStorage.getItem(VIEW_KEY) || "{}"); if (v.group) S.group = v.group; if (v.show) S.show = v.show; } catch (e) {}
  function saveView() { try { localStorage.setItem(VIEW_KEY, JSON.stringify({ group: S.group, show: S.show })); } catch (e) {} }
  var host = null;

  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function photosOf(c) { var m = photoMap[c.id] || []; return m.concat(c.photos.filter(function (f) { return m.indexOf(f) < 0; })); }
  function fmtDate(d) { if (!d) return ""; var p = d.split("-"); if (p.length < 3) return d; return new Date(+p[0], +p[1] - 1, +p[2]).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }); }
  function rankChips(c) {
    var out = [];
    if (c.t100World) out.push('<span class="lg-rk w">World #' + c.t100World + "</span>");
    if (c.t100USA) out.push('<span class="lg-rk u">USA #' + c.t100USA + "</span>");
    if (c.t100State) out.push('<span class="lg-rk s">' + esc(c.state) + " #" + c.t100State + "</span>");
    return out.length ? '<div class="lg-rks">' + out.join("") + "</div>" : "";
  }
  function canSync() { return !!(window.GHSync && GHSync.connected()); }
  function key(s) { return String(s || "").toLowerCase().replace(/\(.*?\)/g, "").replace(/\b(the|golf|country|club|links|of|course|cc|gc)\b/g, "").replace(/[^a-z0-9]+/g, ""); }
  // Rounds logged as played in Course Log also count.
  function roundKeys() {
    var r = [];
    try { var raw = localStorage.getItem(ROUNDS_LS); if (raw) r = JSON.parse(raw); } catch (e) {}
    if (!r.length && typeof ROUNDS !== "undefined") r = ROUNDS;
    return r.filter(function (x) { return x.status === "played"; }).map(function (x) { return key(x.course); }).filter(Boolean);
  }
  function fromRounds(c, rk) { var k = key(c.name); return !!k && rk.some(function (x) { return x === k || x.indexOf(k) === 0 || k.indexOf(x) === 0; }); }

  // ---------- render ----------
  function filtered(rk) {
    var q = S.q.trim().toLowerCase(), anyState = Object.keys(S.states).some(function (k) { return S.states[k]; });
    return courses.filter(function (c) {
      var p = c.played || fromRounds(c, rk);
      if (S.show === "played" && !p) return false;
      if (S.show === "todo" && p) return false;
      if (anyState && !S.states[c.state]) return false;
      if (q) { var hay = [c.name, c.town, c.state].concat(c.architects, c.renovations).join(" ").toLowerCase(); if (hay.indexOf(q) < 0) return false; }
      return true;
    });
  }
  function groups(list) {
    var m = {}, order = [];
    function add(k, c) { if (!m[k]) { m[k] = []; order.push(k); } m[k].push(c); }
    if (S.group === "architect") list.forEach(function (c) { (c.architects.length ? c.architects : ["Architect unknown"]).forEach(function (a) { add(a, c); }); });
    else if (S.group === "state") list.forEach(function (c) { add(c.state || "—", c); });
    else list.forEach(function (c) { add("All courses", c); });
    var e = order.map(function (k) { return [k, m[k].sort(function (a, b) { return a.name.localeCompare(b.name); })]; });
    if (S.group === "architect") e.sort(function (a, b) { return b[1].length - a[1].length || a[0].localeCompare(b[0]); });
    else e.sort(function (a, b) { return a[0].localeCompare(b[0]); });
    return e;
  }
  function render(el) {
    host = el;
    var rk = roundKeys();
    var played = courses.filter(function (c) { return c.played || fromRounds(c, rk); });
    var archs = {}; played.forEach(function (c) { c.architects.forEach(function (a) { archs[a] = 1; }); });
    var stCount = {}; played.forEach(function (c) { if (c.state) stCount[c.state] = 1; });
    var photos = courses.reduce(function (s, c) { return s + photosOf(c).length; }, 0);
    var present = Object.keys(courses.reduce(function (o, c) { if (c.state) o[c.state] = 1; return o; }, {})).sort();
    var h = '<div class="lg-hero"><div style="display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap;align-items:flex-start"><div><div class="page-title">Course Ledger</div>' +
      '<div class="page-sub" style="margin-bottom:0">Every course you\'ve played or want to — grouped by architect. Rounds logged as played count too.</div></div>' +
      '<div style="display:flex;gap:6px;flex-wrap:wrap">' + (window.GHSync && GHSync.connected() ? "" : '<button class="btn btn-ghost btn-sm" data-lg="export">Copy ledger-data.js</button><button class="btn btn-ghost btn-sm" data-lg="reset">Reload from file</button>') + '<button class="btn btn-primary btn-sm" data-lg="add">+ Course</button></div></div>' +
      '<div class="lg-tally"><span><b>' + played.length + "</b> of <b>" + courses.length + "</b> played</span><span><b>" + Object.keys(archs).length + "</b> architects</span><span><b>" + Object.keys(stCount).length + "</b> states & countries</span><span><b>" + photos + '</b> photos</span></div>' +
      '<div class="lg-bar"><i style="width:' + (courses.length ? (100 * played.length / courses.length) : 0) + '%"></i></div></div>';
    h += '<div class="lg-tools"><div class="lg-row"><input type="search" id="lg-q" placeholder="Search course, town or architect" value="' + esc(S.q) + '">' +
      '<div class="lg-seg">' + [["architect", "By architect"], ["state", "By state"], ["none", "A–Z"]].map(function (x) { return '<button data-lgg="' + x[0] + '" class="' + (S.group === x[0] ? "on" : "") + '">' + x[1] + "</button>"; }).join("") + "</div>" +
      '<div class="lg-seg">' + [["all", "All"], ["played", "Played"], ["todo", "Not yet"]].map(function (x) { return '<button data-lgs="' + x[0] + '" class="' + (S.show === x[0] ? "on" : "") + '">' + x[1] + "</button>"; }).join("") + "</div></div>" +
      '<div class="lg-row">' + present.map(function (s) { return '<button class="lg-chip ' + (S.states[s] ? "on" : "") + '" data-lgst="' + esc(s) + '">' + esc(s) + "</button>"; }).join("") + "</div></div>";
    h += '<div id="lg-list">' + listHTML(rk) + "</div>";
    el.innerHTML = h;
  }
  function listHTML(rk) {
    if (!courses.length) return '<div class="lg-empty">No courses yet — use + Course to start.</div>';
    var list = filtered(rk);
    if (!list.length) return '<div class="lg-empty">Nothing matches those filters.</div>';
    return groups(list).map(function (g) {
      var p = g[1].filter(function (c) { return c.played || fromRounds(c, rk); }).length;
      var t = S.group === "state" ? (STATES[g[0]] || g[0]) : g[0];
      return '<section class="lg-group"><h2>' + esc(t) + " <small>" + p + "/" + g[1].length + ' played</small></h2><ul class="lg-list">' + g[1].map(function (c) { return itemHTML(c, rk); }).join("") + "</ul></section>";
    }).join("");
  }
  function itemHTML(c, rk) {
    var viaRound = !c.played && fromRounds(c, rk), p = c.played || viaRound, open = !!S.open[c.id];
    var ren = c.renovations.length ? " · renov. " + esc(c.renovations.join(", ")) : "";
    var det = "";
    if (open) {
      var pics = photosOf(c).map(function (f) { var src = previews[f] || (/^(https?:|data:|\/|photos\/)/.test(f) ? f : "photos/" + f); var del = canSync() && /^photos\//.test(f) ? '<button class="lg-phdel" data-lgphdel="' + esc(f) + '" data-id="' + esc(c.id) + '" title="Remove photo">×</button>' : ""; return '<div class="lg-ph">' + del + '<a href="' + esc(src) + '" target="_blank" rel="noopener">' + '<figure><img src="' + esc(src) + '" alt="' + esc(c.name) + '" loading="lazy" onerror="this.parentNode.style.display=\'none\'"></figure></a></div>'; }).join("");
      det = '<div class="lg-det"><div class="lg-g2">' +
        '<label>Date played<input type="date" data-lgf="datePlayed" data-id="' + esc(c.id) + '" value="' + esc(c.datePlayed) + '"' + (p ? "" : " disabled title=\"Tick the course as played first\"") + '>' + (c.playedYear && !c.datePlayed ? '<span class="lg-note">Year on file: ' + esc(c.playedYear) + "</span>" : "") + "</label>" +
        '<label>Architects (comma-separated)<input data-lgf="architects" data-id="' + esc(c.id) + '" value="' + esc(c.architects.join(", ")) + '"></label></div>' +
        '<div class="lg-g2"><label>Town<input data-lgf="town" data-id="' + esc(c.id) + '" value="' + esc(c.town) + '"></label><label>State<input data-lgf="state" data-id="' + esc(c.id) + '" value="' + esc(c.state) + '" maxlength="2"></label></div>' +
        '<label>Notes<textarea data-lgf="notes" data-id="' + esc(c.id) + '" placeholder="Best holes, conditions, who you played with…">' + esc(c.notes) + "</textarea></label>" +
        (pics ? '<div class="lg-photos">' + pics + "</div>" : "") +
        (canSync() ? '<div class="lg-row"><label class="btn btn-ghost btn-sm" style="cursor:pointer">+ Add photos<input type="file" accept="image/*" multiple data-lgup="' + esc(c.id) + '" style="display:none"></label><span class="lg-note">' + esc(upMsg[c.id] || "Uploads go straight to GitHub (resized to web size).") + "</span></div>"
          : '<p class="lg-note">Photo folder: <code>photos/' + esc(c.id) + '/</code> — connect GitHub (top right) to upload here, or drop files there and run <code>python3 update_photos.py</code>.</p>') +
        (viaRound ? '<p class="lg-note">Marked played because you logged a round here.</p>' : "") +
        (S.confirmDel === c.id ? '<div class="lg-row"><span class="lg-note">Remove ' + esc(c.name) + ' from the ledger?</span><button class="btn btn-danger btn-sm" data-lgdel="' + esc(c.id) + '">Remove</button><button class="btn btn-ghost btn-sm" data-lgkeep="1">Keep</button></div>' : '<div><button class="btn btn-ghost btn-sm" data-lgask="' + esc(c.id) + '">Remove course</button></div>') +
        "</div>";
    }
    return '<li class="lg-item ' + (p ? "played" : "") + '"><div class="lg-line">' +
      '<button class="lg-ball ' + (p ? "on" : "") + '" title="' + (viaRound ? "Played (from a logged round)" : "Mark played") + '" data-lgt="' + esc(c.id) + '"' + (viaRound ? " disabled" : "") + "></button>" +
      '<button class="lg-main" data-lgo="' + esc(c.id) + '"><div class="lg-name">' + esc(c.name) + '</div><div class="lg-meta">' + esc(c.town) + (c.town ? ", " : "") + esc(c.state) + ' · <span class="a">' + esc(c.architects.join(" & ") || "Architect unknown") + "</span>" + ren + (p && (c.datePlayed || c.playedYear) ? ' · <span class="lg-date">played ' + esc(fmtDate(c.datePlayed) || c.playedYear) + "</span>" : "") + "</div>" + rankChips(c) + "</button>" +
      '<div class="lg-right">' + (viaRound ? '<span class="lg-tagr">logged</span>' : "") + (photosOf(c).length ? '<span class="lg-tagp">' + photosOf(c).length + " ph</span>" : "") + '<span class="yr">' + esc(c.year || "") + '</span><span class="lg-st">' + esc(c.state) + "</span></div></div>" + det + "</li>";
  }
  function redrawList() { var l = document.getElementById("lg-list"); if (l) l.innerHTML = listHTML(roundKeys()); }

  // ---------- add / export ----------
  function addModal() {
    var s = document.createElement("div"); s.className = "lg-scrim";
    s.innerHTML = '<div class="lg-modal"><h3>Add a course</h3><label>Course name<input id="lga-name"></label>' +
      '<div class="lg-g2"><label>Town<input id="lga-town"></label><label>State<input id="lga-state" maxlength="2" placeholder="OH"></label></div>' +
      '<label>Architects (comma-separated)<input id="lga-arch" placeholder="Donald Ross, Gil Hanse"></label>' +
      '<div class="lg-g2"><label>Year opened<input id="lga-year" inputmode="numeric"></label><label>Already played?<select id="lga-played"><option value="no">Not yet</option><option value="yes">Played</option></select></label></div>' +
      '<div class="lg-row" style="justify-content:flex-end"><button class="btn btn-ghost btn-sm" id="lga-cancel">Cancel</button><button class="btn btn-primary btn-sm" id="lga-save">Save course</button></div></div>';
    document.body.appendChild(s);
    function close() { s.remove(); }
    s.addEventListener("mousedown", function (e) { if (e.target === s) close(); });
    s.querySelector("#lga-cancel").onclick = close;
    s.querySelector("#lga-save").onclick = function () {
      var name = s.querySelector("#lga-name").value.trim(); if (!name) { s.querySelector("#lga-name").focus(); return; }
      var id = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60) + "-" + Math.random().toString(36).slice(2, 6);
      var y = parseInt(s.querySelector("#lga-year").value, 10);
      courses.push({ id: id, name: name, town: s.querySelector("#lga-town").value.trim(), state: s.querySelector("#lga-state").value.trim().toUpperCase(),
        architects: s.querySelector("#lga-arch").value.split(",").map(function (x) { return x.trim(); }).filter(Boolean), renovations: [],
        year: isNaN(y) ? null : y, played: s.querySelector("#lga-played").value === "yes", playedYear: "", notes: "", photos: [] });
      S.open[id] = true; persist(); close(); render(host);
    };
    setTimeout(function () { s.querySelector("#lga-name").focus(); }, 30);
  }
  function toast(msg) { var t = document.getElementById("toast"); if (!t) return; t.textContent = msg; t.style.display = "block"; clearTimeout(t._h); t._h = setTimeout(function () { t.style.display = "none"; }, 2200); }
  function exportFile() {
    var file = "// COURSE LEDGER DATA — paste this whole file over ledger-data.js in GitHub\n// photos: filenames inside the photos/ folder, e.g. \"oakmont-1.jpg\"\n\nconst LEDGER_DATA = [\n" + courses.map(function (c) { return JSON.stringify(c); }).join(",\n") + "\n];\n";
    var done = function () { toast("Copied — paste over ledger-data.js in GitHub"); };
    function fallback() { var ta = document.createElement("textarea"); ta.value = file; document.body.appendChild(ta); ta.select(); try { document.execCommand("copy"); } catch (e) {} document.body.removeChild(ta); done(); }
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(file).then(done, fallback); else fallback();
  }

  // ---------- events ----------
  document.addEventListener("click", function (e) {
    if (!host || !host.contains(e.target)) return;
    var t = e.target.closest("button"); if (!t) return;
    var d = t.dataset;
    if (d.lgg) { S.group = d.lgg; saveView(); render(host); }
    else if (d.lgs) { S.show = d.lgs; saveView(); render(host); }
    else if (d.lgst) { S.states[d.lgst] = !S.states[d.lgst]; render(host); }
    else if (d.lgt) { var c = courses.find(function (x) { return x.id === d.lgt; }); if (c) { c.played = !c.played; if (c.played && !c.datePlayed) S.open[c.id] = true; persist(); render(host); } }
    else if (d.lgo) { S.open[d.lgo] = !S.open[d.lgo]; S.confirmDel = null; redrawList(); }
    else if (d.lgask) { S.confirmDel = d.lgask; redrawList(); }
    else if (d.lgkeep) { S.confirmDel = null; redrawList(); }
    else if (d.lgdel) { courses = courses.filter(function (x) { return x.id !== d.lgdel; }); S.confirmDel = null; persist(); render(host); }
    else if (d.lgphdel) {
      var pc = d.id, pf = d.lgphdel;
      if (!t.dataset.sure) { t.dataset.sure = "1"; t.textContent = "?"; t.title = "Click again to remove"; return; }
      photoMap[pc] = (photoMap[pc] || []).filter(function (x) { return x !== pf; }); if (!photoMap[pc].length) delete photoMap[pc];
      redrawList();
      GHSync.remove(pf, "Photos: remove " + pf).then(function () { return GHSync.write("photos.js", photosFileText(), "Photos: update list"); });
    }
    else if (d.lg === "add") addModal();
    else if (d.lg === "export") exportFile();
    else if (d.lg === "reset") { if (confirm("Discard ledger edits on this device and reload from ledger-data.js?")) { try { localStorage.removeItem(LS_KEY); } catch (er) {} courses = seed(); render(host); toast("Reloaded from ledger-data.js"); } }
  });
  var timers = {};
  document.addEventListener("input", function (e) {
    if (!host || !host.contains(e.target)) return;
    var t = e.target;
    if (t.id === "lg-q") { S.q = t.value; redrawList(); return; }
    var f = t.dataset && t.dataset.lgf; if (!f) return;
    var c = courses.find(function (x) { return x.id === t.dataset.id; }); if (!c) return;
    clearTimeout(timers[c.id + f]);
    timers[c.id + f] = setTimeout(function () {
      if (f === "architects" || f === "photos") c[f] = t.value.split(",").map(function (x) { return x.trim(); }).filter(Boolean);
      else if (f === "state") c.state = t.value.trim().toUpperCase();
      else c[f] = t.value;
      persist();
    }, 400);
  });

  function resizeToJpeg(file) {
    return new Promise(function (resolve, reject) {
      var url = URL.createObjectURL(file), img = new Image();
      img.onload = function () {
        var s = Math.min(1, 1800 / Math.max(img.naturalWidth, img.naturalHeight));
        var cv = document.createElement("canvas"); cv.width = Math.round(img.naturalWidth * s); cv.height = Math.round(img.naturalHeight * s);
        cv.getContext("2d").drawImage(img, 0, 0, cv.width, cv.height);
        cv.toBlob(function (b) { URL.revokeObjectURL(url); b ? resolve(b) : reject(new Error("convert")); }, "image/jpeg", 0.82);
      };
      img.onerror = function () { URL.revokeObjectURL(url); reject(new Error("This browser can't open that file (iPhone HEIC works in Safari; or export as JPG).")); };
      img.src = url;
    });
  }
  function blobToB64(b) { return new Promise(function (res) { var r = new FileReader(); r.onload = function () { res(String(r.result).split(",")[1]); }; r.readAsDataURL(b); }); }
  document.addEventListener("change", function (e) {
    var t = e.target;
    if (t.dataset && t.dataset.lgf === "datePlayed") { var dc = courses.find(function (x) { return x.id === t.dataset.id; }); if (dc) { dc.datePlayed = t.value; persist(); redrawList(); } return; }
    if (!t.dataset || !t.dataset.lgup || !canSync()) return;
    var id = t.dataset.lgup, files = Array.prototype.slice.call(t.files || []); if (!files.length) return;
    var stamp = new Date().toISOString().replace(/[-:T]/g, "").slice(0, 14), done = 0, failed = "";
    upMsg[id] = "Uploading " + files.length + " photo" + (files.length > 1 ? "s" : "") + "…"; redrawList();
    files.reduce(function (p, f, i) {
      return p.then(function () {
        return resizeToJpeg(f).then(function (blob) {
          var path = "photos/" + id + "/" + stamp + "-" + (i + 1) + ".jpg";
          return blobToB64(blob).then(function (b64) { return GHSync.writeBinary(path, b64, "Photos: add " + path); }).then(function () {
            previews[path] = URL.createObjectURL(blob);
            photoMap[id] = (photoMap[id] || []).concat([path]); done++;
            upMsg[id] = "Uploaded " + done + " of " + files.length + "…"; redrawList();
          });
        }).catch(function (err) { failed = err.message || "Upload failed"; });
      });
    }, Promise.resolve()).then(function () {
      return done ? GHSync.write("photos.js", photosFileText(), "Photos: update list") : null;
    }).then(function () {
      upMsg[id] = failed ? failed : "Added " + done + " photo" + (done > 1 ? "s" : "") + " — live on the public site in about a minute.";
      redrawList();
    });
  });

  window.LedgerApp = {
    render: render,
    courses: function () { return courses; },
    update: function (id, patch) { var c = courses.find(function (x) { return x.id === id; }); if (!c) return; Object.assign(c, patch); persist(); },
    photosOf: function (c) { return photosOf(c); },
    onChange: function (f) { ledgerListeners.push(f); },
    playedNames: function () { var rk = roundKeys(); return courses.filter(function (c) { return c.played || fromRounds(c, rk); }).map(function (c) { return c.name; }); }
  };
})();
