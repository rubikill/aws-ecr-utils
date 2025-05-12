import chalk from "chalk";
import { ECRService } from "../services/ecr";
import { DatabaseService } from "../services/database";

export async function scanCommand(awsProfile?: string, region?: string) {
  console.log(chalk.blue("Scanning AWS ECR repositories..."));
  console.log(chalk.blue(`Using AWS profile: ${awsProfile}`));
  console.log(chalk.blue(`Using AWS region: ${region}`));
  const ecrService = new ECRService();
  const dbService = new DatabaseService();
  try {
    let scannedCount = 0;
    for await (const repo of ecrService.getAllRepositories(awsProfile || "", region)) {
      if (!repo.repositoryName || !repo.repositoryUri || !repo.createdAt || !repo.lastUpdated || !repo.region) {
        const errorMessage = `Repository data is incomplete: ${JSON.stringify(repo)}`;
        console.error(chalk.red(errorMessage));
        await dbService.saveError(repo.repositoryName || "unknown", errorMessage);
        continue;
      }

      await dbService.saveRepository({
        repositoryName: repo.repositoryName,
        repositoryUri: repo.repositoryUri,
        createdAt: repo.createdAt,
        lastUpdated: String(repo.lastUpdated),
        region: repo.region,
      });
      console.log(chalk.green(`✓ Scanned repository: ${repo.repositoryName} in ${repo.region}`));
      scannedCount++;

      // Get all images for the repository
      try {
        const images = await ecrService.getAllImages(repo.repositoryName, awsProfile || "", region);

        // Save image information to the database
        for (const image of images) {
          await dbService.saveImage({
            repositoryName: image.repositoryName,
            registryId: image.registryId || "",
            imageDigest: image.imageDigest || "",
            imageTags: image.imageTags ? image.imageTags.join(",") : "",
            imageSizeInBytes: image.imageSizeInBytes || 0,
            imagePushedAt: image.imagePushedAt,
            imageScanStatus: image.imageScanStatus ? JSON.stringify(image.imageScanStatus) : "",
            imageScanFindingsSummary: image.imageScanFindingsSummary ? JSON.stringify(image.imageScanFindingsSummary) : "",
            imageManifestMediaType: image.imageManifestMediaType || "",
            artifactMediaType: image.artifactMediaType || "",
            lastRecordedPullTime: image.lastRecordedPullTime || "",
          });
        }
      } catch (error) {
        const errorMessage = `Error scanning images for repository ${repo.repositoryName}: ${error}`;
        console.error(chalk.red(errorMessage));
        await dbService.saveError(repo.repositoryName, errorMessage);
      }
    }

    console.log(chalk.green(`\nSuccessfully scanned ${scannedCount} repositories`));
  } catch (error) {
    console.error(chalk.red("Error scanning repositories:"), error);
    process.exit(1);
  } finally {
    dbService.close();
  }
}
