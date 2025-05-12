import sqlite3 from "sqlite3";
import { Database } from "sqlite3";

export class DatabaseService {
  private db: Database;

  constructor() {
    this.db = new sqlite3.Database("ecr-repos.db");
    this.initializeDatabase();
  }

  private initializeDatabase(): void {
    this.db.serialize(() => {
      this.db.run(`DROP TABLE IF EXISTS images`);
      this.db.run(`
        CREATE TABLE IF NOT EXISTS repositories (
          repository_name TEXT PRIMARY KEY,
          repository_uri TEXT,
          created_at TEXT,
          last_updated TEXT,
          region TEXT
        )
      `);

      this.db.run(`
        CREATE TABLE IF NOT EXISTS images (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          repository_name TEXT,
          registry_id TEXT,
          image_digest TEXT,
          image_tags TEXT,
          image_size_in_bytes INTEGER,
          image_pushed_at TEXT,
          image_scan_status TEXT,
          image_scan_findings_summary TEXT,
          image_manifest_media_type TEXT,
          artifact_media_type TEXT,
          last_recorded_pull_time TEXT,
          UNIQUE(repository_name, image_digest)
        )
      `);
      this.db.run(`
        CREATE TABLE IF NOT EXISTS errors (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          repository_name TEXT,
          error_message TEXT,
          timestamp TEXT
        )
      `);
    });
  }

  async saveRepository(data: { repositoryName: string; repositoryUri: string; createdAt: string; lastUpdated: string; region: string }): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.run(
        `INSERT INTO repositories (repository_name, repository_uri, created_at, last_updated, region)
      VALUES (?, ?, ?, ?, ?)
      ON CONFLICT(repository_name) DO UPDATE SET
        repository_uri = excluded.repository_uri,
        created_at = excluded.created_at,
        last_updated = excluded.last_updated,
        region = excluded.region`,
        [data.repositoryName, data.repositoryUri, data.createdAt, data.lastUpdated, data.region],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });
  }

  async getAllRepositories(): Promise<any[]> {
    return new Promise((resolve, reject) => {
      this.db.all("SELECT * FROM repositories", (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  async saveImage(data: {
    repositoryName: string;
    registryId: string;
    imageDigest: string;
    imageTags: string;
    imageSizeInBytes: number;
    imagePushedAt: string;
    imageScanStatus: string;
    imageScanFindingsSummary: string;
    imageManifestMediaType: string;
    artifactMediaType: string;
    lastRecordedPullTime: string;
  }): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.run(
        `INSERT INTO images (repository_name, registry_id, image_digest, image_tags, image_size_in_bytes, image_pushed_at, image_scan_status, image_scan_findings_summary, image_manifest_media_type, artifact_media_type, last_recorded_pull_time)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(repository_name, image_digest) DO UPDATE SET
        registry_id = excluded.registry_id,
        image_tags = excluded.image_tags,
        image_size_in_bytes = excluded.image_size_in_bytes,
        image_pushed_at = excluded.image_pushed_at,
        image_scan_status = excluded.image_scan_status,
        image_scan_findings_summary = excluded.image_scan_findings_summary,
        image_manifest_media_type = excluded.image_manifest_media_type,
        artifact_media_type = excluded.artifact_media_type,
        last_recorded_pull_time = excluded.last_recorded_pull_time`,
        [
          data.repositoryName,
          data.registryId,
          data.imageDigest,
          data.imageTags,
          data.imageSizeInBytes,
          data.imagePushedAt,
          data.imageScanStatus,
          data.imageScanFindingsSummary,
          data.imageManifestMediaType,
          data.artifactMediaType,
          data.lastRecordedPullTime,
        ],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });
  }

  async getTop20LargestRepositories(): Promise<any[]> {
    return new Promise((resolve, reject) => {
      this.db.all(
        `SELECT r.repository_name, COUNT(i.image_digest) AS image_count
        FROM repositories r
        JOIN images i ON r.repository_name = i.repository_name
        GROUP BY r.repository_name
        ORDER BY image_count DESC
        LIMIT 20`,
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    });
  }

  async getImageTagsByRepo(repositoryName?: string): Promise<{ [repositoryName: string]: string[] }> {
    return new Promise((resolve, reject) => {
      let query = `SELECT repository_name, GROUP_CONCAT(image_tag) AS image_tags
        FROM images`;
      if (repositoryName) {
        query += ` WHERE repository_name = ?`;
      }
      query += ` GROUP BY repository_name`;

      this.db.all(query, repositoryName ? [repositoryName] : [], (err, rows: { repository_name: string; image_tags: string }[]) => {
        if (err) {
          reject(err);
          return;
        }

        const imageTagsByRepo: { [repositoryName: string]: string[] } = {};
        rows.forEach((row) => {
          imageTagsByRepo[row.repository_name] = row.image_tags ? row.image_tags.split(",") : [];
        });

        resolve(imageTagsByRepo);
      });
    });
  }

  async saveError(repositoryName: string, errorMessage: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.run(
        `INSERT INTO errors (repository_name, error_message, timestamp)
      VALUES (?, ?, ?)`,
        [repositoryName, errorMessage, new Date().toISOString()],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });
  }

  async repositoryExistsAndHasImages(repositoryName: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.db.get(`SELECT COUNT(*) FROM images WHERE repository_name = ?`, [repositoryName], (err, row: any) => {
        if (err) {
          reject(err);
        } else {
          resolve(row["COUNT(*)"] > 0);
        }
      });
    });
  }

  close(): void {
    this.db.close();
  }
}
