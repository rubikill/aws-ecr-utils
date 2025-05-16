import chalk from "chalk";
import fs from "fs";
import path from "path";
import { getInitializedDatabaseService } from "../utils/db";
import { formatBytes } from "../utils/stringFormat";

export async function reportCommand(outputPath: string = "./ecr-report.html") {
  console.log(chalk.blue("Generating ECR report..."));

  const dbService = await getInitializedDatabaseService();

  try {
    const repositories = await dbService.repositoryDataService.getAllRepositories();
    const topLargestRepositories = await dbService.imageDataService.getTopLargestRepositories();
    const topRepositoriesByImageCount = await dbService.imageDataService.getTopRepositoriesByImageCount();
    const repositoriesWithNeverPulledImages = await dbService.imageDataService.getRepositoriesWithNeverPulledImages();

    // Fetch all images to calculate total size per repository
    const allImages = (await dbService.imageDataService.getAllImages) ? await dbService.imageDataService.getAllImages() : [];
    const imageSizeByRepo: Record<string, number> = {};
    if (allImages && allImages.length > 0) {
      for (const img of allImages) {
        if (!imageSizeByRepo[img.repository_name]) imageSizeByRepo[img.repository_name] = 0;
        imageSizeByRepo[img.repository_name] += img.image_size_in_bytes || 0;
      }
    }

    const totalRepositories = repositories.length;
    const totalImages = repositories.reduce((acc, repo) => acc + (repo.image_count || 0), 0);
    const totalStorage = topLargestRepositories.reduce((acc, repo) => acc + repo.total_size, 0);

    const costPerGB = 0.1; // Storage is $0.10 per GB / month for data stored in private or public repositories.
    const estimatedCostSavings = repositoriesWithNeverPulledImages.reduce((acc, repo) => {
      return acc + (repo.image_size_in_bytes / (1024 * 1024 * 1024)) * costPerGB;
    }, 0);

    const totalStorageInGB = totalStorage / (1024 * 1024 * 1024);
    const totalCost = totalStorageInGB * costPerGB;

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>AWS ECR Report</title>
        <script src="https://cdn.tailwindcss.com"></script>
      </head>
      <body class="bg-gray-100 p-8">
        <div class="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6">
          <h1 class="text-3xl font-bold text-gray-800 mb-6">AWS ECR Report</h1>
          <h2 class="text-2xl font-semibold text-gray-700 mb-4">Summary</h2>
          <p class="text-gray-600">Total Repositories: ${totalRepositories}</p>
          <p class="text-gray-600">Total Images: ${totalImages}</p>
          <p class="text-gray-600">Total Storage: ${formatBytes(totalStorage)}</p>

          <h2 class="text-2xl font-semibold text-gray-700 mt-8 mb-4">Top Largest Repositories</h2>
          <table class="min-w-full bg-white border border-gray-300">
            <thead>
              <tr>
                <th class="py-2 px-4 border-b text-left">Repository Name</th>
                <th class="py-2 px-4 border-b text-left">Total Size</th>
                <th class="py-2 px-4 border-b text-left">Region</th>
              </tr>
            </thead>
            <tbody>
              ${topLargestRepositories
                .map(
                  (repo) => `
                <tr>
                  <td class="py-2 px-4 border-b">${repo.image_repository_name}</td>
                  <td class="py-2 px-4 border-b">${formatBytes(repo.total_size)}</td>
                  <td class="py-2 px-4 border-b">${repo.region}</td>
                </tr>
              `
                )
                .join("")}
            </tbody>
          </table>

          <h2 class="text-2xl font-semibold text-gray-700 mt-8 mb-4">Top Repositories by Image Count</h2>
          <table class="min-w-full bg-white border border-gray-300">
            <thead>
              <tr>
                <th class="py-2 px-4 border-b text-left">Repository Name</th>
                <th class="py-2 px-4 border-b text-left">Image Count</th>
                <th class="py-2 px-4 border-b text-left">Image Size (GB)</th>
                <th class="py-2 px-4 border-b text-left">Region</th>
              </tr>
            </thead>
            <tbody>
              ${topRepositoriesByImageCount
                .map(
                  (repo) => `
                <tr>
                  <td class="py-2 px-4 border-b">${repo.image_repository_name}</td>
                  <td class="py-2 px-4 border-b">${repo.image_count}</td>
                  <td class="py-2 px-4 border-b">${((imageSizeByRepo[repo.image_repository_name] || 0) / (1024 * 1024 * 1024)).toFixed(2)}</td>
                  <td class="py-2 px-4 border-b">${repo.region}</td>
                </tr>
              `
                )
                .join("")}
            </tbody>
          </table>

          <h2 class="text-2xl font-semibold text-gray-700 mt-8 mb-4">Repositories with Never Pulled Images</h2>
          <table class="min-w-full bg-white border border-gray-300">
            <thead>
              <tr>
                <th class="py-2 px-4 border-b text-left">Repository Name</th>
                <th class="py-2 px-4 border-b text-left">Image Count</th>
                <th class="py-2 px-4 border-b text-left">Image Size (GB)</th>
                <th class="py-2 px-4 border-b text-left">Region</th>
              </tr>
            </thead>
            <tbody>
              ${repositoriesWithNeverPulledImages
                .sort((a, b) => b.image_size_in_bytes - a.image_size_in_bytes)
                .map(
                  (repo) => `
                <tr>
                  <td class="py-2 px-4 border-b">${repo.image_repository_name}</td>
                  <td class="py-2 px-4 border-b">${repo.image_count}</td>
                  <td class="py-2 px-4 border-b">${((repo.image_size_in_bytes || 0) / (1024 * 1024 * 1024)).toFixed(2)}</td>
                  <td class="py-2 px-4 border-b">${repo.region}</td>
                </tr>
              `
                )
                .join("")}
            </tbody>
          </table>

          <h2 class="text-2xl font-semibold text-gray-700 mt-8 mb-4">Suggested Cleanup Actions</h2>
          <p class="text-gray-600">Estimated Cost Savings: $${estimatedCostSavings.toFixed(2)} / $${totalCost.toFixed(2)}</p>
        </div>
      </body>
      </html>
    `;

    fs.writeFileSync(outputPath, htmlContent);
    console.log(chalk.green(`Report generated successfully at ${outputPath}`));
  } catch (error) {
    console.error(chalk.red("Error generating report:"), error);
  } finally {
    await dbService.close();
  }
}
