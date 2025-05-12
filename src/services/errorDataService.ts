import { DataSource, Repository } from "typeorm";
import { Error } from "../models/error";

export class ErrorDataService {
  private repository: Repository<Error>;

  constructor(dataSource: DataSource) {
    this.repository = dataSource.getRepository(Error);
  }

  async saveError(repositoryName: string, errorMessage: string): Promise<void> {
    await this.repository.insert({
      repository_name: repositoryName,
      error_message: errorMessage,
      timestamp: new Date().toISOString(),
    });
  }
}
