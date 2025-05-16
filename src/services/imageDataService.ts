import { DataSource, Repository, In } from "typeorm";
import { Image } from "../models/image";

export class ImageDataService {
  private repository: Repository<Image>;

  constructor(dataSource: DataSource) {
    this.repository = dataSource.getRepository(Image);
  }

  /**
   * Saves an image to the database.
   * @param data The image data to save.
   * @returns A promise that resolves when the image is saved.
   */
  async saveImage(data: Image): Promise<void> {
    try {
      const { id, ...imageData } = data;
      await this.repository
        .createQueryBuilder()
        .insert()
        .into(Image)
        .values(imageData)
        .orUpdate(["image_pushed_at", "image_tags", "image_size_in_bytes"], ["repository_name", "image_digest"])
        .execute();
    } catch (error) {
      console.error("Error saving image:", error);
      throw new Error("Failed to save image.");
    }
  }

  async getTopLargestRepositories(): Promise<any[]> {
    return this.repository
      .createQueryBuilder("image")
      .select("image.repository_name")
      .addSelect("SUM(image.image_size_in_bytes)", "total_size")
      .addSelect("repository.region", "region")
      .innerJoin("repositories", "repository", "image.repository_name = repository.repository_name")
      .groupBy("image.repository_name")
      .orderBy("total_size", "DESC")
      .limit(20)
      .getRawMany();
  }

  async getTopRepositoriesByImageCount(): Promise<any[]> {
    return this.repository
      .createQueryBuilder("image")
      .select("image.repository_name")
      .addSelect("COUNT(image.image_digest)", "image_count")
      .addSelect("repository.region", "region")
      .innerJoin("repositories", "repository", "image.repository_name = repository.repository_name")
      .groupBy("image.repository_name")
      .orderBy("image_count", "DESC")
      .limit(20)
      .getRawMany();
  }

  async getRepositoriesWithNeverPulledImages(repositoryNames?: string[]): Promise<any[]> {
    let query = this.repository
      .createQueryBuilder("image")
      .select("image.repository_name")
      .addSelect("repository.region", "region")
      .addSelect("COUNT(*)", "image_count")
      .addSelect("SUM(image.image_size_in_bytes)", "image_size_in_bytes")
      .innerJoin("repositories", "repository", "image.repository_name = repository.repository_name")
      .where("image.last_recorded_pull_time IS NULL OR image.last_recorded_pull_time = ''")
      .groupBy("image.repository_name")
      .orderBy("image_count", "DESC");

    if (repositoryNames && repositoryNames.length > 0) {
      query = query.andWhere("image.repository_name in (:...repositoryNames)", { repositoryNames });
    }

    return query.getRawMany();
  }

  async repositoryExistsAndHasImages(repositoryName: string): Promise<boolean> {
    const count = await this.repository.count({ where: { repository_name: repositoryName } });
    return count > 0;
  }

  async getImageTagsByRepo(repositoryName?: string): Promise<{ [repositoryName: string]: string[] }> {
    const images = await this.repository.find({ where: { repository_name: repositoryName } });
    const imageTagsByRepo: { [repositoryName: string]: string[] } = {};
    images.forEach((image) => {
      imageTagsByRepo[image.repository_name] = image.image_tags ? image.image_tags.split(",") : [];
    });
    return imageTagsByRepo;
  }

  async getRepositoriesWithNeverPulledImagesByName(repositoryName: string): Promise<any[]> {
    return this.repository.find({
      where: {
        repository_name: repositoryName,
        last_recorded_pull_time: "",
      },
    });
  }

  async getNeverPulledImages(repositoryName: string, region: string): Promise<any[]> {
    return this.repository
      .createQueryBuilder("image")
      .innerJoin("repositories", "repository", "image.repository_name = repository.repository_name")
      .where("image.last_recorded_pull_time IS NULL OR image.last_recorded_pull_time = ''")
      .andWhere("image.repository_name = :repositoryName", { repositoryName })
      .andWhere("repository.region = :region", { region })
      .getMany();
  }

  async deleteImages(repositoryName: string, imageDigests: string[]): Promise<void> {
    await this.repository.delete({ repository_name: repositoryName, image_digest: In(imageDigests) });
  }

  async getAllImages(): Promise<Image[]> {
    return this.repository.find();
  }
}
