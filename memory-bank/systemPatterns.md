# System Patterns

## Design Patterns

### Command Pattern
```typescript
interface Command {
  execute(): Promise<void>;
}

class ScanCommand implements Command {
  constructor(private profile: string, private region: string) {}

  async execute(): Promise<void> {
    // Implementation
  }
}
```

### Repository Pattern
```typescript
interface Repository<T> {
  find(id: string): Promise<T>;
  findAll(): Promise<T[]>;
  create(entity: T): Promise<void>;
  update(entity: T): Promise<void>;
  delete(id: string): Promise<void>;
}

class ECRRepository implements Repository<Image> {
  constructor(private db: Database) {}

  async find(digest: string): Promise<Image> {
    // Implementation
  }
}
```

### Service Layer Pattern
```typescript
interface ECRService {
  scanRepositories(profile: string, region: string): Promise<void>;
  getRepositoryStats(): Promise<RepositoryStats>;
  analyzeImages(repositoryName: string): Promise<ImageAnalysis>;
}

class ECRServiceImpl implements ECRService {
  constructor(
    private repository: ECRRepository,
    private awsClient: AWS.ECR
  ) {}

  async scanRepositories(profile: string, region: string): Promise<void> {
    // Implementation
  }
}
```

## Error Handling Patterns

### Result Pattern
```typescript
interface Result<T> {
  success: boolean;
  data?: T;
  error?: Error;
}

async function executeWithResult<T>(
  operation: () => Promise<T>
): Promise<Result<T>> {
  try {
    const data = await operation();
    return { success: true, data };
  } catch (error) {
    return { success: false, error };
  }
}
```

## Data Access Patterns

### Query Builder Pattern
```typescript
class QueryBuilder {
  private query: string = '';
  private params: any[] = [];

  select(fields: string[]): this {
    this.query += `SELECT ${fields.join(', ')}`;
    return this;
  }

  from(table: string): this {
    this.query += ` FROM ${table}`;
    return this;
  }

  where(condition: string, value: any): this {
    this.query += ` WHERE ${condition}`;
    this.params.push(value);
    return this;
  }

  build(): { query: string; params: any[] } {
    return { query: this.query, params: this.params };
  }
}
```

## AWS Integration Patterns

### Client Factory Pattern
```typescript
class AWSClientFactory {
  static createECRClient(profile: string, region: string): AWS.ECR {
    const credentials = new AWS.SharedIniFileCredentials({ profile });
    return new AWS.ECR({ credentials, region });
  }
}
```

### Pagination Pattern
```typescript
async function* paginate<T>(
  operation: (token?: string) => Promise<{ items: T[]; nextToken?: string }>
): AsyncGenerator<T> {
  let nextToken: string | undefined;

  do {
    const result = await operation(nextToken);
    yield* result.items;
    nextToken = result.nextToken;
  } while (nextToken);
}
```

## Testing Patterns

### Mock Factory Pattern
```typescript
class MockFactory {
  static createECRClient(): jest.Mocked<AWS.ECR> {
    return {
      describeRepositories: jest.fn(),
      describeImages: jest.fn()
    } as any;
  }

  static createDatabase(): jest.Mocked<Database> {
    return {
      query: jest.fn(),
      execute: jest.fn()
    } as any;
  }
}
```
