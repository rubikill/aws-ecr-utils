# Technical Context

## Technology Stack

### Core Technologies
- **Node.js** (v14+)
  - Runtime environment for the CLI tool
  - Async/await for handling AWS operations
  - Event-driven architecture

- **TypeScript**
  - Static typing for better code quality
  - Interface definitions for AWS and database models
  - Type safety for CLI commands

- **SQLite3**
  - Local database for storing repository data
  - Efficient querying for analysis
  - Portable data storage

### AWS Integration
- **AWS SDK for JavaScript**
  - ECR API integration
  - Authentication via AWS profiles
  - Pagination handling for large repositories

### CLI Framework
- **Commander.js**
  - Command-line interface structure
  - Command parsing and validation
  - Help documentation generation

### Development Tools
- **ESLint**
  - Code quality enforcement
  - TypeScript-specific rules
  - Consistent code style

- **Prettier**
  - Code formatting
  - Consistent style across the project

## Architecture

### Service Layer
1. **ECR Service**
   - AWS ECR API interactions
   - Repository scanning
   - Image metadata retrieval

2. **Database Service**
   - SQLite connection management
   - Schema definition and migrations
   - Query optimization

3. **Repository Service**
   - Repository data management
   - Analysis and statistics
   - Tag grouping and analysis

4. **Image Service**
   - Image metadata handling
   - Tag analysis
   - Cleanup suggestions

### Data Models

1. **Repository Model**
```typescript
interface Repository {
  name: string;
  uri: string;
  createdAt: Date;
  imageCount: number;
  lastUpdated: Date;
}
```

2. **Image Model**
```typescript
interface Image {
  digest: string;
  tag: string;
  size: number;
  pushedAt: Date;
  repositoryName: string;
  lastPulled?: Date;
}
```

3. **Error Model**
```typescript
interface Error {
  code: string;
  message: string;
  timestamp: Date;
  context?: Record<string, unknown>;
}
```

## Database Schema

### Tables

1. **repositories**
```sql
CREATE TABLE repositories (
  name TEXT PRIMARY KEY,
  uri TEXT NOT NULL,
  created_at DATETIME NOT NULL,
  image_count INTEGER DEFAULT 0,
  last_updated DATETIME NOT NULL
);
```

2. **images**
```sql
CREATE TABLE images (
  digest TEXT PRIMARY KEY,
  tag TEXT NOT NULL,
  size INTEGER NOT NULL,
  pushed_at DATETIME NOT NULL,
  repository_name TEXT NOT NULL,
  last_pulled DATETIME,
  FOREIGN KEY (repository_name) REFERENCES repositories(name)
);
```

3. **errors**
```sql
CREATE TABLE errors (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  code TEXT NOT NULL,
  message TEXT NOT NULL,
  timestamp DATETIME NOT NULL,
  context TEXT
);
```

## Command Structure

### Base Command
```typescript
interface BaseCommand {
  name: string;
  description: string;
  execute: (args: string[]) => Promise<void>;
}
```

### Command Types
1. **Scan Command**
   - AWS profile handling
   - Region selection
   - Repository discovery
   - Image metadata collection

2. **List Command**
   - Database querying
   - Formatting output
   - Pagination handling

3. **Stats Command**
   - Repository analysis
   - Size calculations
   - Top N listing

4. **Analyse Command**
   - Tag grouping
   - Pattern detection
   - Similarity analysis

5. **Suggest Command**
   - Usage analysis
   - Cleanup recommendations
   - Confirmation handling

## Error Handling

### Error Types
1. **AWS Errors**
   - Authentication failures
   - API rate limits
   - Permission issues

2. **Database Errors**
   - Connection issues
   - Query failures
   - Schema mismatches

3. **Validation Errors**
   - Invalid commands
   - Missing parameters
   - Type mismatches

### Error Recovery
1. **Retry Mechanisms**
   - AWS API retries
   - Database reconnection
   - Command validation

2. **Fallback Options**
   - Local cache usage
   - Alternative queries
   - Default values

## Performance Considerations

### Optimization Strategies
1. **Database**
   - Indexed queries
   - Batch operations
   - Connection pooling

2. **AWS API**
   - Pagination handling
   - Rate limiting
   - Caching responses

3. **Memory Management**
   - Stream processing
   - Garbage collection
   - Resource cleanup

## Security

### Authentication
1. **AWS Credentials**
   - Profile-based auth
   - Role assumption
   - Session management

2. **Data Protection**
   - Local database encryption
   - Secure credential storage
   - Access control

### Best Practices
1. **Code Security**
   - Input validation
   - Error sanitization
   - Dependency scanning

2. **AWS Security**
   - Least privilege
   - Resource isolation
   - Audit logging
