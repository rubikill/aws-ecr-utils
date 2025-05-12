import chalk from "chalk";
import { DatabaseService } from "../services/database";
import { table, Alignment } from "table";

export async function statsCommand() {
  console.log(chalk.blue("Showing top 20 largest repositories..."));

  const dbService = new DatabaseService();

  try {
    const repositories = await dbService.getTop20LargestRepositories();

    if (repositories.length === 0) {
      console.log(chalk.yellow("No repositories found."));
      return;
    }

    console.log(chalk.green("Top 20 Largest Repositories:"));

    const data = [
      ["Rank", "Repository Name", "Image Count"],
      ...repositories.map((repo: { repository_name: string; image_count: number }, index: number) => [index + 1, repo.repository_name, repo.image_count]),
    ];

    const config = {
      columns: {
        0: { alignment: "right" as Alignment },
        2: { alignment: "right" as Alignment },
      },
    };

    const output = table(data, config);
    console.log(output);
  } catch (error) {
    console.error(chalk.red("Error retrieving top 20 largest repositories:"), error);
  } finally {
    dbService.close();
  }
}
