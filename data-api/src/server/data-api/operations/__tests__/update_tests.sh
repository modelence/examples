#!/bin/bash

# Update generic "Missing required fields" messages for operations with only database/collection validation
sed -i '' "s/'Missing required fields: dataSource, database, collection'/'Invalid input: expected string, received undefined'/g" *.test.ts

# Update operations with additional required fields - these return the first missing non-Zod field
sed -i '' "s/'Missing required fields: dataSource, database, collection, filter'/'filter is required'/g" *.test.ts
sed -i '' "s/'Missing required fields: dataSource, database, collection, filter, update'/'filter is required'/g" *.test.ts
sed -i '' "s/'Missing required fields: dataSource, database, collection, filter, replacement'/'filter is required'/g" *.test.ts
sed -i '' "s/'Missing required fields: dataSource, database, collection, document'/'document is required'/g" *.test.ts
sed -i '' "s/'Missing required fields: dataSource, database, collection, pipeline'/'pipeline is required'/g" *.test.ts
sed -i '' "s/'Missing required fields: dataSource, database, collection, key'/'key is required'/g" *.test.ts
sed -i '' "s/'Missing required fields: dataSource, database, collection, keys'/'keys is required'/g" *.test.ts
sed -i '' "s/'Missing required fields: dataSource, database, collection, index'/'index is required'/g" *.test.ts
sed -i '' "s/'Missing required fields: dataSource, database, collection, operations'/'Invalid input: expected string, received undefined'/g" *.test.ts
sed -i '' "s/'Missing required fields: dataSource, database, collection, documents (array)'/'documents must be an array'/g" *.test.ts

# Update listCollections and listDatabases
sed -i '' "s/'Missing required fields: dataSource, database'/'database is required'/g" *.test.ts
sed -i '' "s/'Missing required field: dataSource'/'dataSource is required'/g" *.test.ts

# Update runCommand
sed -i '' "s/'Missing required fields: dataSource, database, command'/'command is required'/g" *.test.ts

echo "Updated test files"
