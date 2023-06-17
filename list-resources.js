const fs = require('fs');
const YAML = require('yaml');

const templatePath = 'template.yml';
const templateContents = fs.readFileSync(templatePath, 'utf8');
const template = yaml.parse(templateContents);

const resources = Object.keys(template.Resources || []);

fs.writeFileSync('resources.txt', resources.join('\n'));
