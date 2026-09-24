const fs = require('fs');
const path = require('path');

const srcFile = 'src/lib/api.ts';
if (!fs.existsSync(srcFile)) {
  console.error("api.ts not found");
  process.exit(1);
}

const lines = fs.readFileSync(srcFile, 'utf8').split('\n');

function makeFile(name, startLine, endLine, imports = "import api from './client';\n\n") {
  const content = lines.slice(startLine, endLine).join('\n');
  fs.writeFileSync(`src/lib/api/${name}`, imports + content);
}

function appendFile(name, startLine, endLine) {
  const content = lines.slice(startLine, endLine).join('\n');
  fs.appendFileSync(`src/lib/api/${name}`, '\n' + content);
}

// company.api.ts (1450 - 1474)
makeFile('company.api.ts', 1450, 1474);

// exportLeads (append to leads.api.ts)
appendFile('leads.api.ts', 1474, 1517);

// me (append to auth.api.ts)
appendFile('auth.api.ts', 1517, 1526);

// messages.api.ts (1526 - 1588)
makeFile('messages.api.ts', 1526, 1588);

// bookings.api.ts (1588 - 1605)
makeFile('bookings.api.ts', 1588, 1605);

// team.api.ts (1605 - 1642)
makeFile('team.api.ts', 1605, 1642);

// admin.api.ts (1642 - 1977)
makeFile('admin.api.ts', 1642, 1977);

// agency.api.ts (1977 - 2043)
makeFile('agency.api.ts', 1977, 2043);

// analytics.api.ts (2046 - 2059)
makeFile('analytics.api.ts', 2046, 2059);

// finance.api.ts (2059 - 2182)
makeFile('finance.api.ts', 2059, 2182);

// googleIntegrationApi (append to integrations.api.ts)
appendFile('integrations.api.ts', 2182, 2215);

// subscription.api.ts (2215 - 2244)
makeFile('subscription.api.ts', 2215, 2244);

// evolution.api.ts (2244 - 2300)
makeFile('evolution.api.ts', 2244, 2300);

// tutorial.api.ts (2300 - lines.length)
makeFile('tutorial.api.ts', 2300, lines.length);

console.log("Done generating all API files.");
