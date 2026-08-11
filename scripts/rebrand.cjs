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
  { search: /Café Magnolia/g, replace: 'Hilos de Amor' },
  { search: /cafe_magnolia_/g, replace: 'hilos_de_amor_' },
  { search: /cafe-magnolia/g, replace: 'hilos-de-amor' },
  { search: /Cafe Magnolia/gi, replace: 'Hilos de Amor' }
];

let changedFilesCount = 0;

walkSync(projectRootVite, (filepath) => {
  if (!filepath.match(/\.(ts|tsx|json|html|md|env|env\.example|sql)$/)) return;
  if (filepath.includes('node_modules') || filepath.includes('.git')) return;
  if (filepath.endsWith('package-lock.json')) return;

  let content = fs.readFileSync(filepath, 'utf8');
  let originalContent = content;

  for (const { search, replace } of replacements) {
    content = content.replace(search, replace);
  }

  // Handle UUID local generation in AppContext.tsx to prevent Postgres 400 Bad Request
  if (filepath.endsWith('AppContext.tsx') || filepath.endsWith('customers.service.ts') || filepath.endsWith('rewards.service.ts') || filepath.endsWith('campaigns.service.ts')) {
    content = content.replace(/const id = `(prod|tbl|ord|ing|cli|rew|cmp|tic)-\${Date\.now\(\)}`;/g, "const id = crypto.randomUUID();");
  }

  if (content !== originalContent) {
    fs.writeFileSync(filepath, content, 'utf8');
    changedFilesCount++;
    console.log(`Updated: ${filepath}`);
  }
});

console.log(`\nRebranding complete. Changed ${changedFilesCount} files.`);
