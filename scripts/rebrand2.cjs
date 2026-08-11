const fs = require('fs');
const path = require('path');

const projectRootVite = path.join(__dirname, '..');

function walkSync(dir, callback) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filepath = path.join(dir, file);
    if (fs.statSync(filepath).isDirectory()) {
      if (file !== 'node_modules' && file !== '.git' && file !== 'dist') {
        walkSync(filepath, callback);
      }
    } else {
      callback(filepath);
    }
  }
}

const replacements = [
  { search: /Magnolia/g, replace: 'Hilos de Amor' }
];

let changedFilesCount = 0;

walkSync(projectRootVite, (filepath) => {
  if (!filepath.match(/\.(ts|tsx|json|html|md|env|env\.example|sql|js)$/)) return;
  if (filepath.includes('node_modules') || filepath.includes('.git') || filepath.endsWith('package-lock.json')) return;
  if (filepath.endsWith('rebrand.cjs') || filepath.endsWith('rebrand2.cjs')) return; // skip self

  let content = fs.readFileSync(filepath, 'utf8');
  let originalContent = content;

  for (const { search, replace } of replacements) {
    content = content.replace(search, replace);
  }

  if (content !== originalContent) {
    fs.writeFileSync(filepath, content, 'utf8');
    changedFilesCount++;
    console.log(`Updated: ${filepath}`);
  }
});

console.log(`\nRebranding part 2 complete. Changed ${changedFilesCount} files.`);
