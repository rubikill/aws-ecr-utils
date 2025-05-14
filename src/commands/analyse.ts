import chalk from "chalk";
import { getInitializedDatabaseService } from "../utils/db";
import { table, Alignment } from "table";

export async function analyseCommand(repositoryName?: string) {
  console.log(chalk.blue("Analysing image tags..."));

  const dbService = await getInitializedDatabaseService();

  try {
    const imageTagsByRepo = await dbService.imageDataService.getImageTagsByRepo(repositoryName);

    if (!imageTagsByRepo || Object.keys(imageTagsByRepo).length === 0) {
      console.log(chalk.yellow("No image tags found."));
      return;
    }

    console.log(chalk.green("Image Tags by Repository:"));

    const data = [["Repository", "Group", "Count"]];

    for (const repoName in imageTagsByRepo) {
      const tags = imageTagsByRepo[repoName];

      // Group similar tags
      const tagGroups: { [group: string]: number } = {};
      tags.forEach((tag: string) => {
        const keywords = ["dev", "develop", "qc", "debug", "test", "feature", "release", "hotfix", "master", "version", "v\\d+\\.\\d+\\.\\d+", "v\\d+\\.\\d+"];
        let group = "other";
        for (const keyword of keywords) {
          if (tag.toLowerCase().includes(keyword.toLowerCase())) {
            group = keyword;
            break;
          }
        }
        if (!tagGroups[group]) {
          tagGroups[group] = 0;
        }
        tagGroups[group]++;
      });

      for (const group in tagGroups) {
        data.push([repoName, group, String(tagGroups[group])]);
      }
    }

    const config = {
      columns: {
        0: { alignment: "left" as Alignment },
        1: { alignment: "left" as Alignment },
        2: { alignment: "right" as Alignment },
      },
    };

    const output = table(data, config);
    console.log(output);
  } catch (error) {
    console.error(chalk.red("Error retrieving image tags:"), error);
  } finally {
    dbService.close();
  }
}
