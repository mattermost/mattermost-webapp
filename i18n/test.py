import glob
import json
import re

files = glob.glob('*.json')

contents = {}

for f in files:
	try:
		contents[f] = json.loads(open(f, 'rb').read())
	except Exception as e:
		print('Failed to load file', f)


for key, v in contents.items():
	for k in v:
		if (len(list(re.finditer('{', v[k]))) != len(list(re.finditer('}', v[k])))):
			print('Discrepancy in key', k, 'in file', key)
