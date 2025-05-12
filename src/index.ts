import { Command } from "commander";
import { scanCommand } from "./commands/scan";
import { listCommand } from "./commands/list";
import { statsCommand } from "./commands/stats";
import { analyseCommand } from "./commands/analyse";

const program = new Command();

program.name("aws-ecr-utils").description("AWS ECR repository management and analysis tool").version("1.0.0");

program
  .command("scan [AWS_PROFILE] [REGION]")
  .description("Scan AWS ECR repositories and store data in SQLite")
  .action(async (profile, region) => {
    scanCommand(profile, region);
  });

program.command("ls").description("List repository data from SQLite database").action(listCommand);

program
  .command("stats")
  .description("Show top 20 largest repositories")
  .action(async () => {
    statsCommand();
  });

program
  .command("analyse [repositoryName]")
  .description("Analyse image tags and group by repo, similar tag")
  .action(async (repositoryName) => {
    analyseCommand(repositoryName);
  });

program.parse();
