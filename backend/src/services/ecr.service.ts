import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ECRClient,
  DescribeRepositoriesCommand,
  DescribeImagesCommand,
} from '@aws-sdk/client-ecr';
import { fromIni } from '@aws-sdk/credential-providers';
import { Repository } from '../models/repository.entity';
import { Image } from '../models/image.entity';
import { ScanGateway } from '../gateways/scan.gateway';

@Injectable()
export class ECRService {
  private readonly logger = new Logger(ECRService.name);

  constructor(
    private configService: ConfigService,
    private scanGateway: ScanGateway,
  ) {}

  private getECRClient(profile: string, region: string): ECRClient {
    return new ECRClient({
      region,
      credentials: fromIni({ profile }),
    });
  }

  async scanRepositories(
    profile: string,
    region: string,
  ): Promise<Repository[]> {
    const client = this.getECRClient(profile, region);
    const repositories: Repository[] = [];

    try {
      await this.scanGateway.emitScanStart();

      const command = new DescribeRepositoriesCommand({});
      const response = await client.send(command);

      if (response.repositories) {
        const totalRepositories = response.repositories.length;

        for (let i = 0; i < response.repositories.length; i++) {
          const repo = response.repositories[i];
          const repository = new Repository();
          repository.repository_name = repo.repositoryName || '';
          repository.repository_uri = repo.repositoryUri || '';
          this.logger.debug(
            `[ECRService] Processing repo: ${repo.repositoryName}`,
          );
          this.logger.debug(
            `[ECRService] repo object from AWS SDK: ${JSON.stringify(repo, null, 2)}`,
          );
          this.logger.debug(
            `[ECRService] 'repository' entity instance before assignments: ${JSON.stringify(repository, null, 2)}`,
          );

          // Get images for this repository
          const imagesCommand = new DescribeImagesCommand({
            repositoryName: repo.repositoryName,
          });
          const imagesResponse = await client.send(imagesCommand);

          repositories.push(repository);

          // Emit progress
          const progress = Math.round(((i + 1) / totalRepositories) * 100);
          await this.scanGateway.emitRepositoryProgress(
            repository.repository_name,
            progress,
          );
        }
      }

      await this.scanGateway.emitScanComplete();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';
      await this.scanGateway.emitScanError(errorMessage);
      this.logger.error(
        `Error scanning repositories: ${errorMessage}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }

    return repositories;
  }
}
