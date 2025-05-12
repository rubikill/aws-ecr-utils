.PHONY: build scan ls clean

# Build the project
build:
	npm run build

# Scan AWS ECR repositories and store data
# Example:
# make scan AWS_PROFILE=ama AWS_REGION=us-east-1

scan:
	npm run build
	node dist/index.js scan $(AWS_PROFILE) $(AWS_REGION)

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
