const fs = require('fs');

const directories = ['./architecture', './components', './instructions', './util', './pages'];
const ignore = ['datapath.js', 'parse.js'];

let totalLines = 0;
let noEmpties = 0;
let noComments = 0;

for (const directory of directories) {
    for (const file of fs.readdirSync(directory)) {
        if (ignore.includes(file))
            continue;

        const lines = fs.readFileSync(`${directory}/${file}`, {
            encoding: 'utf-8'
        }).split('\n');
        
        totalLines += lines.length;
        noEmpties += lines.filter((line) => !line.match(/^\s*$/)).length;
        noComments += lines.filter((line) => !line.match(/(?:^\s*$)|(?:^\s*(?:\/\/|\/\*|\*))/)).length;
    }
}

console.log(
`Jacob's JavaScript Line Counter
-------------------------------
Total lines written:            ${totalLines}
Lines excluding empties:        ${noEmpties}
Excluding empties and comments: ${noComments}`);