const fs = require('fs');
const path = require('path');

// Read the console capture script
const scriptPath = path.join(__dirname, '..', 'public', 'dashboard-console-capture.js');
const scriptContent = fs.readFileSync(scriptPath, 'utf8');

// Find all HTML files in the build output
function findHtmlFiles(dir) {
  const files = [];
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      files.push(...findHtmlFiles(fullPath));
    } else if (item.endsWith('.html')) {
      files.push(fullPath);
    }
  }
  
  return files;
}

// Inject script into HTML files
function injectScript() {
  const buildDir = path.join(__dirname, '..', 'out');
  
  if (!fs.existsSync(buildDir)) {
    console.log('Build directory not found, skipping console capture injection');
    return;
  }
  
  const htmlFiles = findHtmlFiles(buildDir);
  
  for (const file of htmlFiles) {
    let content = fs.readFileSync(file, 'utf8');
    
    // Skip if script already injected
    if (content.includes('console-capture-ready')) {
      continue;
    }
    
    // Inject script before closing head tag
    const scriptTag = `<script>${scriptContent}</script>`;
    content = content.replace('</head>', `${scriptTag}</head>`);
    
    fs.writeFileSync(file, content);
    console.log(`Injected console capture into ${file}`);
  }
}

injectScript();