import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Header from './components/Layout/Header';
import Footer from './components/Layout/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import RoleRoute from './components/RoleRoute';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import SubmitPage from './pages/SubmitPage';
import ThomassonDetailPage from './pages/ThomassonDetailPage';
import MySubmissionsPage from './pages/MySubmissionsPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import AdminDashboard from './pages/AdminDashboard';
import './App.css';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="app">
          <Header />
          <main className="app-main">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/thomasson/:id" element={<ThomassonDetailPage />} />
              <Route
                path="/submit"
                element={
                  <ProtectedRoute>
                    <SubmitPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/my-submissions"
                element={
                  <ProtectedRoute>
                    <MySubmissionsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin"
                element={
                  <RoleRoute roles={['admin', 'moderator']}>
                    <AdminDashboard />
                  </RoleRoute>
                }
              />
            </Routes>
          </main>
          <Footer />
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}
