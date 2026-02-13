window.SHEET = {
  TEAMS_CSV_URL: "https://docs.google.com/spreadsheets/d/e/2PACX-1vSUAMNn59O8EtC8ti5EwfRQlwRo4OPrgqt_0GfmVAZA1GcbavFtXD8HQrCxSW04IGSQ_aOvcMl7Pi4Q/pub?gid=0&single=true&output=csv",
  GAMES_CSV_URL: "https://docs.google.com/spreadsheets/d/e/2PACX-1vSUAMNn59O8EtC8ti5EwfRQlwRo4OPrgqt_0GfmVAZA1GcbavFtXD8HQrCxSW04IGSQ_aOvcMl7Pi4Q/pub?gid=1840682925&single=true&output=csv",
  ROSTER_CSV_URL: "https://docs.google.com/spreadsheets/d/e/2PACX-1vSUAMNn59O8EtC8ti5EwfRQlwRo4OPrgqt_0GfmVAZA1GcbavFtXD8HQrCxSW04IGSQ_aOvcMl7Pi4Q/pub?gid=519716329&single=true&output=csv"
};

/**
 * Team branding + coach directory
 * - logo: put team logos in /team-logos/ (recommended), or leave as "./logo.png" for now
 * - coach fields: copy from your Contacts page (Head Coach section)
 *
 * Keys MUST be slugs (lowercase, hyphenated) matching team.html?team=...
 */
window.TEAM_INFO = {
  "westfield-blue": {
    name: "Westfield Blue",
    logo: "./team-logos/westfield-blue.png",
    coachName: "TBD",
    coachEmail: "TBD",
    coachPhone: ""
  },
  "branchburg": {
    name: "Branchburg",
    logo: "./team-logos/branchburg.png",
    coachName: "TBD",
    coachEmail: "TBD",
    coachPhone: ""
  },
  "ridge": {
    name: "Ridge",
    logo: "./team-logos/ridge.png",
    coachName: "TBD",
    coachEmail: "TBD",
    coachPhone: ""
  },
  "scotch-plains-fanwood": {
    name: "Scotch Plains Fanwood",
    logo: "./team-logos/scotch-plains-fanwood.png",
    coachName: "TBD",
    coachEmail: "TBD",
    coachPhone: ""
  },
  "hillsborough": {
    name: "Hillsborough",
    logo: "./team-logos/hillsborough.png",
    coachName: "TBD",
    coachEmail: "TBD",
    coachPhone: ""
  },
  "westfield-white": {
    name: "Westfield White",
    logo: "./team-logos/westfield-white.png",
    coachName: "TBD",
    coachEmail: "TBD",
    coachPhone: ""
  },
  "south-orange-maplewood": {
    name: "South Orange Maplewood",
    logo: "./team-logos/south-orange-maplewood.png",
    coachName: "TBD",
    coachEmail: "TBD",
    coachPhone: ""
  },
  "watchung-hills": {
    name: "Watchung Hills",
    logo: "./team-logos/watchung-hills.png",
    coachName: "TBD",
    coachEmail: "TBD",
    coachPhone: ""
  }
};

// Fallback logo if a team logo is missing
window.DEFAULT_TEAM_LOGO = "./logo.png";
