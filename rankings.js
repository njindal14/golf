// Rankings tab — every Ledger course with its Top100 state / USA / World rank, plus Nick's own rankings.
(function () {
  // Size of each Top100 list (Nov 2026), for progress bars.
  var LIST_SIZE = { USA: 100, World: 100, OH: 74, NY: 100, CT: 40, NJ: 75, PA: 60, IN: 40, MA: 60, RI: 15, FL: 100, SC: 85, CA: 100, ME: 20, IL: 70, MI: 72, WI: 40, NC: 101 };
  var STATE_NAMES = { CT: "Connecticut", NY: "New York", NJ: "New Jersey", PA: "Pennsylvania", OH: "Ohio", IN: "Indiana", CA: "California", SC: "South Carolina", FL: "Florida", ME: "Maine", DR: "Dominican Republic", RI: "Rhode Island", MA: "Massachusetts", MI: "Michigan", IL: "Illinois", WI: "Wisconsin", NC: "North Carolina" };
  var CSS = "" +
    ".rk-prog{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:10px;margin-bottom:20px}" +
    ".rk-pc{background:var(--surface);border:1px solid var(--line);border-radius:12px;padding:12px 14px;cursor:pointer;box-shadow:var(--shadow);transition:border-color .15s}" +
    ".rk-pc:hover,.rk-pc.on{border-color:var(--green)}.rk-pc .l{font-size:11px;font-weight:700;color:var(--muted);text-transform:uppercase;letter-spacing:.05em}" +
    ".rk-pc .v{font-size:22px;font-weight:800;letter-spacing:-.02em;margin:2px 0 6px}.rk-pc .v small{font-size:13px;color:var(--faint);font-weight:600}" +
    ".rk-bar{height:5px;background:var(--line);border-radius:3px;overflow:hidden}.rk-bar i{display:block;height:100%;background:var(--green)}" +
    ".rk-tools{display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin-bottom:12px}" +
    ".rk-tools input[type=search]{flex:1 1 200px;font:inherit;font-size:14px;border:1px solid var(--line);border-radius:8px;padding:8px 10px;background:var(--surface)}" +
    ".rk-seg{display:inline-flex;border:1px solid var(--line);border-radius:8px;overflow:hidden}.rk-seg button{font:600 12.5px inherit;font-family:inherit;background:var(--surface);color:var(--muted);border:0;padding:7px 11px;cursor:pointer}.rk-seg button+button{border-left:1px solid var(--line)}.rk-seg button.on{background:var(--green);color:#fff}" +
    ".rk-wrap{overflow-x:auto;background:var(--surface);border:1px solid var(--line);border-radius:12px;box-shadow:var(--shadow)}" +
    ".rk-t{width:100%;border-collapse:collapse;font-size:13.5px;min-width:720px}" +
    ".rk-t th{text-align:left;font-size:11px;text-transform:uppercase;letter-spacing:.05em;color:var(--muted);padding:10px 10px;border-bottom:1px solid var(--line);cursor:pointer;white-space:nowrap;user-select:none;background:#FAFBF9}" +
    ".rk-t th.num,.rk-t td.num{text-align:center}.rk-t th .ar{color:var(--green)}" +
    ".rk-t td{padding:9px 10px;border-bottom:1px solid var(--line);vertical-align:middle}.rk-t tr:last-child td{border-bottom:0}.rk-t tr:hover td{background:#FAFBF9}" +
    ".rk-name{font-weight:600}.rk-name a{color:inherit}.rk-sub{font-size:12px;color:var(--muted)}" +
    ".rk-pill{display:inline-block;min-width:34px;font-weight:700;font-size:12.5px;padding:2px 7px;border-radius:99px;font-variant-numeric:tabular-nums}" +
    ".rk-pill.s{background:var(--green-soft);color:var(--green)}.rk-pill.u{background:#E3EBF5;color:#264d77}.rk-pill.w{background:#1f3a2b;color:#fff}.rk-dash{color:var(--faint)}" +
    ".rk-my{width:54px;font:inherit;font-size:13px;text-align:center;border:1px solid var(--line);border-radius:6px;padding:4px;background:#fff}" +
    ".rk-my:focus{border-color:var(--green);outline:none}" +
    ".rk-x{font-size:11px;color:var(--faint);text-decoration:none;margin-left:6px}.rk-unp td{opacity:.55}" +
    ".rk-empty{padding:30px;text-align:center;color:var(--muted)}";
  var st = document.createElement("style"); st.textContent = CSS; document.head.appendChild(st);

  var ui = { scope: "all", show: "played", q: "", sort: null, dir: 1 };
  try { var v = JSON.parse(localStorage.getItem("golf-rank-view") || "{}"); Object.assign(ui, v, { q: "" }); } catch (e) {}
  function saveView() { try { localStorage.setItem("golf-rank-view", JSON.stringify({ scope: ui.scope, show: ui.show, sort: ui.sort, dir: ui.dir })); } catch (e) {} }
  var host = null;
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function fmtDate(d) { if (!d) return ""; var p = d.split("-"); if (p.length < 3) return d; return new Date(+p[0], +p[1] - 1, +p[2]).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }); }
  function courses() { return window.LedgerApp ? LedgerApp.courses() : []; }

  function inScope(c) {
    if (ui.scope === "all") return true;
    if (ui.scope === "USA") return !!c.t100USA;
    if (ui.scope === "World") return !!c.t100World;
    return c.state === ui.scope && !!c.t100State;
  }
  function defaultSort() { return ui.scope === "USA" ? "t100USA" : ui.scope === "World" ? "t100World" : ui.scope === "all" ? "best" : "t100State"; }
  function bestKey(c) { return c.t100World ? c.t100World : c.t100USA ? 100 + c.t100USA : c.t100State ? 1000 + c.t100State : 99999; }
  function val(c, k) {
    if (k === "best") return bestKey(c);
    if (k === "name") return c.name.toLowerCase();
    if (k === "state") return c.state + (c.t100State ? String(1000 + c.t100State) : "9999");
    if (k === "arch") return (c.architects[0] || "zzz").toLowerCase();
    if (k === "datePlayed") return c.datePlayed || (c.playedYear ? c.playedYear + "-00-00" : "");
    var x = c[k]; return x == null || x === "" ? null : +x;
  }

  function progress() {
    var played = courses().filter(function (c) { return c.played; });
    var cards = [["USA", "USA Top 100", played.filter(function (c) { return c.t100USA; }).length], ["World", "World Top 100", played.filter(function (c) { return c.t100World; }).length]];
    var byState = {};
    played.forEach(function (c) { if (c.t100State && LIST_SIZE[c.state]) byState[c.state] = (byState[c.state] || 0) + 1; });
    Object.keys(byState).sort(function (a, b) { return byState[b] - byState[a]; }).forEach(function (s) { cards.push([s, STATE_NAMES[s] || s, byState[s]]); });
    return '<div class="rk-prog">' + '<div class="rk-pc ' + (ui.scope === "all" ? "on" : "") + '" data-rkscope="all"><div class="l">Everything</div><div class="v">' + played.length + ' <small>played</small></div><div class="rk-bar"><i style="width:' + Math.round(100 * played.length / Math.max(1, courses().length)) + '%"></i></div></div>' +
      cards.map(function (c) { var tot = LIST_SIZE[c[0]] || 100; return '<div class="rk-pc ' + (ui.scope === c[0] ? "on" : "") + '" data-rkscope="' + c[0] + '"><div class="l">' + esc(c[1]) + '</div><div class="v">' + c[2] + " <small>/ " + tot + '</small></div><div class="rk-bar"><i style="width:' + Math.round(100 * c[2] / tot) + '%"></i></div></div>'; }).join("") + "</div>";
  }
  function pill(v, cls) { return v ? '<span class="rk-pill ' + cls + '">#' + v + "</span>" : '<span class="rk-dash">—</span>'; }
  function table() {
    var q = ui.q.trim().toLowerCase();
    var list = courses().filter(function (c) {
      if (ui.show === "played" && !c.played) return false;
      if (!inScope(c)) return false;
      if (q && (c.name + " " + c.town + " " + c.state + " " + c.architects.join(" ")).toLowerCase().indexOf(q) < 0) return false;
      return true;
    });
    var k = ui.sort || defaultSort(), d = ui.dir;
    list.sort(function (a, b) {
      var x = val(a, k), y = val(b, k);
      if (x === null && y === null) return a.name.localeCompare(b.name);
      if (x === null) return 1; if (y === null) return -1;
      return (x < y ? -1 : x > y ? 1 : 0) * d || a.name.localeCompare(b.name);
    });
    if (!list.length) return '<div class="rk-wrap"><div class="rk-empty">Nothing here yet' + (ui.show === "played" ? ' — try “All courses”.' : ".") + "</div></div>";
    function th(key, label, cls) { var on = (ui.sort || defaultSort()) === key; return '<th class="' + (cls || "") + '" data-rksort="' + key + '">' + label + (on ? ' <span class="ar">' + (ui.dir > 0 ? "▲" : "▼") + "</span>" : "") + "</th>"; }
    return '<div class="rk-wrap"><table class="rk-t"><thead><tr>' +
      th("myState", "My state #", "num") + th("myUSA", "My overall #", "num") + th("name", "Course") + th("state", "State") + th("datePlayed", "Played") +
      th("t100State", "Top100 state", "num") + th("t100USA", "USA", "num") + th("t100World", "World", "num") +
      "</tr></thead><tbody>" +
      list.map(function (c) {
        var link = c.t100Slug ? '<a class="rk-x" href="https://www.top100golfcourses.com/golf-course/' + esc(c.t100Slug) + '" target="_blank" rel="noopener" title="Top100 page">↗</a>' : "";
        return '<tr class="' + (c.played ? "" : "rk-unp") + '">' +
          '<td class="num"><input class="rk-my" type="number" min="1" inputmode="numeric" data-rkmy="myState" data-id="' + esc(c.id) + '" value="' + esc(c.myState == null ? "" : c.myState) + '" placeholder="–"></td>' +
          '<td class="num"><input class="rk-my" type="number" min="1" inputmode="numeric" data-rkmy="myUSA" data-id="' + esc(c.id) + '" value="' + esc(c.myUSA == null ? "" : c.myUSA) + '" placeholder="–"></td>' +
          '<td><div class="rk-name">' + esc(c.name) + link + '</div><div class="rk-sub">' + esc(c.architects.join(" & ") || "") + "</div></td>" +
          "<td>" + esc(c.state) + "</td>" +
          '<td class="rk-sub">' + esc(c.played ? (fmtDate(c.datePlayed) || c.playedYear || "✓") : "not yet") + "</td>" +
          '<td class="num">' + pill(c.t100State, "s") + '</td><td class="num">' + pill(c.t100USA, "u") + '</td><td class="num">' + pill(c.t100World, "w") + "</td></tr>";
      }).join("") + "</tbody></table></div>";
  }
  function render(el) {
    host = el;
    var scopeLabel = ui.scope === "all" ? "all courses" : ui.scope === "USA" ? "the USA Top 100" : ui.scope === "World" ? "the World Top 100" : (STATE_NAMES[ui.scope] || ui.scope) + "'s Top100 list";
    el.innerHTML = '<div class="page-title">Rankings</div>' +
      '<div class="page-sub">Top100 Golf Courses rankings (state, USA, World) next to your own. Type your ranks in the first two columns — they save automatically. Showing ' + esc(scopeLabel) + ".</div>" +
      progress() +
      '<div class="rk-tools"><input type="search" id="rk-q" placeholder="Search course or architect" value="' + esc(ui.q) + '">' +
      '<div class="rk-seg"><button data-rkshow="played" class="' + (ui.show === "played" ? "on" : "") + '">Played</button><button data-rkshow="all" class="' + (ui.show === "all" ? "on" : "") + '">All courses</button></div></div>' +
      '<div id="rk-table">' + table() + "</div>";
  }
  function redraw() { var t = document.getElementById("rk-table"); if (t) t.innerHTML = table(); }

  document.addEventListener("click", function (e) {
    if (!host || !host.contains(e.target)) return;
    var t = e.target.closest("[data-rkscope],[data-rkshow],[data-rksort]"); if (!t) return;
    if (t.dataset.rkscope) { ui.scope = t.dataset.rkscope; ui.sort = null; ui.dir = 1; saveView(); render(host); }
    else if (t.dataset.rkshow) { ui.show = t.dataset.rkshow; saveView(); render(host); }
    else if (t.dataset.rksort) { var k = t.dataset.rksort; if ((ui.sort || defaultSort()) === k) ui.dir = -ui.dir; else { ui.sort = k; ui.dir = 1; } saveView(); redraw(); }
  });
  document.addEventListener("input", function (e) {
    if (!host || !host.contains(e.target)) return;
    if (e.target.id === "rk-q") { ui.q = e.target.value; redraw(); }
  });
  document.addEventListener("change", function (e) {
    var t = e.target; if (!host || !host.contains(t) || !t.dataset.rkmy) return;
    var n = parseInt(t.value, 10); var patch = {}; patch[t.dataset.rkmy] = isNaN(n) ? null : n;
    if (window.LedgerApp) LedgerApp.update(t.dataset.id, patch);
  });
  if (window.LedgerApp && LedgerApp.onChange) LedgerApp.onChange(function () { if (host && /rankings/.test(location.hash)) render(host); });

  window.RankingsApp = { render: render };
})();
