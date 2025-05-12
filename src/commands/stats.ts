import chalk from "chalk";
import { DatabaseService } from "../services/database";
import { table, Alignment } from "table";
import { formatBytes } from "../utils";
export async function statsCommand() {
  console.log(chalk.blue("Showing ECR statistics..."));

  const dbService = new DatabaseService();
  try {
    // Top Largest Repositories
    console.log(chalk.green("Top Largest Repositories (by total size):"));
    const topLargestRepositories = await dbService.imageDataService.getTopLargestRepositories();
    if (topLargestRepositories.length === 0) {
      console.log(chalk.yellow("No repositories found."));
    } else {
      const data = [
        ["Rank", "Repository Name", "Total Size", "Region"],
        ...topLargestRepositories.map((repo: { repository_name: string; total_size: number; region: string }, index: number) => [
          index + 1,
          repo.repository_name,
          formatBytes(repo.total_size),
          repo.region,
        ]),
      ];
      const config = {
        columns: {
          0: { alignment: "right" as Alignment },
          2: { alignment: "right" as Alignment },
        },
      };
      const output = table(data, config);
      console.log(output);
    }

    // Top Repositories by Image Count
    console.log(chalk.green("\nTop Repositories (by image count):"));
    const topRepositoriesByImageCount = await dbService.imageDataService.getTopRepositoriesByImageCount();
    if (topRepositoriesByImageCount.length === 0) {
      console.log(chalk.yellow("No repositories found."));
    } else {
      const data = [
        ["Rank", "Repository Name", "Image Count", "Region"],
        ...topRepositoriesByImageCount.map((repo: { repository_name: string; image_count: number; region: string }, index: number) => [index + 1, repo.repository_name, repo.image_count, repo.region]),
      ];
      const config = {
        columns: {
          0: { alignment: "right" as Alignment },
          2: { alignment: "right" as Alignment },
        },
      };
      const output = table(data, config);
      console.log(output);
    }

    // Repositories with Never Pulled Images
    console.log(chalk.green("\nRepositories with Never Pulled Images:"));
    const repositoriesWithNeverPulledImages = await dbService.imageDataService.getRepositoriesWithNeverPulledImages();
    if (repositoriesWithNeverPulledImages.length === 0) {
      console.log(chalk.yellow("No repositories found with never pulled images."));
    } else {
      const data = [
        ["Rank", "Repository Name", "Image Count", "Region"],
        ...repositoriesWithNeverPulledImages.map((repo: { repository_name: string; image_count: number; region: string }, index: number) => [
          index + 1,
          repo.repository_name,
          repo.image_count,
          repo.region,
        ]),
      ];
      const config = {
        columns: {
          0: { alignment: "right" as Alignment },
          2: { alignment: "right" as Alignment },
          3: { alignment: "left" as Alignment },
        },
      };
      const output = table(data, config);
      console.log(output);
    }
  } catch (error) {
    console.error(chalk.red("Error retrieving statistics:"), error);
  } finally {
    dbService.close();
  }
}
