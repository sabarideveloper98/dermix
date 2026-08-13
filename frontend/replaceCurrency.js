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
            
            // We want to replace $ with ₹ ONLY when it is used as a currency symbol in JSX text.
            // Example: <p>${price}</p> -> <p>₹{price}</p>
            // Example: ${product.price} -> ₹{product.price}
            // Exclude template literals: `...${var}...`
            
            // This regex finds $ followed by { (but we need to avoid template literals inside backticks)
            // A simple approach: split by backticks. Odd indices are inside backticks (if matched pairs).
            // Even indices are outside backticks.
            const parts = content.split('`');
            for (let i = 0; i < parts.length; i += 2) { // Only process outside backticks
                // Replace $ followed by {
                if (parts[i].includes('${')) {
                    parts[i] = parts[i].replace(/\$\{/g, '₹{');
                    modified = true;
                }
                // Replace $ followed by numbers (e.g. $10)
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
