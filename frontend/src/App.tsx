import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Overview from './components/Overview';
import Chatbot from './components/Chatbot';
import FIRDrafts from './pages/FIRDrafts';
import FIRDraftPreview from './components/FIRDraftPreview';
import NewFIR from './components/NewFIR';
import DraftFIRCreation from './pages/DraftFIRCreation';
import FinalFIRView from './pages/FinalFIRView';
import EvidenceLocker from './components/EvidenceLocker';
import CaseRetrieval from './components/CaseRetrieval';
// import InspectorReview from './components/InspectorReview';
import ApprovedFIRs from './pages/ApprovedFIRs';
import InspectorDashboard from './pages/InspectorDashboard';
import Analytics from './components/Analytics';
import Notifications from './components/Notifications';
import Profile from './components/Profile';
import Settings from './components/Settings';
import AdminPanel from './components/AdminPanel';

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return !isAuthenticated ? <>{children}</> : <Navigate to="/dashboard" replace />;
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <NotificationProvider>
          <Router>
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 transition-colors">
              <Routes>
                {/* Public Routes */}
                <Route 
                  path="/login" 
                  element={
                    <PublicRoute>
                      <Login />
                    </PublicRoute>
                  } 
                />
                
                {/* Private Routes */}
                <Route 
                  path="/dashboard" 
                  element={
                    <PrivateRoute>
                      <Dashboard />
                    </PrivateRoute>
                  }
                >
                  <Route index element={<Overview />} />
                  <Route path="chatbot" element={<Chatbot />} />
                  <Route path="new-fir" element={<NewFIR />} />
                  <Route path="create-draft-fir" element={<DraftFIRCreation />} />
                  <Route path="fir-drafts" element={<FIRDrafts />} />
                  <Route path="fir-preview" element={<FIRDraftPreview />} />
                  <Route path="inspector-review" element={<InspectorDashboard />} />
                  <Route path="approved-firs" element={<ApprovedFIRs />} />
                  <Route path="final-firs" element={<FinalFIRView />} />
                  <Route path="evidence" element={<EvidenceLocker />} />
                  <Route path="cases" element={<CaseRetrieval />} />
                  <Route path="analytics" element={<Analytics />} />
                  <Route path="notifications" element={<Notifications />} />
                  <Route path="profile" element={<Profile />} />
                  <Route path="settings" element={<Settings />} />
                  <Route path="admin" element={<AdminPanel />} />
                </Route>

                {/* Default redirect */}
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </div>
          </Router>
        </NotificationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;