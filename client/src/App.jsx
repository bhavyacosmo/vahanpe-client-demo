import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';
import ErrorBoundary from './components/ErrorBoundary';

// Pages
import Login from './pages/Login';
import Home from './pages/Home';
import VehicleServices from './pages/VehicleServices';
import DrivingLicenceServices from './pages/DrivingLicenceServices';
import MyServices from './pages/MyServices';
import AdminDashboard from './pages/AdminDashboard';
import BookingSuccess from './pages/BookingSuccess';
import BookingDetails from './pages/BookingDetails';

// Layout Component to hide Navbar/Footer on Login page
const Layout = ({ children }) => {
  const location = useLocation();
  const isLoginPage = location.pathname === '/login';
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {!isLoginPage && <Navbar />}
      <main className={`flex-grow w-full flex flex-col ${!isLoginPage ? 'container mx-auto px-4' : ''}`}>
        {children}
      </main>
      {!isLoginPage && <Footer />}
    </div>
  );
};

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/" />;
  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <ScrollToTop />
        <ErrorBoundary>
          <Layout>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/vehicle-services" element={<VehicleServices />} />
              <Route path="/dl-services" element={<DrivingLicenceServices />} />

              {/* Protected Routes */}
              <Route path="/home" element={<Navigate to="/" replace />} />
              <Route path="/my-services" element={<ProtectedRoute><MyServices /></ProtectedRoute>} />
              <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />

              <Route path="/booking-success" element={<BookingSuccess />} />
              <Route path="/booking-status/:id" element={<BookingDetails />} />
            </Routes>
          </Layout>
        </ErrorBoundary>
      </Router>
    </AuthProvider>
  );
}

export default App;
