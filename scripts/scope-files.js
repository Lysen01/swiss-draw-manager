const scopes = {
  tournament: [
    "src/app/02-events.js",
    "src/app/03-state-normalization.js",
    "src/app/04-render.js",
    "src/app/06-pairing.js",
  ],
  standings: [
    "src/app/04-render.js",
    "src/app/07-standings.js",
    "src/app/08-lifecycle-utils.js",
  ],
  players: [
    "src/app/02-events.js",
    "src/app/04-render.js",
    "src/app/05-actions.js",
    "src/app/08-lifecycle-utils.js",
  ],
  clubs: [
    "src/app/02-events.js",
    "src/app/04-render.js",
    "src/app/05-actions.js",
    "src/app/08-lifecycle-utils.js",
  ],
  archive: [
    "src/app/02-events.js",
    "src/app/04-render.js",
    "src/app/08-lifecycle-utils.js",
  ],
  persistence: [
    "src/app/08-lifecycle-utils.js",
    "server/index.js",
    "server/lib/db.js",
    "server/routes/tournaments.js",
    "server/routes/players.js",
    "server/routes/clubs.js",
    "server/routes/coaches.js",
  ],
  layout: ["index.html", "styles.css", "src/app/04-render.js"],
};

function printHelp() {
  const names = Object.keys(scopes).join(", ");
  console.log("Usage:");
  console.log("  node scripts/scope-files.js <scope>");
  console.log("  node scripts/scope-files.js --list");
  console.log("  node scripts/scope-files.js --json");
  console.log("");
  console.log(`Scopes: ${names}`);
}

const arg = process.argv[2];
if (!arg || arg === "--help" || arg === "-h") {
  printHelp();
  process.exit(0);
}

if (arg === "--list") {
  Object.keys(scopes)
    .sort()
    .forEach((name) => console.log(name));
  process.exit(0);
}

if (arg === "--json") {
  console.log(JSON.stringify(scopes, null, 2));
  process.exit(0);
}

const scope = String(arg).trim().toLowerCase();
const files = scopes[scope];
if (!files) {
  console.error(`Unknown scope: ${scope}`);
  printHelp();
  process.exit(1);
}

for (const file of files) {
  console.log(file);
}
