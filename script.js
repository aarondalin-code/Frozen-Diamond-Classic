(async function () {
  const dbgEl = document.getElementById("debug");
  function dbg(msg) {
    if (dbgEl) dbgEl.textContent += msg + "\n";
  }

  dbg("Starting…");

  if (!window.SHEET) {
    dbg("ERROR: window.SHEET is undefined. data.js did not load or has a syntax error.");
    return;
  }

  dbg("SHEET loaded.");
  dbg("Teams URL: " + window.SHEET.TEAMS_CSV_URL);
  dbg("Games URL: " + window.SHEET.GAMES_CSV_URL);

  async function fetchCsv(url) {
    if (!url) throw new Error("Missing CSV URL");
    const bust = (url.includes("?") ? "&" : "?") + "t=" + Date.now();
    const full = url + bust;

    dbg("Fetching: " + full);

    const res = await fetch(full, { cache: "no-store" });
    dbg("HTTP " + res.status + " " + res.statusText);

    if (!res.ok) throw new Error(`Failed to fetch CSV (${res.status})`);
    return await res.text();
  }

  function parseCsv(text) {
    const lines = text.trim().split(/\r?\n/);
    const rows = lines.map(line => line.split(","));
    const headers = (rows.shift() || []).map(h => String(h).trim().replace(/\s+/g, ""));
    return rows
      .filter(r => r.some(x => String(x).trim() !== ""))
      .map(r => Object.fromEntries(headers.map((h, i) => [h, String(r[i] ?? "").trim()])));
  }

  function isFinal(status) {
    return String(status || "").trim().toLowerCase() === "final";
  }

  function winnerLoser(game) {
    if (!isFinal(game.Status)) return null;
    const a = Number(String(game.ScoreA ?? "").trim());
    const b = Number(String(game.ScoreB ?? "").trim());
    if (Number.isNaN(a) || Number.isNaN(b) || a === b) return null;
    return a > b ? { W: game.TeamA, L: game.TeamB } : { W: game.TeamB, L: game.TeamA };
  }

  function resolveTeam(ref, teams, games) {
    if (!ref) return "TBD";
    ref = String(ref).trim().toUpperCase();
    const type = ref[0];
    const num = Number(ref.slice(1));
    if (!Number.isFinite(num)) return "TBD";

    if (type === "S") return teams.get(num) || "TBD";

    const g = games.get(num);
    if (!g) return "TBD";
    const wl = winnerLoser(g);
    if (!wl) return "TBD";

    return resolveTeam(type === "W" ? wl.W : wl.L, teams, games);
  }

  try {
    const teamsCsv = await fetchCsv(window.SHEET.TEAMS_CSV_URL);
    dbg("Teams CSV first line: " + teamsCsv.split(/\r?\n/)[0]);

    const gamesCsv = await fetchCsv(window.SHEET.GAMES_CSV_URL);
    dbg("Games CSV first line: " + gamesCsv.split(/\r?\n/)[0]);

    const teamRows = parseCsv(teamsCsv);
    const gameRows = parseCsv(gamesCsv);

    dbg("Parsed teams rows: " + teamRows.length);
    dbg("Parsed games rows: " + gameRows.length);

    const teams = new Map(teamRows.map(r => [Number(r.Seed), r.TeamName]));
    const games = new Map(gameRows.map(r => [Number(r.Game), r]));

    const tbody = document.querySelector("#scheduleTable tbody");
    tbody.innerHTML = "";

    gameRows.sort((a, b) => Number(a.Game) - Number(b.Game));

    for (const g of gameRows) {
      const teamA = resolveTeam(g.TeamA, teams, games);
      const teamB = resolveTeam(g.TeamB, teams, games);

      const final = isFinal(g.Status);
      const sA = String(g.ScoreA ?? "").trim();
      const sB = String(g.ScoreB ?? "").trim();
      const score = (final && sA !== "" && sB !== "") ? `${sA}-${sB}` : "";

      const tr = document.createElement("tr");
      const cells = [
        g.Time || "",
        g.Field || "",
        `Game ${g.Game || ""}`,
        `${teamA} vs ${teamB}`,
        score,
        final ? "Final" : (String(g.Status || "Scheduled").trim() || "Scheduled"),
      ];

      for (const text of cells) {
        const td = document.createElement("td");
        td.textContent = text;
        tr.appendChild(td);
      }
      tbody.appendChild(tr);
    }

    dbg("Rendered table OK.");
  } catch (err) {
    dbg("ERROR: " + (err && err.message ? err.message : String(err)));
  }
})();



