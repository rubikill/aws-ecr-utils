.PHONY: build scan ls clean

# Build the project
build:
	npm run build

# Scan AWS ECR repositories and store data
# Example:
# make scan profile=ama region=us-east-1
scan:
	npm run build
	node dist/index.js scan $(profile) $(region)

# List repository data from SQLite
ls:
	npm run build
	node dist/index.js ls

# Show top 20 largest repositories
stats:
	npm run build
	node dist/index.js stats

# Analyse image tags
# Example:
# make analyse repositoryName=your_repo_name
analyse:
	npm run build
	node dist/index.js analyse $(repositoryName)

# Suggest images to remove
# Example:
# make suggest profile=ama repositoryName=music-microservice-song
suggest:
	npm run build
	node dist/index.js suggest $(profile) $(repositoryName)

# Clean build artifacts
clean:
	rm -rf dist
	rm -f *.db

# Install dependencies
install:
	npm install

# Development mode
dev:
	npm run dev

# Generate ECR report
report:
	npm run build
	node dist/index.js report
