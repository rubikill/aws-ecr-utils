import { ECRClient, DescribeRepositoriesCommand, DescribeImagesCommand, BatchDeleteImageCommand } from "@aws-sdk/client-ecr";
import { fromIni } from "@aws-sdk/credential-providers";
import { EC2Client, DescribeRegionsCommand } from "@aws-sdk/client-ec2";
import chalk from "chalk";

export class ECRService {
  constructor() {}

  async *getAllRepositories(awsProfile: string, region?: string) {
    const ec2Client = new EC2Client({ credentials: fromIni({ profile: awsProfile }) });
    const describeRegionsCommandInput = region ? { RegionNames: [region] } : {};
    const command = new DescribeRegionsCommand(describeRegionsCommandInput);
    const response = await ec2Client.send(command);
    const regions = response.Regions?.map((region) => region.RegionName) || [];

    for (const region of regions) {
      const client = new ECRClient({
        region: region!,
        credentials: fromIni({ profile: awsProfile }),
      });

      let nextToken: string | undefined;

      do {
        const command = new DescribeRepositoriesCommand({
          nextToken,
        });

        const response = await client.send(command);

        for (const repo of response.repositories || []) {
          yield {
            repositoryName: repo.repositoryName,
            repositoryUri: repo.repositoryUri,
            createdAt: repo.createdAt?.toISOString(),
            lastUpdated: new Date().toISOString(),
            region,
          };
        }

        nextToken = response.nextToken;
      } while (nextToken);
    }
  }

  async getAllImages(repositoryName: string, awsProfile: string, region?: string): Promise<any[]> {
    const images = [];
    let nextToken: string | undefined;

    const client = new ECRClient({
      region: region,
      credentials: fromIni({ profile: awsProfile }),
    });

    do {
      const command = new DescribeImagesCommand({
        repositoryName,
        nextToken,
      });

      const response = await client.send(command);

      for (const image of response.imageDetails || []) {
        images.push({
          repositoryName,
          imageDigest: image.imageDigest,
          imageTags: image.imageTags,
          imageSizeInBytes: image.imageSizeInBytes,
          imagePushedAt: image.imagePushedAt?.toISOString(),
          imageScanStatus: image.imageScanStatus,
          imageScanFindingsSummary: image.imageScanFindingsSummary,
          imageManifestMediaType: image.imageManifestMediaType,
          artifactMediaType: image.artifactMediaType,
          lastRecordedPullTime: image.lastRecordedPullTime?.toISOString(),
          registryId: image.registryId,
        });
      }

      nextToken = response.nextToken;
    } while (nextToken);

    return images;
  }

  async deleteImage(repositoryName: string, imageDigest: string, awsProfile: string, region?: string): Promise<void> {
    const client = new ECRClient({
      region: region,
      credentials: fromIni({ profile: awsProfile }),
    });

    const command = new BatchDeleteImageCommand({
      repositoryName,
      imageIds: [{ imageDigest }],
    });

    try {
      await client.send(command);
      console.log(chalk.green(`Successfully deleted image ${imageDigest} from repository ${repositoryName}`));
    } catch (error) {
      console.error(chalk.red(`Error deleting image ${imageDigest} from repository ${repositoryName}:`), error);
      throw error;
    }
  }
}
