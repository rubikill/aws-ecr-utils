import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Repository as RepositoryEntity } from '../models/repository.entity';
import { Image } from '../models/image.entity';
import { Scan } from '../models/scan.entity';

@Injectable()
export class RepositoryService {
  private readonly logger = new Logger(RepositoryService.name);

  constructor(
    @InjectRepository(RepositoryEntity)
    private repositoryRepository: Repository<RepositoryEntity>,
    @InjectRepository(Image)
    private imageRepository: Repository<Image>,
    @InjectRepository(Scan)
    private scanRepository: Repository<Scan>,
  ) {}

  async findAll(): Promise<RepositoryEntity[]> {
    return this.repositoryRepository.find();
  }

  async saveAll(repositories: RepositoryEntity[]): Promise<RepositoryEntity[]> {
    const savedRepositories: RepositoryEntity[] = [];

    for (const repo of repositories) {
      // Save repository
      const savedRepo = await this.repositoryRepository.save(repo);
      savedRepositories.push(savedRepo);
    }

    return savedRepositories;
  }

  async getStats(): Promise<{
    totalRepositories: number;
    totalImages: number;
    lastScan: Date;
  }> {
    try {
      const [totalRepositories, totalImages, lastScan] = await Promise.all([
        this.repositoryRepository.count(),
        this.imageRepository.count(),
        this.repositoryRepository
          .createQueryBuilder('repository')
          // .select('MAX(repository.lastUpdated)', 'lastScan')
          .getRawOne(),
      ]);

      return {
        totalRepositories,
        totalImages,
        lastScan: lastScan?.lastScan || new Date(0),
      };
    } catch (error) {
      this.logger.error(`Error getting stats: ${error.message}`, error.stack);
      throw error;
    }
  }

  async getRepository(name: string): Promise<RepositoryEntity | null> {
    return this.repositoryRepository.findOne({
      where: { repository_name: name },
      relations: ['images'],
    });
  }

  async getAllScans(): Promise<Scan[]> {
    return this.scanRepository.find({
      order: { startedAt: 'DESC' },
    });
  }

  async getScanById(id: number): Promise<Scan | null> {
    return this.scanRepository.findOne({
      where: { id },
    });
  }
}
