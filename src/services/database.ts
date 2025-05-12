import sqlite3 from "sqlite3";
import { Database } from "sqlite3";
import * as fs from "fs";
import { RepositoryDataService } from "./repositoryDataService";
import { ImageDataService } from "./imageDataService";
import { ErrorDataService } from "./errorDataService";
import { DataSource } from "typeorm";
import { Image } from "../models/image";
import { Repository } from "../models/repository";
import { Error } from "../models/error";

export class DatabaseService {
  private dataSource: DataSource;
  public repositoryDataService: RepositoryDataService;
  public imageDataService: ImageDataService;
  public errorDataService: ErrorDataService;

  constructor() {
    this.dataSource = new DataSource({
      type: "sqlite",
      database: "ecr-repos.db",
      synchronize: true,
      entities: [Image, Repository, Error],
    });

    this.repositoryDataService = new RepositoryDataService(this.dataSource);
    this.imageDataService = new ImageDataService(this.dataSource);
    this.errorDataService = new ErrorDataService(this.dataSource);

    this.initializeDatabase();
  }

  private async initializeDatabase(): Promise<void> {
    await this.dataSource.initialize();
    console.log("Data Source has been initialized!");
  }

  async close(): Promise<void> {
    await this.dataSource.destroy();
  }
}
