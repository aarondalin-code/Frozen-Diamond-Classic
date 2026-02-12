(async function () {
  const lastUpdatedEl = document.getElementById("lastUpdated");
  const bracketEl = document.getElementById("bracket");
  const tbody = document.querySelector("#scheduleTable tbody");

  function setLastUpdated() {
    if (lastUpdatedEl) lastUpdatedEl.textContent = `Last updated: ${new Date().toLocaleString()}`;
  }

  function isFinal(status) {
    return String(status || "").trim().toLowerCase() === "final";
  }

  async function fetchCsv(url) {
    if (!url) throw new Error("Missing CSV URL in data.js");
    const bust = (url.includes("?") ? "&" : "?") + "t=" + Date.now();
    const res = await fetch(url + bust, { cache: "no-store" });
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

  function winnerLoser(game) {
    if (!isFinal(game.Status)) return null;

    const aStr = String(game.ScoreA ?? "").trim();
    const bStr = String(game.ScoreB ?? "").trim();
    if (aStr === "" || bStr === "") return null;

    const a = Number(aStr);
    const b = Number(bStr);
    if (Number.isNaN(a) || Number.isNaN(b)) return null;
    if (a === b) return null;

    return a > b ? { W: game.TeamA, L: game.TeamB } : { W: game.TeamB, L: game.TeamA };
  }

  function resolveTeam(ref, teamsBySeed, gamesById) {
    if (!ref) return "TBD";
    ref = String(ref).trim().toUpperCase();
    if (!ref) return "TBD";

    const type = ref[0];
    const num = Number(ref.slice(1));
    if (!Number.isFinite(num)) return "TBD";

    if (type === "S") return teamsBySeed.get(num) || "TBD";

    const g = gamesById.get(num);
    if (!g) return "TBD";

    const wl = winnerLoser(g);
    if (!wl) return "TBD";

    return resolveTeam(type === "W" ? wl.W : wl.L, teamsBySeed, gamesById);
  }

  function gameCardHTML(g, teamsBySeed, gamesById) {
    if (!g) return `<div class="gameCard"><div class="gameTeams">TBD vs TBD</div><div class="gameStatus">Scheduled</div></div>`;

    const teamA = resolveTeam(g.TeamA, teamsBySeed, gamesById);
    const teamB = resolveTeam(g.TeamB, teamsBySeed, gamesById);

    const final = isFinal(g.Status);
    const sA = String(g.ScoreA ?? "").trim();
    const sB = String(g.ScoreB ?? "").trim();
    const score = (final && sA !== "" && sB !== "") ? `${sA}-${sB}` : "";

    return `
      <div class="gameCard">
        <div class="gameMeta">Game ${g.Game} • ${g.Time} • ${g.Field}</div>
        <div class="gameTeams">${teamA} vs ${teamB}${final ? `<span class="finalBadge">FINAL</span>` : ""}</div>
        <div class="gameStatus">${final ? (score ? `Final: ${score}` : "Final") : `Status: ${String(g.Status || "Scheduled").trim() || "Scheduled"}`}</div>
      </div>
    `;
  }

  function renderBracket(gamesById, teamsBySeed) {
    if (!bracketEl) return;

    // Games in your 12-game / 3-games-guaranteed format
    const g1 = gamesById.get(1),  g2 = gamesById.get(2),  g3 = gamesById.get(3),  g4 = gamesById.get(4);
    const g5 = gamesById.get(5),  g6 = gamesById.get(6),  g7 = gamesById.get(7),  g8 = gamesById.get(8);
    const g9 = gamesById.get(9),  g10 = gamesById.get(10), g11 = gamesById.get(11), g12 = gamesById.get(12);

    bracketEl.innerHTML = `
      <div class="bracketSection">
        <h3>Championship Bracket</h3>
        <div class="bracketGrid">
          <div class="col">
            <div class="colTitle">Round 1</div>
            <div class="slot connectorRight">${gameCardHTML(g1, teamsBySeed, gamesById)}</div>
            <div class="slot connectorRight">${gameCardHTML(g2, teamsBySeed, gamesById)}</div>
            <div class="slot connectorRight">${gameCardHTML(g3, teamsBySeed, gamesById)}</div>
            <div class="slot connectorRight">${gameCardHTML(g4, teamsBySeed, gamesById)}</div>
          </div>

          <div class="col">
            <div class="colTitle">Round 2</div>
            <div class="slot connectorMid connectorRight">${gameCardHTML(g5, teamsBySeed, gamesById)}</div>
            <div class="slot connectorMid connectorRight">${gameCardHTML(g6, teamsBySeed, gamesById)}</div>
          </div>

          <div class="col">
            <div class="colTitle">Round 3</div>
            <div class="slot connectorMid">${gameCardHTML(g12, teamsBySeed, gamesById)}</div>
          </div>
        </div>
      </div>

      <div class="bracketSection">
        <h3>Consolation + Placement</h3>
        <div class="bracketGrid">
          <div class="col">
            <div class="colTitle">Round 2 (Losers)</div>
            <div class="slot connectorRight">${gameCardHTML(g7, teamsBySeed, gamesById)}</div>
            <div class="slot connectorRight">${gameCardHTML(g8, teamsBySeed, gamesById)}</div>
          </div>

          <div class="col">
            <div class="colTitle">Round 3 (Placement)</div>
            <div class="slot connectorMid">${gameCardHTML(g9, teamsBySeed, gamesById)}</div>
            <div class="slot connectorMid">${gameCardHTML(g10, teamsBySeed, gamesById)}</div>
          </div>

          <div class="col">
            <div class="colTitle">Round 3 (7th Place)</div>
            <div class="slot connectorMid">${gameCardHTML(g11, teamsBySeed, gamesById)}</div>
          </div>
        </div>
      </div>
    `;
  }

  function renderSchedule(gameRows, teamsBySeed, gamesById) {
    if (!tbody) return;
    tbody.innerHTML = "";

    const sorted = [...gameRows].sort((a, b) => Number(a.Game) - Number(b.Game));

    for (const g of sorted) {
      const teamA = resolveTeam(g.TeamA, teamsBySeed, gamesById);
      const teamB = resolveTeam(g.TeamB, teamsBySeed, gamesById);

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
  }

  async function loadAndRender() {
    const teamsCsv = await fetchCsv(window.SHEET?.TEAMS_CSV_URL);
    const gamesCsv = await fetchCsv(window.SHEET?.GAMES_CSV_URL);

    const teamRows = parseCsv(teamsCsv);
    const gameRows = parseCsv(gamesCsv);

    const teamsBySeed = new Map(
      teamRows.map(r => [Number(r.Seed), r.TeamName]).filter(([s, n]) => Number.isFinite(s) && n)
    );

    const gamesById = new Map(
      gameRows.map(r => [Number(r.Game), r]).filter(([id]) => Number.isFinite(id))
    );

    renderBracket(gamesById, teamsBySeed);
    renderSchedule(gameRows, teamsBySeed, gamesById);
    setLastUpdated();
  }

  // Initial load
  try {
    await loadAndRender();
  } catch (err) {
    console.error(err);
    alert("Error loading tournament data. Check data.js URLs and CSV publishing.");
    return;
  }

  // Auto-refresh every 60s (no page reload)
  setInterval(async () => {
    try {
      await loadAndRender();
    } catch (err) {
      console.error(err);
      // don't alert repeatedly on spectators
    }
  }, 60000);
})();




