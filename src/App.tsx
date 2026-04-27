/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Header } from "./components/Header";
import { Dashboard } from "./components/Dashboard";
import { Reports } from "./components/Reports";
import { History } from "./components/History";
import { UnitShipping } from "./components/UnitShipping";
import { PrintView } from "./components/PrintView";
import { PrintShipping } from "./components/PrintShipping";
import { Login } from "./components/Login";

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const auth = localStorage.getItem("isAuthenticated");
    setIsAuthenticated(auth === "true");
  }, []);

  const handleLogin = () => setIsAuthenticated(true);
  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    setIsAuthenticated(false);
  };

  if (isAuthenticated === null) return null;

  if (!isAuthenticated) {
    return (
      <Router>
        <Routes>
          <Route path="/login" element={<Login onLogin={handleLogin} />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    );
  }

  return (
    <Router>
      <div className="bg-surface-bright font-body-md text-on-surface antialiased min-h-[100dvh] flex flex-col overflow-hidden print:bg-white">
        <Header onLogout={handleLogout} />
        <div className="flex flex-1 overflow-hidden h-full pt-16 print:pt-0">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/relatorios" element={<Reports />} />
            <Route path="/historico" element={<History />} />
            <Route path="/envio-unidades" element={<UnitShipping />} />
            <Route path="/impressao" element={<PrintView />} />
            <Route path="/impressao-envio" element={<PrintShipping />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}
