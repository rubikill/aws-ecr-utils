import chalk from "chalk";
import { DatabaseService } from "../services/database";
import { ECRService } from "../services/ecr";
import * as readline from "readline";
import { getInitializedDatabaseService } from "../utils/db";

async function confirm(question: string): Promise<boolean> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(question + " (y/n): ", (answer) => {
      rl.close();
      resolve(answer.toLowerCase() === "y");
    });
  });
}

export async function suggestCommand(awsProfile?: string, region?: string) {
  console.log(chalk.blue("Suggesting images to remove..."));

  const dbService = await getInitializedDatabaseService();
  const ecrService = new ECRService();

  try {
    const repositories = await dbService.imageDataService.getRepositoriesWithNeverPulledImages();

    if (repositories.length === 0) {
      console.log(chalk.yellow("No repositories found with never pulled images."));
      return;
    }

    console.log(chalk.green("Repositories with never pulled images:"));
    repositories.forEach((repo: { repository_name: string; image_count: number; region: string }, index: number) => {
      console.log(chalk.green(`${index + 1}. ${repo.repository_name} (${repo.image_count} images) in ${repo.region}`));
    });

    const shouldDelete = await confirm("Do you want to delete these images?");

    if (shouldDelete) {
      console.log(chalk.yellow("Deleting images..."));
      for (const repo of repositories) {
        try {
          const images = await ecrService.getAllImages(repo.repositoryName, awsProfile || "", region);
          const imagesToDelete = images.filter((image) => image.lastRecordedPullTime === null || image.lastRecordedPullTime === "");

          for (const image of imagesToDelete) {
            console.log(chalk.yellow(`Deleting image ${image.imageDigest} from repository ${repo.repositoryName}`));
            await ecrService.deleteImage(repo.repositoryName, image.imageDigest, awsProfile || "", region);
            await dbService.imageDataService.deleteImage(repo.repositoryName, image.imageDigest);
          }
        } catch (error) {
          console.error(chalk.red(`Error deleting images from repository ${repo.repositoryName}:`), error);
        }
      }
      console.log(chalk.green("Successfully deleted images."));
    } else {
      console.log(chalk.yellow("Deletion cancelled."));
    }
  } catch (error) {
    console.error(chalk.red("Error suggesting images to remove:"), error);
  } finally {
    await dbService.close();
  }
}
