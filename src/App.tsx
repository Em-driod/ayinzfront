import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import Releases from './pages/Releases';
import Pricing from './pages/Pricing';
import NewRelease from './pages/NewRelease';
import Analytics from './pages/Analytics';
import AdminDashboard from './pages/AdminDashboard';
import Revenue from './pages/Revenue';
import Settings from './pages/Settings';
import Support from './pages/Support';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/dashboard" element={
          <Layout>
            <Dashboard />
          </Layout>
        } />
        <Route path="/releases" element={
          <Layout>
            <Releases />
          </Layout>
        } />
        <Route path="/releases/new" element={
          <Layout>
            <NewRelease />
          </Layout>
        } />
        {/* Add more routes as we create them */}
        <Route path="/analytics" element={
          <Layout>
            <Analytics />
          </Layout>
        } />

        <Route path="/revenue" element={
          <Layout>
            <Revenue />
          </Layout>
        } />
        <Route path="/settings" element={
          <Layout>
            <Settings />
          </Layout>
        } />
        <Route path="/support" element={
          <Layout>
            <Support />
          </Layout>
        } />
        <Route path="/admin" element={
          <Layout>
            <AdminDashboard />
          </Layout>
        } />
      </Routes>
    </Router>
  );
}

export default App;
