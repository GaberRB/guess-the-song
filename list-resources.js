const fs = require('fs');
const yaml = require('yaml');

const templatePath = 'template.yml';
const templateContents = fs.readFileSync(templatePath, 'utf8');
const template = yaml.parse(templateContents);

const resources = Object.entries(template.Resources || {})
  .map(([resourceName, resource]) => ({
    name: resourceName,
    type: resource.Type
  }));

fs.writeFileSync('resources.txt', resources.map(resource => resource.type).join('\n'));

