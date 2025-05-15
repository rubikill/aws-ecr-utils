import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "../services/api";
import type { Repository } from "../services/api";

export default function RepositoryDetail() {
  const { name } = useParams<{ name: string }>();
  const [repository, setRepository] = useState<Repository | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!name) return;
    if (loading) return;
    api
      .getRepository(name)
      .then((repo) => {
        setRepository(repo);
        setError(null);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Failed to load repository");
        setRepository(null);
      })
      .finally(() => setLoading(false));
    setLoading(true);
  }, [name]);

  if (loading) return <div className="p-4">Loading...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;
  if (!repository) return <div className="p-4">Repository not found.</div>;

  return (
    <div className="p-4">
      <div className="mb-4">
        <Link to="/repositories" className="text-blue-600 hover:underline">
          &larr; Back to Repositories
        </Link>
      </div>
      <h1 className="text-2xl font-bold mb-2">{repository.repository_name}</h1>
      <div className="mb-4 text-gray-600">{repository.repository_uri}</div>
      <div className="mb-8">Last Updated: {repository.last_updated}</div>
      <h2 className="text-xl font-semibold mb-2">Images</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white rounded shadow">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Registry id</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image digest</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image tags</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image size in bytes</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image pushed at</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image scan status</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image scan findings summary</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last recorded pull time</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {repository.images.map((img) => (
              <tr key={img.image_digest}>
                <td className="px-4 py-2 text-sm text-gray-900">{img.id}</td>
                <td className="px-4 py-2 text-sm text-gray-900">{img.registry_id}</td>
                <td className="px-4 py-2 text-sm text-gray-900">{img.image_digest}</td>
                <td className="px-4 py-2 text-sm text-gray-900">{img.image_tags}</td>
                <td className="px-4 py-2 text-sm text-gray-900">{img.image_size_in_bytes}</td>
                <td className="px-4 py-2 text-sm text-gray-900">{img.image_pushed_at}</td>
                <td className="px-4 py-2 text-sm text-gray-900">{img.image_scan_status}</td>
                <td className="px-4 py-2 text-sm text-gray-900">{img.image_scan_findings_summary}</td>
                <td className="px-4 py-2 text-sm text-gray-900">{img.last_recorded_pull_time}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
