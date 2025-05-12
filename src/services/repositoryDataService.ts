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
    return this.repository
      .createQueryBuilder("repository")
      .leftJoinAndSelect("image", "image", "image.repository_name = repository.repository_name")
      .select(["repository", "COUNT(image.image_digest) AS image_count"])
      .groupBy("repository.repository_name")
      .getRawMany();
  }
}
