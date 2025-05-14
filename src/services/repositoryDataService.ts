import { DataSource, Repository } from "typeorm";
import { Repository as RepositoryEntity } from "../models/repository";

export class RepositoryDataService {
  private repository: Repository<RepositoryEntity>;

  constructor(dataSource: DataSource) {
    this.repository = dataSource.getRepository(RepositoryEntity);
  }

  async saveRepository(data: RepositoryEntity): Promise<void> {
    await this.repository.save(data);
  }

  async getAllRepositories(): Promise<any[]> {
    try {
      return await this.repository
        .createQueryBuilder("repository")
        .select(["repository.repository_name", "repository.repository_uri", "repository.created_at", "repository.last_updated", "repository.region"])
        .getMany();
    } catch (error) {
      console.error("Error getting repositories:", error);
      throw error;
    }
  }
}
