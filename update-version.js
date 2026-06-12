import fs from 'fs';
import path from 'path';

const versionFile = path.join(process.cwd(), 'public', 'version.json');
const versionData = {
  version: new Date().toISOString(),
  timestamp: Date.now()
};

fs.writeFileSync(versionFile, JSON.stringify(versionData, null, 2));
console.log('✅ Version updated:', versionData);
