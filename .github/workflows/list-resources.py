import yaml

template_path = 'template.yml'

with open(template_path, 'r') as file:
    template = yaml.safe_load(file)

resources = [
    {'name': resource_name, 'type': resource.get('Type')}
    for resource_name, resource in template.get('Resources', {}).items()
]

with open('resources.txt', 'w') as file:
    file.write('\n'.join(resource['type'] for resource in resources))
