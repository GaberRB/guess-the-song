const fs = require('fs');
const yaml = require('yaml');

const templatePath = 'template.yml';
const templateContents = fs.readFileSync(templatePath, 'utf8');
const template = yaml.parse(templateContents);

const resources = Object.keys(template.Resources || {});

console.log(resources.join('\n'));
console.log("::set-output name=resources::" + JSON.stringify(resources));
process.stdout.write(`::set-output name=resources::${JSON.stringify(resources)}`);
