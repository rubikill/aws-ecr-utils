export default function Dashboard() {
  return (
    <div className="space-y-6">
      <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium leading-6 text-gray-900">Welcome to AWS ECR Utils</h3>
          <div className="mt-2 max-w-xl text-sm text-gray-500">
            <p>Manage your AWS ECR repositories, scan for vulnerabilities, and generate reports.</p>
          </div>
          <div className="mt-5">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              <div className="bg-gray-50 overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Repositories</dt>
                  <dd className="mt-1 text-3xl font-semibold text-gray-900">0</dd>
                </div>
              </div>
              <div className="bg-gray-50 overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Images</dt>
                  <dd className="mt-1 text-3xl font-semibold text-gray-900">0</dd>
                </div>
              </div>
              <div className="bg-gray-50 overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <dt className="text-sm font-medium text-gray-500 truncate">Last Scan</dt>
                  <dd className="mt-1 text-3xl font-semibold text-gray-900">-</dd>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
