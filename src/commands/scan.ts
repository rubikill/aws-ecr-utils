import chalk from "chalk";
import { ECRService } from "../services/ecr";
import { getInitializedDatabaseService } from "../utils/db";

export async function scanCommand(awsProfile?: string, region?: string) {
  console.log(chalk.blue("Scanning AWS ECR repositories..."));
  console.log(chalk.blue(`Using AWS profile: ${awsProfile}`));
  console.log(chalk.blue(`Using AWS region: ${region}`));
  const ecrService = new ECRService();
  const dbService = await getInitializedDatabaseService();

  let allRegions: string[] = [];
  if (region) {
    allRegions = [region];
  } else {
    allRegions = await ecrService.getAllRegions(awsProfile || "");
  }
  try {
    for (const region of allRegions) {
      console.log(chalk.blue(`Scanning region: ${region}`));
      let scannedCount = 0;
      for await (const repo of ecrService.getAllRepositories(awsProfile || "", region)) {
        if (!repo.repositoryName || !repo.repositoryUri || !repo.createdAt || !repo.lastUpdated || !repo.region) {
          const errorMessage = `Repository data is incomplete: ${JSON.stringify(repo)}`;
          console.error(chalk.red(errorMessage));
          await dbService.errorDataService.saveError(repo.repositoryName || "unknown", errorMessage);
          continue;
        }

        await dbService.repositoryDataService.saveRepository({
          repository_name: repo.repositoryName,
          repository_uri: repo.repositoryUri,
          created_at: repo.createdAt,
          last_updated: String(repo.lastUpdated),
          region: repo.region,
        });
        console.log(chalk.green(`✓ Scanned repository: ${repo.repositoryName} in ${repo.region}`));
        scannedCount++;

        // Get all images for the repository
        try {
          const images = await ecrService.getAllImages(repo.repositoryName, awsProfile || "", region);

          // Save image information to the database
          for (const image of images) {
            await dbService.imageDataService.saveImage({
              id: 0,
              repository_name: image.repositoryName,
              registry_id: image.registryId || "",
              image_digest: image.imageDigest || "",
              image_tags: image.imageTags ? image.imageTags.join(",") : "",
              image_size_in_bytes: image.imageSizeInBytes || 0,
              image_pushed_at: image.imagePushedAt,
              image_scan_status: image.imageScanStatus ? JSON.stringify(image.imageScanStatus) : "",
              image_scan_findings_summary: image.imageScanFindingsSummary ? JSON.stringify(image.imageScanFindingsSummary) : "",
              image_manifest_media_type: image.imageManifestMediaType || "",
              artifact_media_type: image.artifactMediaType || "",
              last_recorded_pull_time: image.lastRecordedPullTime || "",
            });
          }
        } catch (error) {
          const errorMessage = `Error scanning images for repository ${repo.repositoryName}: ${error}`;
          console.error(chalk.red(errorMessage));
          await dbService.errorDataService.saveError(repo.repositoryName, errorMessage);
        }
      }

      console.log(chalk.green(`\nSuccessfully scanned ${scannedCount} repositories`));
    }
  } catch (error) {
    console.error(chalk.red("Error scanning repositories:"), error);
    process.exit(1);
  } finally {
    await dbService.close();
  }
}
