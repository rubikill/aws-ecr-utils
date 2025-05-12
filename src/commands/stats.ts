import chalk from "chalk";
import { DatabaseService } from "../services/database";
import { table, Alignment } from "table";

export async function statsCommand() {
  console.log(chalk.blue("Showing ECR statistics..."));

  const dbService = new DatabaseService();

  try {
    // Top Largest Repositories
    console.log(chalk.green("Top Largest Repositories (by total size):"));
    const topLargestRepositories = await dbService.getTopLargestRepositories();
    if (topLargestRepositories.length === 0) {
      console.log(chalk.yellow("No repositories found."));
    } else {
      const data = [
        ["Rank", "Repository Name", "Total Size (Bytes)"],
        ...topLargestRepositories.map((repo: { repository_name: string; total_size: number }, index: number) => [index + 1, repo.repository_name, repo.total_size]),
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
    const topRepositoriesByImageCount = await dbService.getTopRepositoriesByImageCount();
    if (topRepositoriesByImageCount.length === 0) {
      console.log(chalk.yellow("No repositories found."));
    } else {
      const data = [
        ["Rank", "Repository Name", "Image Count"],
        ...topRepositoriesByImageCount.map((repo: { repository_name: string; image_count: number }, index: number) => [index + 1, repo.repository_name, repo.image_count]),
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
    const repositoriesWithNeverPulledImages = await dbService.getRepositoriesWithNeverPulledImages();
    if (repositoriesWithNeverPulledImages.length === 0) {
      console.log(chalk.yellow("No repositories found with never pulled images."));
    } else {
      const data = [
        ["Rank", "Repository Name", "Image Count"],
        ...repositoriesWithNeverPulledImages.map((repo: { repository_name: string; image_count: number }, index: number) => [index + 1, repo.repository_name, repo.image_count]),
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
  } catch (error) {
    console.error(chalk.red("Error retrieving statistics:"), error);
  } finally {
    dbService.close();
  }
}
