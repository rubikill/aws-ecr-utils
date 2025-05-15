import { useState, useEffect } from "react";
import { useRepositories } from "../hooks/useRepositories";
import { websocketService } from "../services/websocket";
import type { WebSocketEvent } from "../services/websocket";
import type { ScanRequest } from "../hooks/useRepositories";
import { Link } from "react-router-dom";
import type { Repository } from "../services/api";

export default function Repositories() {
  const [profile, setProfile] = useState("");
  const [region, setRegion] = useState("");
  const [scanProgress, setScanProgress] = useState<{ [key: string]: number }>({});
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { repositories, stats, isLoading, scan } = useRepositories();

  useEffect(() => {
    websocketService.connect();

    const handleScanStart = () => {
      setIsScanning(true);
      setError(null);
      setScanProgress({});
    };

    const handleRepositoryProgress = (event: WebSocketEvent) => {
      if (event.type === "repositoryProgress") {
        setScanProgress((prev) => ({
          ...prev,
          [event.data.repositoryName]: event.data.progress,
        }));
      }
    };

    const handleScanComplete = () => {
      setIsScanning(false);
    };

    const handleScanError = (event: WebSocketEvent) => {
      if (event.type === "scanError") {
        setError(event.data.message);
        setIsScanning(false);
      }
    };

    websocketService.addListener("scanStart", handleScanStart);
    websocketService.addListener("repositoryProgress", handleRepositoryProgress);
    websocketService.addListener("scanComplete", handleScanComplete);
    websocketService.addListener("scanError", handleScanError);

    return () => {
      websocketService.removeListener("scanStart", handleScanStart);
      websocketService.removeListener("repositoryProgress", handleRepositoryProgress);
      websocketService.removeListener("scanComplete", handleScanComplete);
      websocketService.removeListener("scanError", handleScanError);
      websocketService.disconnect();
    };
  }, []);

  const handleScan = async () => {
    if (!profile || !region) {
      setError("Please enter both AWS profile and region");
      return;
    }

    try {
      const request: ScanRequest = { profile, region };
      await scan(request);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    }
  };

  if (isLoading) {
    return <div className="p-4">Loading...</div>;
  }

  return (
    <div className="p-4">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-4">AWS ECR Repositories</h1>
        <div className="flex gap-4 mb-4">
          <input type="text" placeholder="AWS Profile" value={profile} onChange={(e) => setProfile(e.target.value)} className="border p-2 rounded" />
          <input type="text" placeholder="AWS Region" value={region} onChange={(e) => setRegion(e.target.value)} className="border p-2 rounded" />
          <button onClick={handleScan} disabled={isScanning} className="bg-blue-500 text-white px-4 py-2 rounded disabled:bg-gray-400">
            {isScanning ? "Scanning..." : "Scan Repositories"}
          </button>
        </div>
        {error && <div className="text-red-500 mb-4">{error}</div>}
        {stats && (
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="bg-white p-4 rounded shadow">
              <h3 className="font-bold">Total Repositories</h3>
              <p className="text-2xl">{stats.totalRepositories}</p>
            </div>
            <div className="bg-white p-4 rounded shadow">
              <h3 className="font-bold">Total Images</h3>
              <p className="text-2xl">{stats.totalImages}</p>
            </div>
            <div className="bg-white p-4 rounded shadow">
              <h3 className="font-bold">Total Size</h3>
              <p className="text-2xl">{stats.totalSize} MB</p>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white rounded shadow overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">URI</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Images</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Updated</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Progress</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {repositories?.map((repo: Repository) => (
              <tr key={repo.repository_name}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Link to={`/repositories/${repo.repository_name}`} className="text-blue-600 hover:underline text-sm font-medium">
                    {repo.repository_name}
                  </Link>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">{repo.repository_uri}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">{repo.last_updated}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {scanProgress[repo.repository_name] !== undefined && (
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${scanProgress[repo.repository_name]}%` }}></div>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
