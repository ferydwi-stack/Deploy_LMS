const fs = require('fs');
let c = fs.readFileSync('Frontend/app/guru/tugas/page.tsx', 'utf8');
const match = c.match(/<select[\s\S]*?className=(["'])([\s\S]*?)\1/gi);
console.log(match);
