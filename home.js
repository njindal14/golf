// Home dashboard — pulls from the Ledger, the 2027 plan and logged rounds.
(function () {
  var CSS = "" +
    ".hm-hero{background:linear-gradient(135deg,#0B5B3C 0%,#07402A 60%,#062e1f 100%);color:#fff;border-radius:18px;padding:28px 26px 24px;position:relative;overflow:hidden;margin-bottom:18px}" +
    ".hm-hero:after{content:'';position:absolute;right:-60px;top:-60px;width:240px;height:240px;border-radius:50%;background:radial-gradient(circle,rgba(217,240,94,.22),rgba(217,240,94,0) 70%)}" +
    ".hm-hero .k{font-size:11px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:var(--lime)}" +
    ".hm-hero h1{font-size:34px;font-weight:800;letter-spacing:-.03em;margin:6px 0 4px}" +
    ".hm-hero p{margin:0;color:rgba(255,255,255,.75);font-size:14.5px}" +
    ".hm-stats{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-top:20px;position:relative;z-index:1}" +
    ".hm-stat{background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.12);border-radius:12px;padding:12px 14px;cursor:pointer}" +
    ".hm-stat .v{font-size:24px;font-weight:800;letter-spacing:-.02em}.hm-stat .v small{font-size:13px;opacity:.6;font-weight:600}.hm-stat .l{font-size:11.5px;opacity:.75;margin-top:2px}" +
    ".hm-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px}" +
    ".hm-card{background:var(--surface);border:1px solid var(--line);border-radius:14px;padding:16px 16px 10px;box-shadow:var(--shadow)}" +
    ".hm-card h3{display:flex;justify-content:space-between;align-items:baseline;margin:0 0 8px;font-size:15px;font-weight:800;letter-spacing:-.01em}" +
    ".hm-card h3 a{font-size:12.5px;font-weight:600}" +
    ".hm-row{display:flex;gap:12px;align-items:center;padding:9px 0;border-top:1px solid var(--line);cursor:pointer}.hm-row:first-of-type{border-top:0}" +
    ".hm-date{min-width:46px;text-align:center;border-radius:8px;background:var(--green-soft);color:var(--green);padding:4px 0;line-height:1.1}" +
    ".hm-date b{display:block;font-size:16px}.hm-date span{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.05em}" +
    ".hm-date.tbd{background:#ECEFE9;color:var(--muted)}" +
    ".hm-main{flex:1;min-width:0}.hm-t{font-weight:600;font-size:14px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.hm-s{font-size:12px;color:var(--muted)}" +
    ".hm-badge{font-size:11px;font-weight:700;padding:2px 8px;border-radius:99px;background:#E3EBF5;color:#264d77;white-space:nowrap}.hm-badge.w{background:#1f3a2b;color:#fff}.hm-badge.s{background:var(--green-soft);color:var(--green)}" +
    ".hm-thumbs{display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin:4px 0 8px}.hm-thumbs a{display:block;aspect-ratio:1;border-radius:8px;overflow:hidden;background:#ECEFE9}.hm-thumbs img{width:100%;height:100%;object-fit:cover;display:block}" +
    ".hm-empty{color:var(--muted);font-size:13px;padding:10px 0 14px}" +
    "@media (max-width:720px){.hm-stats{grid-template-columns:repeat(2,1fr)}.hm-grid{grid-template-columns:1fr}.hm-hero h1{font-size:28px}}";
  var st = document.createElement("style"); st.textContent = CSS; document.head.appendChild(st);
  var MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function today() { var d = new Date(); return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); }
  function dateBox(iso, monthOnly) {
    if (!iso && !monthOnly) return '<div class="hm-date tbd"><b>—</b><span>TBD</span></div>';
    if (monthOnly) return '<div class="hm-date tbd"><b>' + MON[monthOnly - 1] + "</b><span>TBD</span></div>";
    var p = iso.split("-"); return '<div class="hm-date"><b>' + (+p[2] || "") + "</b><span>" + MON[+p[1] - 1] + " " + String(p[0]).slice(2) + "</span></div>";
  }
  function bestBadge(c) {
    if (c.t100World) return '<span class="hm-badge w">World #' + c.t100World + "</span>";
    if (c.t100USA) return '<span class="hm-badge">USA #' + c.t100USA + "</span>";
    if (c.t100State) return '<span class="hm-badge s">' + esc(c.state) + " #" + c.t100State + "</span>";
    return "";
  }
  function render(app, rounds) {
    var L = window.LedgerApp ? LedgerApp.courses() : [];
    var played = L.filter(function (c) { return c.played; });
    var states = {}, archs = {};
    played.forEach(function (c) { if (c.state) states[c.state] = 1; c.architects.forEach(function (a) { archs[a] = 1; }); });
    var usa = played.filter(function (c) { return c.t100USA; }).length;
    var t = today();
    // Next up: plan events + upcoming rounds
    var ev = (window.PlanApp && PlanApp.events ? PlanApp.events() : []).filter(function (e) { return e.start ? (e.end || e.start) >= t : (e.month && new Date().getFullYear() <= 2027); });
    var up = ev.map(function (e) { return { key: e.start || ("2027-" + String(e.month).padStart(2, "0") + "-32"), box: dateBox(e.start, e.start ? null : e.month), t: e.title, s: [e.loc, (e.with || []).join(", ")].filter(Boolean).join(" · "), go: "#/plan" }; });
    (rounds || []).filter(function (r) { return r.status === "upcoming" && r.date >= t; }).forEach(function (r) { up.push({ key: r.date, box: dateBox(r.date), t: r.course, s: "Tee time" + (r.city ? " · " + r.city : ""), go: "#/calendar" }); });
    up.sort(function (a, b) { return a.key < b.key ? -1 : 1; }); up = up.slice(0, 6);
    // Recently played: ledger dates + played rounds
    var rec = played.filter(function (c) { return c.datePlayed; }).map(function (c) { return { key: c.datePlayed, box: dateBox(c.datePlayed), t: c.name, s: c.architects.join(" & "), badge: bestBadge(c), go: "#/ledger" }; });
    (rounds || []).filter(function (r) { return r.status === "played"; }).forEach(function (r) { if (!rec.some(function (x) { return x.key === r.date && x.t === r.course; })) rec.push({ key: r.date, box: dateBox(r.date), t: r.course, s: r.score1 ? "Shot " + r.score1 : (r.city || ""), badge: "", go: "#/calendar" }); });
    rec.sort(function (a, b) { return a.key > b.key ? -1 : 1; }); rec = rec.slice(0, 6);
    // Best-ranked played
    var best = played.filter(function (c) { return c.t100State || c.t100USA; }).sort(function (a, b) {
      function k(c) { return c.t100World ? c.t100World : c.t100USA ? 100 + c.t100USA : 1000 + c.t100State; } return k(a) - k(b);
    }).slice(0, 6);
    // Photos
    var pics = [];
    L.forEach(function (c) { (window.LedgerApp.photosOf ? LedgerApp.photosOf(c) : []).forEach(function (p) { pics.push({ p: p, c: c }); }); });
    pics = pics.slice(-8).reverse();
    function rows(list, empty) { return list.length ? list.map(function (r) { return '<div class="hm-row" data-go="' + r.go + '">' + r.box + '<div class="hm-main"><div class="hm-t">' + esc(r.t) + '</div><div class="hm-s">' + esc(r.s || "") + "</div></div>" + (r.badge || "") + "</div>"; }).join("") : '<div class="hm-empty">' + empty + "</div>"; }
    app.innerHTML =
      '<div class="hm-hero"><div class="k">Golf journal · Top100 rater</div><h1>Nick Jindal</h1><p>Every course played, ranked and remembered — plus where to next.</p>' +
      '<div class="hm-stats">' +
      '<div class="hm-stat" data-go="#/ledger"><div class="v">' + played.length + '</div><div class="l">Courses played</div></div>' +
      '<div class="hm-stat" data-go="#/rankings"><div class="v">' + usa + ' <small>/ 100</small></div><div class="l">USA Top 100 played</div></div>' +
      '<div class="hm-stat" data-go="#/ledger"><div class="v">' + Object.keys(states).length + '</div><div class="l">States & countries</div></div>' +
      '<div class="hm-stat" data-go="#/ledger"><div class="v">' + Object.keys(archs).length + '</div><div class="l">Architects</div></div>' +
      "</div></div>" +
      '<div class="hm-grid">' +
      '<div class="hm-card"><h3>Next up <a href="#/plan">2027 Plan →</a></h3>' + rows(up, "Nothing scheduled — add a trip in the 2027 Plan.") + "</div>" +
      '<div class="hm-card"><h3>Recently played <a href="#/ledger">Ledger →</a></h3>' + rows(rec, "Add a <b>date played</b> to courses in the Ledger and they’ll show up here.") + "</div>" +
      '<div class="hm-card"><h3>Best-ranked courses played <a href="#/rankings">Rankings →</a></h3>' + rows(best.map(function (c) { return { box: '<div class="hm-date"><b>' + esc(c.state) + "</b><span>" + (c.datePlayed ? c.datePlayed.slice(0, 4) : "") + "</span></div>", t: c.name, s: c.architects.join(" & "), badge: bestBadge(c), go: "#/rankings" }; }), "No ranked courses yet.") + "</div>" +
      '<div class="hm-card"><h3>Latest photos <a href="#/ledger">Add more →</a></h3>' + (pics.length ? '<div class="hm-thumbs">' + pics.map(function (x) { return '<a href="' + esc(x.p) + '" target="_blank" rel="noopener" title="' + esc(x.c.name) + '"><img src="' + esc(x.p) + '" alt="' + esc(x.c.name) + '" loading="lazy"></a>'; }).join("") + "</div>" : '<div class="hm-empty">No photos yet.</div>') + "</div>" +
      "</div>";
    app.querySelectorAll("[data-go]").forEach(function (el) { el.addEventListener("click", function () { location.hash = el.dataset.go; }); });
  }
  window.HomeApp = { render: render };
})();
