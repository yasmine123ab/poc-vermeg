import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import DashboardPage from './pages/DashboardPage';
import FluxListPage from './pages/FluxListPage';
import FluxFormPage from './pages/FluxFormPage';
import ExecutionsPage from './pages/ExecutionsPage';
import ExecutionDetailPage from './pages/ExecutionDetailPage';

const App: React.FC = () => (
  <BrowserRouter>
    <div style={{ minHeight: '100vh', background: '#F2F2F2', fontFamily: "'Segoe UI', Arial, sans-serif" }}>
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/flux" element={<FluxListPage />} />
          <Route path="/flux/new" element={<FluxFormPage />} />
          <Route path="/flux/:id/edit" element={<FluxFormPage />} />
          <Route path="/executions" element={<ExecutionsPage />} />
          <Route path="/executions/:id" element={<ExecutionDetailPage />} />
        </Routes>
      </main>
      <Toaster
        position="top-right"
        toastOptions={{
          style: { fontFamily: "'Segoe UI', Arial, sans-serif", fontSize: '14px' },
          success: { iconTheme: { primary: '#28a745', secondary: '#fff' } },
          error: { iconTheme: { primary: '#dc3545', secondary: '#fff' } },
        }}
      />
    </div>
  </BrowserRouter>
);

export default App;
