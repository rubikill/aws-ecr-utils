import chalk from "chalk";
import { table } from "table";
import { DatabaseService } from "../services/database";

export async function listCommand() {
  console.log(chalk.blue("Listing ECR repositories from database..."));

  const dbService = new DatabaseService();

  try {
    const repositories = await dbService.repositoryDataService.getAllRepositories();

    if (repositories.length === 0) {
      console.log(chalk.yellow('No repositories found in database. Run "make scan" first.'));
      return;
    }

    const data = [
      ["Repository Name", "URI", "Created At", "Images", "Last Updated"],
      ...repositories.map((repo) => [
        repo.repository_name,
        repo.repository_uri,
        new Date(repo.created_at).toLocaleString(),
        repo["COUNT(image_image_digest)"].toString(),
        new Date(repo.last_updated).toLocaleString(),
      ]),
    ];

    console.log(table(data));
    console.log(chalk.green(`Total repositories: ${repositories.length}`));
  } catch (error) {
    console.error(chalk.red("Error listing repositories:"), error);
    process.exit(1);
  } finally {
    dbService.close();
  }
}
