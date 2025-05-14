import { Command } from "commander";
import { scanCommand } from "./commands/scan";
import { listCommand } from "./commands/list";
import { statsCommand } from "./commands/stats";
import { analyseCommand } from "./commands/analyse";
import { suggestCommand } from "./commands/suggest";
import { reportCommand } from "./commands/report";

const program = new Command();

program.name("aws-ecr-utils").description("AWS ECR repository management and analysis tool").version("1.0.0");

// Scan command
program
  .command("scan [profile] [region]")
  .description("Scan AWS ECR repositories and store data in SQLite")
  .action(async (profile, region) => {
    scanCommand(profile, region);
  });

// List command
program.command("ls").description("List repository data from SQLite database").action(listCommand);

// Stats command
program
  .command("stats")
  .description("Show top 20 largest repositories")
  .action(async () => {
    statsCommand();
  });

// Analyse command
program
  .command("analyse [repositoryName]")
  .description("Analyse image tags and group by repo, similar tag")
  .action(async (repositoryName) => {
    analyseCommand(repositoryName);
  });

// Suggest command
program
  .command("suggest [profile] [repositoryName]")
  .description("Suggest actions for the user based on the analysis")
  .action(async (profile, repositoryName) => {
    console.log("Suggesting actions...");
    // Implement the suggest command logic here
    suggestCommand(profile, repositoryName);
  });

program
  .command("report")
  .description("Generate an HTML report with ECR statistics and cleanup suggestions")
  .option("-o, --output <path>", "Output path for the HTML report", "./ecr-report.html")
  .action((options) => reportCommand(options.output));

program.parse();
