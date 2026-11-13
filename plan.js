// 2027 Plan + Bucket List tabs for Course Log.
// Data lives in plan-data.js (PLAN_DATA); edits save on this device and export with "Copy plan-data.js".
(function () {
  var LS_KEY = "golf-plan-v1";
  var ROUNDS_LS = "golf-log-rounds-v1";
  var YEAR = 2027;
  var CATS = {
    trip: { label: "Trip", c: "#2f7a45" },
    rater: { label: "Rater round", c: "#B45309" },
    tournament: { label: "Tournament", c: "#a23b2a" },
    club: { label: "Club / member-guest", c: "#7b3f61" },
    pro: { label: "Pro event", c: "#2b5c8a" },
    block: { label: "Blocked (physics/thesis)", c: "#6b6f73" },
    personal: { label: "Personal", c: "#7a62a8" }
  };
  var PRI = ["block", "tournament", "club", "trip", "rater", "personal", "pro"];
  var STAT = { confirmed: "Confirmed", planned: "Planned", applied: "Applied", tentative: "Tentative", idea: "Idea" };
  var PEOPLE = ["Dad", "Sean", "Sister"];
  var REGIONS = ["Midwest Central", "Atlantic", "New England", "Elsewhere in the U.S.", "International"];
  var REGION_NOTE = {
    "Midwest Central": "Your current panel (OH, IN, IL, WI, MI). Natural trips with Sean.",
    "Atlantic": "NY / PA / NJ / DC panel, if you join. Good fits for trips with Dad.",
    "New England": "Lines up with the Essex & Myopia member-guests and Tamarack.",
    "Elsewhere in the U.S.": "Destination trips.",
    "International": "Ryder Cup in Ireland makes September the year to go."
  };
  var MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

  var CSS = "" +
  ".pl-filters{display:flex;flex-wrap:wrap;gap:6px;align-items:center;margin-bottom:12px}" +
  ".pl-flabel{font-size:11px;color:var(--faint);margin:0 2px 0 8px;text-transform:uppercase;letter-spacing:.06em;font-weight:600}" +
  ".pl-chip{display:inline-flex;align-items:center;gap:6px;padding:4px 10px;border-radius:99px;border:1px solid var(--line);background:var(--surface);cursor:pointer;font-size:12.5px;font-weight:500;user-select:none}" +
  ".pl-chip.off{opacity:.4}.pl-dot{width:9px;height:9px;border-radius:50%;display:inline-block;flex:none}" +
  ".pl-legend{display:flex;flex-wrap:wrap;gap:12px;font-size:12px;color:var(--muted);margin:0 0 16px}" +
  ".pl-sub{display:flex;gap:4px;margin-bottom:14px}.pl-sub button{border:1px solid var(--line);background:var(--surface);padding:6px 12px;border-radius:8px;font:inherit;font-size:13px;font-weight:600;color:var(--muted);cursor:pointer}.pl-sub button.on{background:var(--green-soft);color:var(--green);border-color:transparent}" +
  ".pl-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(290px,1fr));gap:12px}" +
  ".pl-month{background:var(--surface);border:1px solid var(--line);border-radius:var(--radius);padding:14px;box-shadow:var(--shadow)}" +
  ".pl-month h3{font-size:16px;font-weight:800;letter-spacing:-.02em;margin:0 0 8px;display:flex;justify-content:space-between;align-items:baseline}" +
  ".pl-month h3 small{font-size:11px;color:var(--faint);font-weight:500}" +
  ".pl-cal{display:grid;grid-template-columns:repeat(7,1fr);gap:2px;margin-bottom:10px}" +
  ".pl-dow{font-size:10px;color:var(--faint);text-align:center}" +
  ".pl-day{position:relative;height:24px;border-radius:5px;font-size:11px;display:flex;align-items:center;justify-content:center;color:var(--muted);background:#F1F3EF}" +
  ".pl-day.empty{background:none}.pl-day.has{color:#fff;font-weight:700}.pl-day.idea{color:var(--ink)}.pl-day.wk:not(.has){background:#E8ECE6}" +
  ".pl-day .more{position:absolute;top:2px;right:2px;width:5px;height:5px;border-radius:50%;background:#fff;box-shadow:0 0 0 1px rgba(0,0,0,.25)}" +
  ".pl-evs{display:flex;flex-direction:column;gap:3px}" +
  ".pl-ev{display:flex;gap:8px;align-items:flex-start;padding:5px 6px;border-radius:7px;cursor:pointer;border-left:3px solid var(--c)}" +
  ".pl-ev:hover{background:var(--bg)}.pl-ev.idea{border-left-style:dashed}" +
  ".pl-ev .d{font-size:11px;color:var(--faint);min-width:58px;padding-top:1px}.pl-ev .t{flex:1;font-size:13px;line-height:1.35}.pl-ev .t b{font-weight:600}" +
  ".pl-pp{font-size:10px;font-weight:700;padding:0 6px;border-radius:99px;background:var(--green-soft);color:var(--green);line-height:16px;margin-left:4px;display:inline-block}" +
  ".pl-pp.Dad{background:#E3EBF5;color:#264d77}.pl-pp.Sean{background:var(--amber-soft);color:var(--amber)}.pl-pp.Sister{background:#EFE6F5;color:#5d3f80}" +
  ".pl-badge{font-size:9.5px;padding:0 6px;border-radius:99px;border:1px solid var(--line);color:var(--faint);line-height:15px;margin-left:4px;text-transform:uppercase;letter-spacing:.04em;display:inline-block}" +
  ".pl-warn{color:#B3392A;font-size:11px}.pl-empty{color:var(--faint);font-size:12px;font-style:italic;padding:4px 6px}" +
  ".pl-tlm{margin-bottom:20px}.pl-tlm h3{font-size:18px;font-weight:800;margin:0 0 8px;color:var(--green)}" +
  ".pl-tli{background:var(--surface);border:1px solid var(--line);border-left:5px solid var(--c);border-radius:10px;padding:12px 14px;margin-bottom:8px;cursor:pointer}" +
  ".pl-tli.idea{border-left-style:dashed}.pl-tli .tt{font-weight:700;font-size:15px}.pl-tli .mm{color:var(--muted);font-size:12px;margin-top:2px}.pl-tli .nn{margin-top:6px;white-space:pre-wrap;font-size:13px;color:var(--muted)}" +
  ".pl-region{margin-bottom:22px}.pl-region h3{font-size:18px;font-weight:800;margin:0 0 2px;color:var(--green)}.pl-region p{margin:0 0 10px;color:var(--muted);font-size:13px}" +
  ".pl-bgrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:10px}" +
  ".pl-bk{background:var(--surface);border:1px solid var(--line);border-radius:10px;padding:12px;cursor:pointer;display:flex;flex-direction:column;gap:4px}" +
  ".pl-bk .n{font-weight:700;font-size:14.5px}.pl-bk .m{font-size:12px;color:var(--muted)}.pl-bk .x{font-size:13px}" +
  ".pl-st{font-size:11px;font-weight:700;padding:1px 8px;border-radius:99px;align-self:flex-start;white-space:nowrap}" +
  ".pl-st.want{background:#ECEFE9;color:var(--muted)}.pl-st.requested{background:var(--amber-soft);color:var(--amber)}.pl-st.booked{background:var(--green-soft);color:var(--green)}.pl-st.played{background:var(--green);color:#fff}" +
  ".pl-tag{font-size:10px;font-weight:700;padding:0 6px;border-radius:99px;background:#EFE6F5;color:#5d3f80;line-height:16px;display:inline-block}" +
  ".pl-scrim{position:fixed;inset:0;background:rgba(18,24,20,.45);display:flex;align-items:flex-start;justify-content:center;padding:40px 14px;overflow:auto;z-index:60}" +
  ".pl-modal{background:var(--surface);border-radius:14px;max-width:560px;width:100%;padding:20px;box-shadow:0 20px 50px rgba(0,0,0,.2)}" +
  ".pl-modal h3{font-size:20px;font-weight:800;margin:0 0 12px}" +
  ".pl-row{display:grid;grid-template-columns:1fr 1fr;gap:10px}" +
  ".pl-fld{display:flex;flex-direction:column;gap:3px;margin-bottom:10px}.pl-fld label{font-size:12px;color:var(--muted);font-weight:600}" +
  ".pl-fld input,.pl-fld select,.pl-fld textarea{font:inherit;font-size:14px;border:1px solid var(--line);border-radius:8px;padding:7px 9px;background:#fff;color:var(--ink)}" +
  ".pl-fld textarea{min-height:100px;resize:vertical}.pl-checks{display:flex;gap:12px;flex-wrap:wrap;align-items:center}.pl-checks label{display:flex;gap:4px;align-items:center;font-size:13px;color:var(--ink);font-weight:500}" +
  ".pl-foot{display:flex;justify-content:space-between;gap:8px;margin-top:6px}" +
  ".pl-top{display:flex;justify-content:space-between;align-items:flex-start;gap:12px;flex-wrap:wrap;margin-bottom:8px}.pl-actions{display:flex;gap:6px;flex-wrap:wrap}" +
  "@media (max-width:560px){.pl-row{grid-template-columns:1fr}}";
  var st = document.createElement("style"); st.textContent = CSS; document.head.appendChild(st);

  // ---------- state ----------
  function seed() { return JSON.parse(JSON.stringify(typeof PLAN_DATA !== "undefined" ? PLAN_DATA : { events: [], bucket: [] })); }
  var DIRTY_KEY = LS_KEY + "-dirty";
  function isDirty() { try { return !!localStorage.getItem(DIRTY_KEY); } catch (e) { return false; } }
  function setDirty(v) { try { if (v) localStorage.setItem(DIRTY_KEY, "1"); else localStorage.removeItem(DIRTY_KEY); } catch (e) {} }
  var state = (function () {
    try { var raw = localStorage.getItem(LS_KEY); if (raw && isDirty()) { var o = JSON.parse(raw); if (o && o.events && o.bucket) return o; } } catch (e) {}
    return seed();
  })();
  function fileText() { return "// 2027 GOLF PLAN DATA — edited from the site or by Claude; committed to GitHub automatically\n\nconst PLAN_DATA = " + JSON.stringify(state, null, 1) + ";\n"; }
  function persist() {
    try { localStorage.setItem(LS_KEY, JSON.stringify(state)); } catch (e) {}
    setDirty(true);
    if (window.GHSync) GHSync.queue("plan-data.js", fileText, "Plan: update from the site", function (ok) { if (ok) setDirty(false); });
  }
  if (window.GHSync && GHSync.connected()) {
    if (isDirty()) persist();
    else GHSync.read("plan-data.js").then(function (t) { var d = t && GHSync.evalData(t, "PLAN_DATA"); if (d && d.events && !isDirty()) { state = d; if (host && /plan|bucket/.test(location.hash)) render(host, page); } });
  }
  var ui = { sub: "year", cats: {}, people: "all", ideas: true };
  Object.keys(CATS).forEach(function (k) { ui.cats[k] = true; });
  var host = null, page = "plan";

  // ---------- helpers ----------
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function d(s) { var p = s.split("-"); return new Date(Date.UTC(+p[0], +p[1] - 1, +p[2])); }
  function fmt(s) { var x = d(s); return MONTHS[x.getUTCMonth()].slice(0, 3) + " " + x.getUTCDate(); }
  function range(e) { if (!e.start) return "Date TBD"; if (!e.end || e.end === e.start) return fmt(e.start); var a = d(e.start), b = d(e.end); return a.getUTCMonth() === b.getUTCMonth() ? fmt(e.start) + "–" + b.getUTCDate() : fmt(e.start) + " – " + fmt(e.end); }
  function evMonth(e) { return e.start ? d(e.start).getUTCMonth() : (e.month || 1) - 1; }
  function covers(e, dt) { if (!e.start) return false; return dt >= d(e.start) && dt <= d(e.end || e.start); }
  function visible(e) { return ui.cats[e.cat] && (ui.ideas || e.status !== "idea") && (ui.people === "all" || (e.with || []).indexOf(ui.people) >= 0); }
  function key(e) { return e.start || (YEAR + "-" + String(e.month || 1).padStart(2, "0") + "-32"); }
  function sorted(l) { return l.slice().sort(function (a, b) { return key(a) < key(b) ? -1 : key(a) > key(b) ? 1 : 0; }); }
  function overlaps(e) {
    if (!e.start || e.cat === "pro") return [];
    return state.events.filter(function (o) {
      if (o.id === e.id || !o.start || o.cat === "pro") return false;
      var a = d(e.start), b = d(e.end || e.start), c = d(o.start), f = d(o.end || o.start);
      if (!(a <= f && c <= b)) return false;
      if (e.cat === "personal" && o.cat === "personal") return false;
      if (o.cat === "block" || e.cat === "block") return e.cat !== o.cat;
      if (o.cat === "personal" || e.cat === "personal") return false;
      return (o.status !== "idea" && e.status !== "idea") || o.cat === "tournament" || e.cat === "tournament";
    });
  }
  function ppl(e) { return (e.with || []).map(function (p) { return '<span class="pl-pp ' + esc(p) + '">' + esc(p) + "</span>"; }).join(""); }
  function slug(s) { return String(s || "").toLowerCase().replace(/\b(the|golf|country|club|links|of|course|cc|gc)\b/g, "").replace(/[^a-z0-9]+/g, ""); }
  function playedSet() {
    var rounds = [];
    try { var raw = localStorage.getItem(ROUNDS_LS); if (raw) rounds = JSON.parse(raw); } catch (e) {}
    if (!rounds.length && typeof ROUNDS !== "undefined") rounds = ROUNDS;
    var out = rounds.filter(function (r) { return r.status === "played"; }).map(function (r) { return slug(r.course); });
    if (window.LedgerApp) out = out.concat(window.LedgerApp.playedNames().map(slug));
    return out.filter(Boolean);
  }
  function isPlayed(b, set) { var s = slug(b.name.replace(/\(.*?\)/g, "")); return s && set.some(function (x) { return x === s || x.indexOf(s) === 0 || s.indexOf(x) === 0; }); }

  // ---------- render ----------
  function render(el, which) {
    host = el; page = which;
    var h = '<div class="pl-top"><div><div class="page-title">' + (which === "bucket" ? "Bucket List" : "2027 Plan") + '</div><div class="page-sub">' +
      (which === "bucket" ? "Courses to chase in 2027 — by rater region, with who to bring. Anything marked played in your Ledger or logged as a round shows as played." : "Trips, rater rounds and the big events, with conferences blocked off. Click anything to edit.") +
      '</div></div><div class="pl-actions">' + (window.GHSync && GHSync.connected() ? "" : '<button class="btn btn-ghost btn-sm" data-pl="export">Copy plan-data.js</button><button class="btn btn-ghost btn-sm" data-pl="reset">Reload from file</button>') +
      '<button class="btn btn-primary btn-sm" data-pl="' + (which === "bucket" ? "addb" : "add") + '">' + (which === "bucket" ? "+ Course" : "+ Event") + "</button></div></div>";
    if (which === "bucket") h += bucket();
    else {
      h += '<div class="pl-sub"><button data-sub="year" class="' + (ui.sub === "year" ? "on" : "") + '">Year at a glance</button><button data-sub="list" class="' + (ui.sub === "list" ? "on" : "") + '">Timeline</button></div>';
      h += '<div class="pl-filters"><span class="pl-flabel">Show</span>' + Object.keys(CATS).map(function (k) { return '<span class="pl-chip ' + (ui.cats[k] ? "" : "off") + '" data-cat="' + k + '"><span class="pl-dot" style="background:' + CATS[k].c + '"></span>' + CATS[k].label + "</span>"; }).join("") +
        '<span class="pl-flabel">With</span>' + ["all"].concat(PEOPLE).map(function (p) { return '<span class="pl-chip ' + (ui.people === p ? "" : "off") + '" data-person="' + p + '">' + (p === "all" ? "Anyone" : p) + "</span>"; }).join("") +
        '<span class="pl-chip ' + (ui.ideas ? "" : "off") + '" data-pl="ideas">Include ideas</span></div>';
      h += '<div class="pl-legend"><span>Solid = planned / confirmed</span><span>Dashed or faded = idea</span><span>White dot = more than one thing that day</span></div>';
      h += ui.sub === "year" ? year() : timeline();
    }
    el.innerHTML = h;
  }
  function year() {
    var h = '<div class="pl-grid">';
    for (var m = 0; m < 12; m++) {
      var evs = sorted(state.events.filter(function (e) { return evMonth(e) === m && visible(e); }));
      var spill = sorted(state.events.filter(function (e) { return e.start && visible(e) && evMonth(e) < m && d(e.end || e.start).getUTCMonth() >= m; }));
      h += '<div class="pl-month"><h3>' + MONTHS[m] + "<small>" + (evs.length ? evs.length + " item" + (evs.length > 1 ? "s" : "") : "") + '</small></h3><div class="pl-cal">';
      ["S", "M", "T", "W", "T", "F", "S"].forEach(function (x) { h += '<div class="pl-dow">' + x + "</div>"; });
      var first = new Date(Date.UTC(YEAR, m, 1)), days = new Date(Date.UTC(YEAR, m + 1, 0)).getUTCDate();
      for (var i = 0; i < first.getUTCDay(); i++) h += '<div class="pl-day empty"></div>';
      for (var dd = 1; dd <= days; dd++) {
        var dt = new Date(Date.UTC(YEAR, m, dd)), wk = dt.getUTCDay() % 6 === 0;
        var on = state.events.filter(function (e) { return visible(e) && covers(e, dt); });
        on.sort(function (a, b) { var sa = a.status === "idea" ? 1 : 0, sb = b.status === "idea" ? 1 : 0; return sa - sb || PRI.indexOf(a.cat) - PRI.indexOf(b.cat); });
        if (on.length) {
          var top = on[0], idea = top.status === "idea";
          h += '<div class="pl-day has' + (idea ? " idea" : "") + '" style="background:' + (idea ? "color-mix(in srgb," + CATS[top.cat].c + " 30%, #fff)" : CATS[top.cat].c) + '" title="' + esc(on.map(function (e) { return e.title; }).join(" · ")) + '">' + dd + (on.length > 1 ? '<span class="more"></span>' : "") + "</div>";
        } else h += '<div class="pl-day' + (wk ? " wk" : "") + '">' + dd + "</div>";
      }
      h += '</div><div class="pl-evs">';
      if (!evs.length && !spill.length) h += '<div class="pl-empty">Open month — room for rater rounds.</div>';
      spill.forEach(function (e) { h += row(e, true); });
      evs.forEach(function (e) { h += row(e, false); });
      h += "</div></div>";
    }
    return h + "</div>";
  }
  function row(e, cont) {
    var ov = cont ? [] : overlaps(e);
    return '<div class="pl-ev' + (e.status === "idea" ? " idea" : "") + '" style="--c:' + CATS[e.cat].c + '" data-ev="' + e.id + '"><div class="d">' + (cont ? "cont." : esc(range(e))) + '</div><div class="t"><b>' + esc(e.title) + "</b>" + ppl(e) +
      (e.status !== "confirmed" && e.status !== "planned" ? '<span class="pl-badge">' + STAT[e.status] + "</span>" : "") +
      (ov.length ? '<div class="pl-warn">⚠ overlaps ' + esc(ov.map(function (o) { return o.title; }).join(", ")) + "</div>" : "") + "</div></div>";
  }
  function timeline() {
    var h = "", list = sorted(state.events.filter(visible));
    for (var m = 0; m < 12; m++) {
      var evs = list.filter(function (e) { return evMonth(e) === m; });
      if (!evs.length) continue;
      h += '<div class="pl-tlm"><h3>' + MONTHS[m] + "</h3>";
      evs.forEach(function (e) {
        var ov = overlaps(e);
        h += '<div class="pl-tli' + (e.status === "idea" ? " idea" : "") + '" style="--c:' + CATS[e.cat].c + '" data-ev="' + e.id + '"><div class="tt">' + esc(e.title) + ppl(e) + '</div><div class="mm">' + esc(range(e)) + (e.loc ? " · " + esc(e.loc) : "") + " · " + CATS[e.cat].label + " · " + STAT[e.status] + "</div>" +
          (ov.length ? '<div class="pl-warn">⚠ overlaps ' + esc(ov.map(function (o) { return o.title; }).join(", ")) + "</div>" : "") +
          (e.notes ? '<div class="nn">' + esc(e.notes) + "</div>" : "") + "</div>";
      });
      h += "</div>";
    }
    return h || '<div class="pl-empty">Nothing matches these filters.</div>';
  }
  function bucket() {
    var set = playedSet();
    var eff = state.bucket.map(function (b) { return Object.assign({}, b, { status: isPlayed(b, set) ? "played" : b.status }); });
    var c = { want: 0, requested: 0, booked: 0, played: 0 }; eff.forEach(function (b) { c[b.status] = (c[b.status] || 0) + 1; });
    var h = '<div class="pl-filters"><span class="pl-flabel">Status</span><span class="pl-st want">' + c.want + ' want</span><span class="pl-st requested">' + c.requested + ' requested</span><span class="pl-st booked">' + c.booked + ' booked</span><span class="pl-st played">' + c.played + ' played</span><span class="pl-flabel">Tag</span><span class="pl-tag">Macdonald/Raynor — Deepdale research</span></div>';
    var regs = REGIONS.slice(); eff.forEach(function (b) { if (regs.indexOf(b.region) < 0) regs.push(b.region); });
    regs.forEach(function (r) {
      var items = eff.filter(function (b) { return b.region === r; }); if (!items.length) return;
      h += '<div class="pl-region"><h3>' + esc(r) + "</h3><p>" + esc(REGION_NOTE[r] || "") + '</p><div class="pl-bgrid">';
      items.forEach(function (b) {
        h += '<div class="pl-bk" data-bk="' + b.id + '"><div style="display:flex;justify-content:space-between;gap:6px;align-items:flex-start"><span class="n">' + esc(b.name) + '</span><span class="pl-st ' + b.status + '">' + b.status + "</span></div>" +
          '<div class="m">' + esc(b.loc) + (b.arch ? " · " + esc(b.arch) : "") + "</div>" +
          '<div class="m">Best window: ' + esc(b.window || "—") + (b.who ? ' · bring <span class="pl-pp ' + esc(b.who) + '">' + esc(b.who) + "</span>" : "") + "</div>" +
          (b.deepdale ? '<div><span class="pl-tag">Deepdale research</span></div>' : "") +
          (b.notes ? '<div class="x">' + esc(b.notes) + "</div>" : "") + "</div>";
      });
      h += "</div></div>";
    });
    return h;
  }

  // ---------- modals ----------
  function closeModal() { var s = document.querySelector(".pl-scrim"); if (s) s.remove(); }
  function modal(html) { closeModal(); var s = document.createElement("div"); s.className = "pl-scrim"; s.innerHTML = '<div class="pl-modal">' + html + "</div>"; s.addEventListener("mousedown", function (ev) { if (ev.target === s) closeModal(); }); document.body.appendChild(s); return s; }
  function opt(map, val) { return Object.keys(map).map(function (k) { return '<option value="' + k + '"' + (k === val ? " selected" : "") + ">" + (map[k].label || map[k]) + "</option>"; }).join(""); }
  function q(s, sel) { return s.querySelector(sel); }
  function delBtn(btn, fn) { btn.onclick = function () { if (btn.dataset.sure) fn(); else { btn.dataset.sure = "1"; btn.textContent = "Click again to delete"; } }; }
  function editEvent(id) {
    var e = state.events.find(function (x) { return x.id === id; }) || { id: "e" + Date.now(), title: "", cat: "rater", status: "idea", start: "", end: "", loc: "", with: [], notes: "" };
    var isNew = !state.events.some(function (x) { return x.id === e.id; });
    var others = (e.with || []).filter(function (p) { return PEOPLE.indexOf(p) < 0; }).join(", ");
    var s = modal("<h3>" + (isNew ? "Add event" : "Edit event") + "</h3>" +
      '<div class="pl-fld"><label>Title</label><input id="pf-title" value="' + esc(e.title) + '"></div>' +
      '<div class="pl-row"><div class="pl-fld"><label>Type</label><select id="pf-cat">' + opt(CATS, e.cat) + '</select></div><div class="pl-fld"><label>Status</label><select id="pf-status">' + opt(STAT, e.status) + "</select></div></div>" +
      '<div class="pl-row"><div class="pl-fld"><label>Start</label><input type="date" id="pf-start" value="' + esc(e.start || "") + '"></div><div class="pl-fld"><label>End</label><input type="date" id="pf-end" value="' + esc(e.end || "") + '"></div></div>' +
      '<div class="pl-fld"><label>…or month only (if dates are TBD)</label><select id="pf-month"><option value="">—</option>' + MONTHS.map(function (m, i) { return '<option value="' + (i + 1) + '"' + (e.month === i + 1 && !e.start ? " selected" : "") + ">" + m + "</option>"; }).join("") + "</select></div>" +
      '<div class="pl-fld"><label>Where</label><input id="pf-loc" value="' + esc(e.loc || "") + '"></div>' +
      '<div class="pl-fld"><label>Who\'s coming</label><div class="pl-checks">' + PEOPLE.map(function (p) { return '<label><input type="checkbox" data-p="' + p + '"' + ((e.with || []).indexOf(p) >= 0 ? " checked" : "") + "> " + p + "</label>"; }).join("") +
      '<input id="pf-others" placeholder="Others, comma-separated" value="' + esc(others) + '" style="flex:1;min-width:150px;border:1px solid var(--line);border-radius:8px;padding:5px 8px;font:inherit;font-size:13px"></div></div>' +
      '<div class="pl-fld"><label>Notes / course ideas</label><textarea id="pf-notes">' + esc(e.notes || "") + "</textarea></div>" +
      '<div class="pl-foot"><div>' + (isNew ? "" : '<button class="btn btn-danger btn-sm" id="pf-del">Delete</button>') + '</div><div style="display:flex;gap:8px"><button class="btn btn-ghost btn-sm" id="pf-cancel">Cancel</button><button class="btn btn-primary btn-sm" id="pf-save">Save</button></div></div>');
    q(s, "#pf-cancel").onclick = closeModal;
    if (!isNew) delBtn(q(s, "#pf-del"), function () { state.events = state.events.filter(function (x) { return x.id !== e.id; }); closeModal(); changed(); });
    q(s, "#pf-save").onclick = function () {
      var t = q(s, "#pf-title").value.trim(); if (!t) { q(s, "#pf-title").focus(); return; }
      var st = q(s, "#pf-start").value, en = q(s, "#pf-end").value, mo = q(s, "#pf-month").value;
      if (st && en && en < st) { var tmp = st; st = en; en = tmp; }
      if (!st && en) st = en;
      var w = []; s.querySelectorAll("[data-p]").forEach(function (c) { if (c.checked) w.push(c.dataset.p); });
      q(s, "#pf-others").value.split(",").forEach(function (x) { x = x.trim(); if (x) w.push(x); });
      var n = { id: e.id, title: t, cat: q(s, "#pf-cat").value, status: q(s, "#pf-status").value, loc: q(s, "#pf-loc").value.trim(), with: w, notes: q(s, "#pf-notes").value };
      if (st) { n.start = st; n.end = en || st; } else n.month = +(mo || e.month || 1);
      var i = state.events.findIndex(function (x) { return x.id === e.id; }); if (i >= 0) state.events[i] = n; else state.events.push(n);
      closeModal(); changed();
    };
    setTimeout(function () { q(s, "#pf-title").focus(); }, 30);
  }
  function editBucket(id) {
    var b = state.bucket.find(function (x) { return x.id === id; }) || { id: "b" + Date.now(), name: "", loc: "", region: "Midwest Central", arch: "", window: "", who: "", status: "want", deepdale: false, notes: "" };
    var isNew = !state.bucket.some(function (x) { return x.id === b.id; });
    var regs = REGIONS.slice(); state.bucket.forEach(function (x) { if (regs.indexOf(x.region) < 0) regs.push(x.region); });
    var s = modal("<h3>" + (isNew ? "Add course" : "Edit course") + "</h3>" +
      '<div class="pl-fld"><label>Course</label><input id="pb-name" value="' + esc(b.name) + '"></div>' +
      '<div class="pl-row"><div class="pl-fld"><label>Location</label><input id="pb-loc" value="' + esc(b.loc) + '"></div><div class="pl-fld"><label>Region</label><select id="pb-region">' + regs.map(function (r) { return "<option" + (r === b.region ? " selected" : "") + ">" + esc(r) + "</option>"; }).join("") + "</select></div></div>" +
      '<div class="pl-row"><div class="pl-fld"><label>Architect</label><input id="pb-arch" value="' + esc(b.arch) + '"></div><div class="pl-fld"><label>Best window</label><input id="pb-window" value="' + esc(b.window) + '"></div></div>' +
      '<div class="pl-row"><div class="pl-fld"><label>Status</label><select id="pb-status">' + ["want", "requested", "booked", "played"].map(function (x) { return "<option" + (x === b.status ? " selected" : "") + ">" + x + "</option>"; }).join("") + '</select></div><div class="pl-fld"><label>Bring</label><select id="pb-who"><option value="">—</option>' + PEOPLE.map(function (p) { return "<option" + (p === b.who ? " selected" : "") + ">" + p + "</option>"; }).join("") + "</select></div></div>" +
      '<div class="pl-fld"><div class="pl-checks"><label><input type="checkbox" id="pb-dd"' + (b.deepdale ? " checked" : "") + "> Macdonald/Raynor — Deepdale research</label></div></div>" +
      '<div class="pl-fld"><label>Notes</label><textarea id="pb-notes" style="min-height:70px">' + esc(b.notes) + "</textarea></div>" +
      '<div class="pl-foot"><div>' + (isNew ? "" : '<button class="btn btn-danger btn-sm" id="pb-del">Delete</button>') + '</div><div style="display:flex;gap:8px"><button class="btn btn-ghost btn-sm" id="pb-cancel">Cancel</button><button class="btn btn-primary btn-sm" id="pb-save">Save</button></div></div>');
    q(s, "#pb-cancel").onclick = closeModal;
    if (!isNew) delBtn(q(s, "#pb-del"), function () { state.bucket = state.bucket.filter(function (x) { return x.id !== b.id; }); closeModal(); changed(); });
    q(s, "#pb-save").onclick = function () {
      var n = q(s, "#pb-name").value.trim(); if (!n) { q(s, "#pb-name").focus(); return; }
      var nb = { id: b.id, name: n, loc: q(s, "#pb-loc").value.trim(), region: q(s, "#pb-region").value, arch: q(s, "#pb-arch").value.trim(), window: q(s, "#pb-window").value.trim(), who: q(s, "#pb-who").value, status: q(s, "#pb-status").value, deepdale: q(s, "#pb-dd").checked, notes: q(s, "#pb-notes").value };
      var i = state.bucket.findIndex(function (x) { return x.id === b.id; }); if (i >= 0) state.bucket[i] = nb; else state.bucket.push(nb);
      closeModal(); changed();
    };
  }
  function changed() { persist(); if (host) render(host, page); }
  function toast(msg) { var t = document.getElementById("toast"); if (!t) return; t.textContent = msg; t.style.display = "block"; clearTimeout(t._h); t._h = setTimeout(function () { t.style.display = "none"; }, 2200); }
  function exportFile() {
    var file = "// 2027 GOLF PLAN DATA — paste this whole file over plan-data.js in GitHub\n\nconst PLAN_DATA = " + JSON.stringify(state, null, 1) + ";\n";
    var done = function () { toast("Copied — paste over plan-data.js in GitHub"); };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(file).then(done, fallback); else fallback();
    function fallback() { var ta = document.createElement("textarea"); ta.value = file; document.body.appendChild(ta); ta.select(); try { document.execCommand("copy"); } catch (e) {} document.body.removeChild(ta); done(); }
  }

  // ---------- events ----------
  document.addEventListener("click", function (ev) {
    if (!host || !host.contains(ev.target)) return;
    var t = ev.target.closest("[data-sub],[data-cat],[data-person],[data-pl],[data-ev],[data-bk]"); if (!t) return;
    if (t.dataset.sub) { ui.sub = t.dataset.sub; render(host, page); }
    else if (t.dataset.cat) { ui.cats[t.dataset.cat] = !ui.cats[t.dataset.cat]; render(host, page); }
    else if (t.dataset.person) { ui.people = t.dataset.person; render(host, page); }
    else if (t.dataset.pl === "ideas") { ui.ideas = !ui.ideas; render(host, page); }
    else if (t.dataset.pl === "add") editEvent(null);
    else if (t.dataset.pl === "addb") editBucket(null);
    else if (t.dataset.pl === "export") exportFile();
    else if (t.dataset.pl === "reset") { if (confirm("Discard plan edits on this device and reload from plan-data.js?")) { try { localStorage.removeItem(LS_KEY); } catch (e) {} state = seed(); render(host, page); toast("Reloaded from plan-data.js"); } }
    else if (t.dataset.ev) editEvent(t.dataset.ev);
    else if (t.dataset.bk) editBucket(t.dataset.bk);
  });
  document.addEventListener("keydown", function (ev) { if (ev.key === "Escape") closeModal(); });

  window.PlanApp = { render: render };
})();
