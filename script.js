(async function () {

  async function fetchCsv(url) {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) throw new Error("Failed to fetch CSV");
    return await res.text();
  }

  function parseCsv(text) {
    const rows = text.trim().split("\n").map(r => r.split(","));
    const headers = rows.shift().map(h => h.trim().replace(/\s+/g, ""));
    return rows.map(row =>
      Object.fromEntries(headers.map((h, i) => [h.trim(), (row[i] || "").trim()]))
    );
  }

  function winnerLoser(game) {
    const a = Number(game.ScoreA);
    const b = Number(game.ScoreB);
    if (game.Status !== "Final") return null;
    if (a === b) return null;
    return a > b
      ? { W: game.TeamA, L: game.TeamB }
      : { W: game.TeamB, L: game.TeamA };
  }

  function resolveTeam(ref, teams, games) {
    if (!ref) return "TBD";

    const type = ref[0];
    const num = Number(ref.slice(1));

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

  const teams = new Map(teamRows.map(r => [Number(r.Seed), r.TeamName]));
  const games = new Map(gameRows.map(r => [Number(r.Game), r]));

  const tbody = document.querySelector("#scheduleTable tbody");
  tbody.innerHTML = "";

  gameRows.sort((a,b) => Number(a.Game) - Number(b.Game));

  for (const g of gameRows) {
    const tr = document.createElement("tr");

    const teamA = resolveTeam(g.TeamA, teams, games);
    const teamB = resolveTeam(g.TeamB, teams, games);

    const score = g.Status === "Final"
      ? `${g.ScoreA}-${g.ScoreB}`
      : "";

    const cells = [
      g.Time,
      g.Field,
      `Game ${g.Game}`,
      `${teamA} vs ${teamB}`,
      score,
      g.Status
    ];

    cells.forEach(text => {
      const td = document.createElement("td");
      td.textContent = text;
      tr.appendChild(td);
    });

    tbody.appendChild(tr);
  }

})();
