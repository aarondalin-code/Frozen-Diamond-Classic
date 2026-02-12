(async function () {
  async function fetchCsv(url) {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) throw new Error(`Failed to fetch CSV (${res.status})`);
    return await res.text();
  }

  function parseCsv(text) {
    // split lines safely for Windows/mac/linux endings
    const lines = text.trim().split(/\r?\n/);

    // split by comma (works for your sheet structure)
    const rows = lines.map(line => line.split(","));

    // normalize headers: trim and remove spaces so "Score B" becomes "ScoreB"
    const headers = (rows.shift() || []).map(h => String(h).trim().replace(/\s+/g, ""));

    return rows
      .filter(r => r.some(x => String(x).trim() !== ""))
      .map(row => Object.fromEntries(headers.map((h, i) => [h, String(row[i] ?? "").trim()])));
  }

  function isFinal(status) {
    return String(status || "").trim().toLowerCase() === "final";
  }

  function winnerLoser(game) {
    if (!isFinal(game.Status)) return null;

    const a = Number(String(game.ScoreA ?? "").trim());
    const b = Number(String(game.ScoreB ?? "").trim());
    if (Number.isNaN(a) || Number.isNaN(b)) return null;
    if (a === b) return null;

    return a > b
      ? { W: game.TeamA, L: game.TeamB }
      : { W: game.TeamB, L: game.TeamA };
  }

  function resolveTeam(ref, teams, games) {
    if (!ref) return "TBD";

    ref = String(ref).trim().toUpperCase(); // <-- this fixes spaces/lowercase
    if (!ref) return "TBD";

    const type = ref[0];
    const num = Number(ref.slice(1));
    if (!Number.isFinite(num)) return "TBD";

    if (type === "S") return teams.get(num) || "TBD";

    const g = games.get(num);
    if (!g) return "TBD";

    const result = winnerLoser(g);
    if (!result) return "TBD";

    return resolveTeam(type === "W" ? result.W : result.L, teams, games);
  }

  const teamsCsv = await fetchCsv(window.SHEET.TEAMS_CSV_URL);
  const gamesCsv = await fetchCsv(window.SHEET.GAMES_CSV_URL);

  const teamRows = parseCsv(teamsCsv);
  const gameRows = parseCsv(gamesCsv);

  const teams = new Map(teamRows.map(r => [Number(r.Seed), r.TeamName]));
  const games = new Map(gameRows.map(r => [Number(r.Game), r]));

  const tbody = document.querySelector("#scheduleTable tbody");
  tbody.innerHTML = "";

  gameRows.sort((a, b) => Number(a.Game) - Number(b.Game));

  for (const g of gameRows) {
    const tr = document.createElement("tr");

    const teamA = resolveTeam(g.TeamA, teams, games);
    const teamB = resolveTeam(g.TeamB, teams, games);

    const final = isFinal(g.Status);
    const sA = String(g.ScoreA ?? "").trim();
    const sB = String(g.ScoreB ?? "").trim();

    const score = (final && sA !== "" && sB !== "") ? `${sA}-${sB}` : "";

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
})().catch(err => {
  console.error(err);
  alert("Error loading tournament data. Open Console for details.");
});


