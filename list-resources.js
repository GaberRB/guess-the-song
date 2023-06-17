const fs = require('fs');
const yaml = require('js-yaml');

const templatePath = 'template.yml';
const templateContents = fs.readFileSync(templatePath, 'utf8');
const template = yaml.safeLoad(templateContents);

const resources = Object.keys(template.Resources || {});

console.log(resources.join('\n'));
console.log("::set-output name=resources::" + JSON.stringify(resources));
