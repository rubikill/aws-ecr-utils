# AWS ECR Utils

A command-line utility tool for managing and analyzing AWS Elastic Container Registry (ECR) repositories using Node.js and TypeScript.

## Overview

This tool provides a convenient way to scan and manage AWS ECR repositories using your local AWS profile. It stores repository information in a local SQLite database for quick access and analysis.

<div align="center">
  <p>If you find this project helpful, consider buying me a coffee:</p>
  <a href="https://www.buymeacoffee.com/hathietthub" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="Buy Me A Coffee" style="height: 60px !important;width: 217px !important;" ></a>
</div>

## Features

- Scan AWS ECR repositories and store repository and image metadata in SQLite database
- List and view repository and image information from the local database
- Terminal-based visualization of repository and image data
- Uses local AWS profile for authentication (or specify with --profile option)
- Built with Node.js, TypeScript, and SQLite3

## Technical Stack

- Node.js
- TypeScript
- SQLite3
- AWS SDK for JavaScript
- Commander.js (for CLI interface)
- Chalk (for terminal styling)

## Prerequisites

- Node.js (v14 or higher)
- AWS CLI configured with appropriate credentials
- Make (for using Makefile commands)

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/aws-ecr-utils.git
cd aws-ecr-utils
```

2. Install dependencies:
```bash
npm install
```

3. Build the project:
```bash
npm run build
```

## Usage

The tool provides the following commands through the Makefile:

### Scan ECR Repositories
```bash
make scan
```bash
make scan AWS_PROFILE=ama AWS_REGION=us-west-2
```
This command will:
- Connect to AWS using your local profile (or specify with AWS_PROFILE=your_profile option)
- Connect to AWS using the specified region (or specify with AWS_REGION=your_region option)
- Delete the existing SQLite database
- Scan all accessible ECR repositories
- Retrieve and store repository and image metadata in the SQLite database

### List Repository Data
```bash
make ls
```
This command will:
- Read from the local SQLite database
- Display repository information in a formatted table

### Show Top 20 Largest Repositories
```bash
make stats
```
This command will:
- Read from the local SQLite database
- Calculate and display the top 20 repositories with the highest number of images

### Analyse Image Tags
```bash
make analyse
```
This command will:
- Read from the local SQLite database
- Group image tags by repository and show similar tags
- Show key metrics and details for each repository

### Suggest Images to Remove
```bash
make suggest
```bash
make suggest AWS_PROFILE=ama AWS_REGION=us-west-2
```
This command will:
- Connect to AWS using your local profile (or specify with AWS_PROFILE=your_profile option)
- Connect to AWS using the specified region (or specify with AWS_REGION=your_region option)
- Read from the local SQLite database
- Suggest images that have never been pulled, grouped by repository
- Prompt the user for confirmation before deleting the images
- Delete the images from ECR if the user confirms

## Project Structure

```
aws-ecr-utils/
├── src/
│   ├── commands/        # CLI command implementations
│   ├── services/        # Business logic and AWS interactions
│   ├── database/        # SQLite database operations (stores repositories and images)
│   └── utils/           # Helper functions and utilities
├── ecr-repos.db        # SQLite database file
├── tests/               # Test files
├── Makefile            # Build and command definitions
├── package.json        # Project dependencies
└── tsconfig.json       # TypeScript configuration
```

## Development

1. Install development dependencies:
```bash
npm install --save-dev
```

2. Run tests:
```bash
npm test
```

3. Start development mode:
```bash
npm run dev
```

## License

MIT

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request
