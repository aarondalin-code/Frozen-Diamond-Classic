(async function () {
  async function fetchCsv(url) {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) throw new Error(`Failed to fetch CSV (${res.status})`);
    return await res.text();
  }

  function parseCsv(text) {
    const rows = [];
    let row = [], cell = "", inQuotes = false;

    for (let i = 0; i < text.length; i++) {
      const c = text[i], n = text[i + 1];

      if (c === '"' && inQuotes && n === '"') { cell += '"'; i++; continue; }
      if (c === '"') { inQuotes = !inQuotes; continue; }

      if (c === ',' && !inQuotes) { row.push(cell); cell = ""; continue; }

      if ((c === '\n' || c === '\r') && !inQuotes) {
        // skip empty line fragments caused by \r\n handling
        if (c === '\r' && n === '\n') continue;
        if (cell.length || row.length) { row.push(cell); rows.push(row); }
        row = []; cell = "";
        continue;
      }

      cell += c;
    }
    if (cell.length || row.length) { row.push(cell); rows.push(row); }

    const rawHeaders = rows.shift() || [];
    const headers = rawHeaders.map(h => String(h).trim().replace(/\s+/g, ""));

    return rows
      .filter(r => r.some(x => String(x).trim() !== ""))
      .map(r => Object.fromEntries(headers.map((h, i) => [h, String(r[i] ?? "").trim()])));
  }

  function isFinal(status) {
    return String(status || "").trim().toLowerCase() === "final";
  }

  function winnerLoser(game) {
    const a = Number(game.ScoreA);
    const b = Number(game.ScoreB);
    if (!isFinal(game.Status)) return null;
    if (Number.isNaN(a) || Number.isNaN(b)) return null;
    if (a === b) return null;
    return a > b ? { W: game.TeamA, L: game.TeamB } : { W: game.TeamB, L: game.TeamA };
  }

  function resolveTeam(ref, teams, games) {
    if (!ref) return "TBD";
    ref = String(ref).trim().toUpperCase();
    if (!ref) return "TBD";

    const type = ref[0];
    const num = Number(ref.slice(1));
    if (!Number.isFinite(num)) return "TBD";

    if (type === "S") return teams.get(num) || "TBD";

    const g = games.get(num);
    if (!g) return "TBD";

    const result = winnerLoser(g);
    if (!result) return "TBD";

    const nextRef = type === "W" ? result.W : result.L;
    return resolveTeam(nextRef, teams, games);
  }

  const teamsCsv = await fetchCsv(window.SHEET.TEAMS_CSV_URL);
  const gamesCsv = await fetchCsv(window.SHEET.GAMES_CSV_URL);

  const teamRows = parseCsv(teamsCsv);
  const gameRows = parseCsv(gamesCsv);

  const teams = new Map(
    teamRows
      .map(r => [Number(r.Seed), r.TeamName])
      .filter(([s, n]) => Number.isFinite(s) && n)
  );

  const games = new Map(
    gameRows
      .map(r => [Number(r.Game), r])
      .filter(([id]) => Number.isFinite(id))
  );

  const tbody = document.querySelector("#scheduleTable tbody");
  if (!tbody) return;
  tbody.innerHTML = "";

  gameRows.sort((a, b) => Number(a.Game) - Number(b.Game));

  for (const g of gameRows) {
    const tr = document.createElement("tr");

    const teamA = resolveTeam(g.TeamA, teams, games);
    const teamB = resolveTeam(g.TeamB, teams, games);

    const final = isFinal(g.Status);
    const score = (final && g.ScoreA !== "" && g.ScoreB !== "")
      ? `${g.ScoreA}-${g.ScoreB}`
      : "";

    const cells = [
      g.Time || "",
      g.Field || "",
      `Game ${g.Game || ""}`,
      `${teamA} vs ${teamB}`,
      score,
      final ? "Final" : (g.Status || "Scheduled")
    ];

    for (const text of cells) {
      const td = document.createElement("td");
      td.textContent = text;
      tr.appendChild(td);
    }

    tbody.appendChild(tr);
  }
})().catch(err => {
  console.error(err);
  alert("Error loading tournament data. Check Console for details.");
});

