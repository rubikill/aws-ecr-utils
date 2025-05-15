import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Repositories from "./pages/Repositories";
import RepositoryDetail from "./pages/RepositoryDetail";
import ScanHistory from "./pages/ScanHistory";

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Repositories />} />
          <Route path="/repositories" element={<Repositories />} />
          <Route path="/repositories/:name" element={<RepositoryDetail />} />
          <Route path="/scans" element={<ScanHistory />} />
          <Route path="/scan" element={<div>Scan Page</div>} />
          <Route path="/reports" element={<div>Reports Page</div>} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
