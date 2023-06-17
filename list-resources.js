const fs = require('fs');
const YAML = require('yaml');
const axios = require('axios');

const templatePath = 'template.yml';
const templateContents = fs.readFileSync(templatePath, 'utf8');
const template = YAML.parse(templateContents);

const resources = Object.entries(template.Resources || {})
  .map(([resourceName, resource]) => ({
    name: resourceName,
    type: resource.Type
  }));

const resourcePrices = {};

async function getResourcePrice(resourceType) {
  const url = `https://pricing.us-east-1.amazonaws.com/offers/v1.0/aws/AmazonEC2/current/index.json`;
  try {
    const response = await axios.get(url);
    const products = response.data.products;
    const matchedProducts = Object.values(products).filter(product => product.attributes && product.attributes.instanceType === resourceType);
    if (matchedProducts.length > 0) {
      const sku = matchedProducts[0].sku;
      const terms = response.data.terms.OnDemand[sku];
      const prices = Object.values(terms).map(term => term.priceDimensions);
      const price = prices[0][Object.keys(prices[0])[0]].pricePerUnit.USD;
      return price;
    } else {
      return 'Price not found';
    }
  } catch (error) {
    console.error(`Failed to fetch price for resource ${resourceType}`);
    return 'Price not found';
  }
}

async function main() {
  for (const resource of resources) {
    const price = await getResourcePrice(resource.type);
    resourcePrices[resource.name] = price;
  }

  fs.writeFileSync('resources.txt', JSON.stringify(resourcePrices, null, 2));
}

main();
