import axios from "axios";

const API_BASE_URL = "http://localhost:3000";

export interface Repository {
  repository_name: string;
  repository_uri: string;
  created_at: string;
  last_updated: string;
  region: string;
  images: Image[];
}

export interface Image {
  id: number;
  repository_name: string;
  registry_id: string;
  image_digest: string;
  image_tags: string;
  image_size_in_bytes: number;
  image_pushed_at: string;
  image_scan_status: string;
  image_scan_findings_summary: string;
  image_manifest_media_type: string;
  artifact_media_type: string;
  last_recorded_pull_time: string;
}

export interface Stats {
  totalRepositories: number;
  totalImages: number;
  totalSize: number;
  lastScan: string;
}

export interface ScanRequest {
  profile: string;
  region: string;
}

export interface Scan {
  id: number;
  repositoryName: string | null;
  startedAt: string;
  completedAt: string;
  status: "pending" | "in_progress" | "success" | "error";
  errorMessage: string | null;
}

export const api = {
  async getRepositories(): Promise<Repository[]> {
    const response = await axios.get(`${API_BASE_URL}/repositories`);
    return response.data;
  },

  async getRepository(name: string): Promise<Repository> {
    const response = await axios.get(`${API_BASE_URL}/repositories/${name}`);
    return response.data;
  },

  async getStats(): Promise<Stats> {
    const response = await axios.get(`${API_BASE_URL}/repositories/stats`);
    return response.data;
  },

  async scanRepositories(request: ScanRequest): Promise<void> {
    await axios.post(`${API_BASE_URL}/repositories/scan`, request);
  },

  async getAllScans(): Promise<Scan[]> {
    const response = await axios.get(`${API_BASE_URL}/repositories/scans`);
    return response.data;
  },

  async getScanById(id: number): Promise<Scan> {
    const response = await axios.get(`${API_BASE_URL}/repositories/scans/${id}`);
    return response.data;
  },
};
