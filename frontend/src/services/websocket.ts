import { io, Socket } from "socket.io-client";

interface ScanProgress {
  total: number;
  current: number;
  percentage: number;
}

interface RepositoryProgress {
  repositoryName: string;
  progress: number;
}

interface ScanError {
  message: string;
}

export type WebSocketEvent =
  | { type: "scanStart" }
  | { type: "scanProgress"; data: ScanProgress }
  | { type: "repositoryProgress"; data: RepositoryProgress }
  | { type: "scanComplete" }
  | { type: "scanError"; data: ScanError };

class WebSocketService {
  private socket: Socket | null = null;
  private listeners: Map<string, Set<(data: WebSocketEvent) => void>> = new Map();

  connect() {
    if (!this.socket) {
      this.socket = io("http://localhost:3000", {
        withCredentials: true,
      });

      this.socket.on("scanStart", () => {
        this.notifyListeners("scanStart", { type: "scanStart" });
      });

      this.socket.on("scanProgress", (data: ScanProgress) => {
        this.notifyListeners("scanProgress", { type: "scanProgress", data });
      });

      this.socket.on("repositoryProgress", (data: RepositoryProgress) => {
        this.notifyListeners("repositoryProgress", { type: "repositoryProgress", data });
      });

      this.socket.on("scanComplete", () => {
        this.notifyListeners("scanComplete", { type: "scanComplete" });
      });

      this.socket.on("scanError", (data: ScanError) => {
        this.notifyListeners("scanError", { type: "scanError", data });
      });
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  addListener(event: string, callback: (data: WebSocketEvent) => void) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)?.add(callback);
  }

  removeListener(event: string, callback: (data: WebSocketEvent) => void) {
    this.listeners.get(event)?.delete(callback);
  }

  private notifyListeners(event: string, data: WebSocketEvent) {
    this.listeners.get(event)?.forEach((callback) => callback(data));
  }
}

export const websocketService = new WebSocketService();
