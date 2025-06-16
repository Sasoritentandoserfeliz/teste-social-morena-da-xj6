import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { LocationProvider } from './contexts/LocationContext';
import { DataProvider } from './contexts/DataContext';
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { DonorDashboard } from './pages/DonorDashboard';
import { InstitutionDashboard } from './pages/InstitutionDashboard';
import { CreateDonation } from './pages/CreateDonation';
import { InstitutionProfile } from './pages/InstitutionProfile';
import { ScheduleDelivery } from './pages/ScheduleDelivery';
import { AdminDashboard } from './pages/AdminDashboard';
import { ProtectedRoute } from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <AuthProvider>
        <LocationProvider>
          <DataProvider>
            <div className="min-h-screen bg-gray-50">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/institution/:id" element={<InstitutionProfile />} />
                
                {/* Donor Routes */}
                <Route path="/donor/dashboard" element={
                  <ProtectedRoute userType="donor">
                    <DonorDashboard />
                  </ProtectedRoute>
                } />
                <Route path="/donor/create-donation" element={
                  <ProtectedRoute userType="donor">
                    <CreateDonation />
                  </ProtectedRoute>
                } />
                <Route path="/donor/schedule/:institutionId" element={
                  <ProtectedRoute userType="donor">
                    <ScheduleDelivery />
                  </ProtectedRoute>
                } />
                
                {/* Institution Routes */}
                <Route path="/institution/dashboard" element={
                  <ProtectedRoute userType="institution">
                    <InstitutionDashboard />
                  </ProtectedRoute>
                } />
                
                {/* Admin Routes */}
                <Route path="/admin/dashboard" element={
                  <ProtectedRoute userType="admin">
                    <AdminDashboard />
                  </ProtectedRoute>
                } />
              </Routes>
            </div>
          </DataProvider>
        </LocationProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;