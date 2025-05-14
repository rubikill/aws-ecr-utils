# Setup Script Documentation

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)
- AWS CLI configured with appropriate credentials
- SQLite3

## Installation Steps

1. Clone the repository:
```bash
git clone https://github.com/your-org/aws-ecr-utils.git
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

4. Configure AWS credentials:
```bash
aws configure
```
Enter your AWS access key, secret key, and default region.

## Database Setup

The application uses SQLite3 for local data storage. The database is automatically initialized on first run.

Database schema:
```sql
CREATE TABLE repositories (
    repository_name TEXT PRIMARY KEY,
    repository_uri TEXT NOT NULL,
    created_at DATETIME NOT NULL,
    last_updated DATETIME NOT NULL,
    region TEXT NOT NULL
);

CREATE TABLE images (
    image_tag TEXT PRIMARY KEY,
    repository_name TEXT NOT NULL,
    pushed_at DATETIME NOT NULL,
    size_bytes INTEGER NOT NULL,
    FOREIGN KEY (repository_name) REFERENCES repositories(repository_name)
);

CREATE TABLE errors (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    repository_name TEXT NOT NULL,
    error_message TEXT NOT NULL,
    timestamp DATETIME NOT NULL,
    FOREIGN KEY (repository_name) REFERENCES repositories(repository_name)
);
```

## Environment Variables

Create a `.env` file in the project root with the following variables:

```env
AWS_REGION=your-default-region
DB_PATH=./data/ecr.db
LOG_LEVEL=info
```

## Usage

1. Scan repositories:
```bash
npm run dev scan
```

2. List repositories:
```bash
npm run dev ls
```

3. Show statistics:
```bash
npm run dev stats
```

4. Analyze images:
```bash
npm run dev analyse
```

5. Get cleanup suggestions:
```bash
npm run dev suggest
```

## Troubleshooting

1. Database Connection Issues:
   - Ensure SQLite3 is installed
   - Check database file permissions
   - Verify database path in .env file

2. AWS Authentication Issues:
   - Verify AWS credentials are configured
   - Check AWS CLI configuration
   - Ensure IAM permissions are correct

3. Build Issues:
   - Clear node_modules and reinstall
   - Check TypeScript version compatibility
   - Verify all dependencies are installed

## Development Setup

1. Install development dependencies:
```bash
npm install --save-dev
```

2. Run tests:
```bash
npm test
```

3. Run linter:
```bash
npm run lint
```

4. Start development server:
```bash
npm run dev
```

## Maintenance

1. Database Backup:
```bash
cp ./data/ecr.db ./data/ecr.db.backup
```

2. Clear Database:
```bash
rm ./data/ecr.db
```

3. Update Dependencies:
```bash
npm update
```

## Security Considerations

1. AWS Credentials:
   - Never commit AWS credentials
   - Use IAM roles with minimal required permissions
   - Rotate credentials regularly

2. Database Security:
   - Restrict database file permissions
   - Regular backups
   - Monitor database size

3. Code Security:
   - Keep dependencies updated
   - Regular security audits
   - Follow security best practices
