import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
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
import About from './pages/About';
import Help from './pages/Help';
import Promote from './pages/Promote';
import PrivacyPolicy from './pages/PrivacyPolicy';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/about" element={<About />} />
        <Route path="/help" element={<Help />} />
        <Route path="/promote" element={<Promote />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Layout>
              <Dashboard />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/releases" element={
          <ProtectedRoute>
            <Layout>
              <Releases />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/releases/new" element={
          <ProtectedRoute>
            <Layout>
              <NewRelease />
            </Layout>
          </ProtectedRoute>
        } />
        {/* Add more routes as we create them */}
        <Route path="/analytics" element={
          <ProtectedRoute>
            <Layout>
              <Analytics />
            </Layout>
          </ProtectedRoute>
        } />

        <Route path="/revenue" element={
          <ProtectedRoute>
            <Layout>
              <Revenue />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/settings" element={
          <ProtectedRoute>
            <Layout>
              <Settings />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/support" element={
          <ProtectedRoute>
            <Layout>
              <Support />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/admin" element={
          <ProtectedRoute adminOnly>
            <Layout>
              <AdminDashboard />
            </Layout>
          </ProtectedRoute>
        } />
      </Routes>
    </Router>
  );
}

export default App;
