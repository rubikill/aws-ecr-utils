import { DatabaseService } from "../services/database";

export async function getInitializedDatabaseService(): Promise<DatabaseService> {
  const dbService = new DatabaseService();
  await dbService.initialize();
  return dbService;
}
