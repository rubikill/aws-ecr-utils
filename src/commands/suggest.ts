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

export async function suggestCommand(awsProfile?: string, repositoryName?: string) {
  console.log(chalk.blue("Suggesting images to remove..."));

  let repositoryNames: string[] = [];
  // Split repositoryName by commas and trim whitespace
  if (repositoryName) {
    repositoryNames = repositoryName
      .split(",")
      .map((name) => name.trim())
      .filter((name) => name !== "");
  }

  const dbService = await getInitializedDatabaseService();
  const ecrService = new ECRService();
  try {
    const repositories = await dbService.imageDataService.getRepositoriesWithNeverPulledImages(repositoryNames);

    if (repositories.length === 0) {
      console.log(chalk.yellow("No repositories found with never pulled images."));
      return;
    }

    console.log(chalk.green("Repositories with never pulled images:"));
    repositories.forEach((repo: { image_repository_name: string; image_count: number; region: string }, index: number) => {
      console.log(chalk.green(`${index + 1}. ${repo.image_repository_name} (${repo.image_count} images) in ${repo.region}`));
    });

    const shouldDelete = await confirm("Do you want to delete these images?");

    if (shouldDelete) {
      console.log(chalk.yellow("Deleting images..."));
      for (const repo of repositories) {
        try {
          const imagesToDelete = await dbService.imageDataService.getRepositoriesWithNeverPulledImagesByName(repo.image_repository_name);

          // Break imageDigests into chunks of 100
          const chunkSize = 100;
          const chunks = [];
          const imageDigests = imagesToDelete.map((image: { image_digest: string }) => image.image_digest);
          for (let i = 0; i < imageDigests.length; i += chunkSize) {
            chunks.push(imageDigests.slice(i, i + chunkSize));
          }
          for (const chunk of chunks) {
            console.log(chalk.yellow(`Deleting images from repository ${repo.image_repository_name} with digests: ${chunk.join(", ")}`));
            await ecrService.deleteImages(repo.image_repository_name, chunk, awsProfile || "", repo.region);
            await dbService.imageDataService.deleteImages(repo.image_repository_name, chunk);
          }
        } catch (error) {
          console.error(chalk.red(`Error deleting images from repository ${repo.image_repository_name}:`), error);
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
