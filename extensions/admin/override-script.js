const fs = require('fs');

let dir = './extensions/admin/models/Administrator.settings.json';
let dirDist = './node_modules/strapi-admin/models/Administrator.settings.json';
fs.copyFileSync(dir, dirDist);
