import yaml

template_path = 'template.yml'

with open(template_path, 'r') as f:
    template = yaml.safe_load(f)

resources = template.get('Resources', {})
resource_types = [resource['Type'].split('::')[-1].strip().split(':')[-1].strip() for resource in resources.values()]

with open('resources.txt', 'w') as f:
    f.write('\n'.join(resource_types))

