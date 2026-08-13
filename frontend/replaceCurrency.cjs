const fs = require('fs');
const path = require('path');

function processDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            processDir(fullPath);
        } else if (fullPath.endsWith('.jsx')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let modified = false;
            
            const parts = content.split('`');
            for (let i = 0; i < parts.length; i += 2) { 
                if (parts[i].includes('${')) {
                    parts[i] = parts[i].replace(/\$\{/g, '₹{');
                    modified = true;
                }
                if (parts[i].match(/\$[0-9]/)) {
                    parts[i] = parts[i].replace(/\$([0-9])/g, '₹$1');
                    modified = true;
                }
            }
            const newContent = parts.join('`');
            if (content !== newContent) {
                fs.writeFileSync(fullPath, newContent);
                console.log('Updated:', fullPath);
            }
        }
    }
}

processDir(path.join(__dirname, 'src'));
console.log('Currency replacement complete.');
