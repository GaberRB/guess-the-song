const fs = require('fs');
const YAML = require('yml');

const templatePath = 'template.yml';
const templateContents = fs.readFileSync(templatePath, 'utf8');
const template = YAML.parse(templateContents);

const resources = Object.keys(template.Resources || []);

fs.writeFileSync('resources.txt', resources.join('\n'));
