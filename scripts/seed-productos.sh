#!/bin/bash
# Uso: ./scripts/seed-productos.sh <PRODUCTOS_TABLE_NAME>
# Carga productos de ejemplo en DynamoDB

TABLE_NAME=${1:?"Uso: $0 <PRODUCTOS_TABLE_NAME>"}
SEED_FILE="docs/dynamodb/productos-seed.json"

echo "Cargando productos en tabla: $TABLE_NAME"

# Leer cada producto del JSON y hacer put-item
python3 -c "
import json, subprocess, sys

with open('$SEED_FILE') as f:
    productos = json.load(f)

for p in productos:
    item = {}
    for k, v in p.items():
        if isinstance(v, str):
            item[k] = {'S': v}
        elif isinstance(v, int):
            item[k] = {'N': str(v)}
        elif isinstance(v, float):
            item[k] = {'N': str(v)}
    
    cmd = [
        'aws', 'dynamodb', 'put-item',
        '--table-name', '$TABLE_NAME',
        '--item', json.dumps(item)
    ]
    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode == 0:
        print(f'  OK: {p[\"id\"]} - {p[\"nombre\"]}')
    else:
        print(f'  ERROR: {p[\"id\"]} - {result.stderr}', file=sys.stderr)

print(f'\n{len(productos)} productos cargados.')
"
