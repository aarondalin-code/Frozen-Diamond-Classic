(async function () {
  const lastUpdatedEl = document.getElementById("lastUpdated");
  const bracketEl = document.getElementById("bracket");
  const tbody = document.querySelector("#scheduleTable tbody");

  function setLastUpdated() {
    if (!lastUpdatedEl) return;
    lastUpdatedEl.textContent = `Last updated: ${new Date().toLocaleString()}`;
  }

  function safe(v) {
    return String(v ?? "").trim();
  }

  function isFinal(status) {
    return safe(status).toLowerCase() === "final";
  }

  function teamSlug(name) {
    const n = safe(name);
    if (!n || n === "TBD") return "";
    return n
      .toLowerCase()
      .replace(/&/g, "and")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }

  function teamLinkHTML(name) {
    const n = safe(name);
    if (!n || n === "TBD") return "TBD";
    const slug = teamSlug(n);
    if (!slug) return n;
    return `<a class="teamLinkInline" href="./team.html?team=${encodeURIComponent(slug)}">${n}</a>`;
  }

  async function fetchCsv(url) {
    if (!url) throw new Error("Missing CSV URL in data.js");
    const bust = (url.includes("?") ? "&" : "?") + "t=" + Date.now();
    const res = await fetch(url + bust, { cache: "no-store" });
    if (!res.ok) throw new Error(`Failed to fetch CSV (${res.status})`);
    return await res.text();
  }

  // Robust CSV parser (handles quoted commas)
  function parseCsv(text) {
    const rows = [];
    let row = [];
    let cur = "";
    let inQuotes = false;

    for (let i = 0; i < text.length; i++) {
      const ch = text[i];
      const next = text[i + 1];

      if (ch === '"') {
        if (inQuotes && next === '"') {
          cur += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
        continue;
      }

      if (!inQuotes && ch === ",") {
        row.push(cur);
        cur = "";
        continue;
      }

      if (!inQuotes && (ch === "\n" || ch === "\r")) {
        if (ch === "\r" && next === "\n") i++;
        row.push(cur);
        cur = "";
        if (row.some(v => safe(v) !== "")) rows.push(row);
        row = [];
        continue;
      }

      cur += ch;
    }

    row.push(cur);
    if (row.some(v => safe(v) !== "")) rows.push(row);

    const headers = (rows.shift() || []).map(h => safe(h).replace(/\s+/g, ""));
    return rows
      .map(r => {
        const obj = {};
        headers.forEach((h, idx) => (obj[h] = safe(r[idx])));
        return obj;
      })
      .filter(o => Object.values(o).some(v => safe(v) !== ""));
  }

  function winnerLoser(game) {
    if (!isFinal(game.Status)) return null;

    const aStr = safe(game.ScoreA);
    const bStr = safe(game.ScoreB);
    if (aStr === "" || bStr === "") return null;

    const a = Number(aStr);
    const b = Number(bStr);
    if (Number.isNaN(a) || Number.isNaN(b)) return null;
    if (a === b) return null;

    return a > b ? { W: game.TeamA, L: game.TeamB } : { W: game.TeamB, L: game.TeamA };
  }

  function resolveTeam(ref, teamsBySeed, gamesById) {
    if (!ref) return "TBD";
    ref = safe(ref).toUpperCase();
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
    if (!g) {
      return `
        <div class="gameCard">
          <div class="gameTeams">TBD vs TBD</div>
          <div class="gameStatus">Scheduled</div>
        </div>
      `;
    }

    const teamA = resolveTeam(g.TeamA, teamsBySeed, gamesById);
    const teamB = resolveTeam(g.TeamB, teamsBySeed, gamesById);

    const final = isFinal(g.Status);
    const sA = safe(g.ScoreA);
    const sB = safe(g.ScoreB);
    const score = (final && sA !== "" && sB !== "") ? `${sA}-${sB}` : "";

    return `
      <div class="gameCard">
        <div class="gameMeta">Game ${safe(g.Game)} • ${safe(g.Time)} • ${safe(g.Field)}</div>
        <div class="gameTeams">${teamA} vs ${teamB}${final ? `<span class="finalBadge">FINAL</span>` : ""}</div>
        <div class="gameStatus">
          ${final ? (score ? `Final: ${score}` : "Final") : `Status: ${safe(g.Status || "Scheduled") || "Scheduled"}`}
        </div>
      </div>
    `;
  }

  function renderBracket(gamesById, teamsBySeed) {
    if (!bracketEl) return;

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
            <div class="colTitle">Championship</div>
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
            <div class="colTitle">Placement</div>
            <div class="slot connectorMid">${gameCardHTML(g9, teamsBySeed, gamesById)}</div>
            <div class="slot connectorMid">${gameCardHTML(g10, teamsBySeed, gamesById)}</div>
          </div>

          <div class="col">
            <div class="colTitle">Game 11</div>
            <div class="slot connectorMid">${gameCardHTML(g11, teamsBySeed, gamesById)}</div>
          </div>
        </div>
      </div>
    `;
  }

  // Desktop table
  function renderScheduleTable(gameRows, teamsBySeed, gamesById) {
    if (!tbody) return;
    tbody.innerHTML = "";

    const sorted = [...gameRows].sort((a, b) => Number(a.Game) - Number(b.Game));

    for (const g of sorted) {
      const teamA = resolveTeam(g.TeamA, teamsBySeed, gamesById);
      const teamB = resolveTeam(g.TeamB, teamsBySeed, gamesById);

      const final = isFinal(g.Status);
      const sA = safe(g.ScoreA);
      const sB = safe(g.ScoreB);
      const score = (final && sA !== "" && sB !== "") ? `${sA}-${sB}` : "";

      const tr = document.createElement("tr");
      if (final) tr.classList.add("finalRow");

      // matchup as HTML links
      const matchupHTML = `${teamLinkHTML(teamA)} <span class="vsSep">vs</span> ${teamLinkHTML(teamB)}`;

      const cells = [
        { type: "text", value: safe(g.Time) },
        { type: "text", value: safe(g.Field) },
        { type: "text", value: `Game ${safe(g.Game)}` },
        { type: "html", value: matchupHTML },
        { type: "text", value: score },
        { type: "text", value: final ? "Final" : (safe(g.Status || "Scheduled") || "Scheduled") },
      ];

      for (const c of cells) {
        const td = document.createElement("td");
        if (c.type === "html") td.innerHTML = c.value;
        else td.textContent = c.value;
        tr.appendChild(td);
      }

      tbody.appendChild(tr);
    }
  }

  // Mobile/modern cards
  function renderScheduleCards(gameRows, teamsBySeed, gamesById) {
    const wrap = document.getElementById("scheduleCards");
    if (!wrap) return;

    wrap.innerHTML = "";

    const sorted = [...gameRows].sort((a, b) => Number(a.Game) - Number(b.Game));

    for (const g of sorted) {
      const teamA = resolveTeam(g.TeamA, teamsBySeed, gamesById);
      const teamB = resolveTeam(g.TeamB, teamsBySeed, gamesById);

      const final = isFinal(g.Status);
      const sA = safe(g.ScoreA);
      const sB = safe(g.ScoreB);
      const score = (final && sA !== "" && sB !== "") ? `${sA}-${sB}` : "";

      const statusText = final ? "Final" : (safe(g.Status || "Scheduled") || "Scheduled");

      const card = document.createElement("div");
      card.className = "scheduleCard" + (final ? " final" : "");

      const matchupHTML = `
        ${teamLinkHTML(teamA)}
        <span class="vsSep">vs</span>
        ${teamLinkHTML(teamB)}
      `;

      card.innerHTML = `
        <div class="scheduleCardTop">
          <div class="scheduleCardMeta">Game ${safe(g.Game)} • ${safe(g.Time)}</div>
          <div class="scheduleCardStatus">${statusText}</div>
        </div>
        <div class="scheduleCardBody">
          <div class="scheduleMatchup">${matchupHTML}</div>
          <div class="scheduleScoreRow">
            <div class="scheduleScore">${final ? score : ""}</div>
            <div class="scheduleField">${safe(g.Field)}</div>
          </div>
        </div>
      `;

      wrap.appendChild(card);
    }
  }

  async function loadAndRender() {
    const teamsCsv = await fetchCsv(window.SHEET?.TEAMS_CSV_URL);
    const gamesCsv = await fetchCsv(window.SHEET?.GAMES_CSV_URL);

    const teamRows = parseCsv(teamsCsv);
    const gameRows = parseCsv(gamesCsv);

    const teamsBySeed = new Map(
      teamRows
        .map(r => [Number(r.Seed), safe(r.TeamName)])
        .filter(([s, n]) => Number.isFinite(s) && n)
    );

    const gamesById = new Map(
      gameRows
        .map(r => [Number(r.Game), r])
        .filter(([id]) => Number.isFinite(id))
    );

    renderBracket(gamesById, teamsBySeed);
    renderScheduleTable(gameRows, teamsBySeed, gamesById);
    renderScheduleCards(gameRows, teamsBySeed, gamesById);
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
    }
  }, 60000);
})();





