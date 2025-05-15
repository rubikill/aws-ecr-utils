import { useEffect, useState } from "react";
import { api } from "../services/api";
import type { Scan } from "../services/api";

export default function ScanHistory() {
  const [scans, setScans] = useState<Scan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .getAllScans()
      .then((data) => {
        setScans(data);
        setError(null);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Failed to load scan history");
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-4">Loading...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Scan History</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white rounded shadow">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Repository</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Started At</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Completed At</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Error</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {scans.map((scan) => (
              <tr key={scan.id}>
                <td className="px-4 py-2 text-sm text-gray-900">{scan.id}</td>
                <td className="px-4 py-2 text-sm text-gray-900">{scan.repositoryName || "N/A"}</td>
                <td className="px-4 py-2 text-sm text-gray-900">{new Date(scan.startedAt).toLocaleString()}</td>
                <td className="px-4 py-2 text-sm text-gray-900">{new Date(scan.completedAt).toLocaleString()}</td>
                <td className="px-4 py-2 text-sm text-gray-900">{scan.status}</td>
                <td className="px-4 py-2 text-sm text-gray-900">{scan.errorMessage || "N/A"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
