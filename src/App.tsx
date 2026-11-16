/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { LandingView } from './views/LandingView';
import { LoginView } from './views/LoginView';
import { DashboardView } from './views/DashboardView';
import { DesafiosView } from './views/DesafiosView';
import { QuadrasView } from './views/QuadrasView';
import { MeusJogosView } from './views/MeusJogosView';
import { PerfilView } from './views/PerfilView';
import { CreateChallengeModal } from './components/modals/CreateChallengeModal';
import { ChallengeDetailModal } from './components/modals/ChallengeDetailModal';
import { CreateCourtModal } from './components/modals/CreateCourtModal';
import { ScheduleMatchModal } from './components/modals/ScheduleMatchModal';
import { Toast } from './components/ui/Toast';

const MainContent: React.FC = () => {
  const { currentView, isAuthenticated, isLoading } = useApp();

  // Full-width views (Landing and Auth)
  if (currentView === 'index') {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 w-full">
        <LandingView />
      </div>
    );
  }

  if (currentView === 'login') {
    return <LoginView />;
  }

  // Protected admin routes require real MySQL authentication
  const requiresAuth =
    currentView === 'dashboard' || currentView === 'meus-jogos' || currentView === 'perfil';

  if (requiresAuth && !isLoading && !isAuthenticated) {
    return <LoginView />;
  }

  // Public browsing of Times & Quadras when logged out (no sidebar)
  if (!isAuthenticated) {
    return (
      <main className="max-w-7xl mx-auto w-full flex-1 p-4 sm:p-6 lg:p-8 min-w-0">
        {currentView === 'desafios' && <DesafiosView />}
        {currentView === 'quadras' && <QuadrasView />}
      </main>
    );
  }

  // Authenticated Dashboard layout with Sidebar
  return (
    <div className="flex flex-col lg:flex-row max-w-7xl mx-auto w-full flex-1">
      <Sidebar />
      <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0">
        {currentView === 'dashboard' && <DashboardView />}
        {currentView === 'desafios' && <DesafiosView />}
        {currentView === 'quadras' && <QuadrasView />}
        {currentView === 'meus-jogos' && <MeusJogosView />}
        {currentView === 'perfil' && <PerfilView />}
      </main>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col font-sans transition-colors">
        <Navbar />
        <div className="flex-1 flex flex-col">
          <MainContent />
        </div>

        {/* Global Modals & Notifications */}
        <CreateChallengeModal />
        <ChallengeDetailModal />
        <CreateCourtModal />
        <ScheduleMatchModal />
        <Toast />
      </div>
    </AppProvider>
  );
}
