import React from 'react';
import { Outlet } from 'react-router-dom';
import { HeaderPlanSwitcher } from '../components/common/HeaderPlanSwitcher';
import { Sidebar } from '../components/layout/Sidebar';
import { FeatureLockModal } from '../components/common/FeatureLockModal';
import { InteractiveTutorialModal } from '../components/common/InteractiveTutorialModal';
import { VirtualAdvisorFloating } from '../components/advisor/VirtualAdvisorFloating';
import { useApp } from '../context/AppContext';

export const AppLayout: React.FC = () => {
  const { isTutorialOpen, closeTutorialModal } = useApp();

  return (
    <div className="min-h-screen bg-brand-bg flex flex-col font-sans text-brand-dark">
      {/* Top Header Plan Switcher */}
      <HeaderPlanSwitcher />

      {/* Main Container */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left Sidebar */}
        <Sidebar />

        {/* Page Content Body */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full flex flex-col justify-between">
          <div className="flex-1">
            <Outlet />
          </div>

          <footer className="mt-8 pt-4 border-t border-brand-secondary/60 text-center text-xs text-brand-brown/80">
            <p className="flex items-center justify-center gap-1">
              <span>Hilos de Amor Platform •</span>
              <a
                href="https://www.growlabs.lat"
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold text-brand-brown hover:text-brand-dark hover:underline flex items-center gap-0.5"
              >
                Diseñado por <span className="text-emerald-900 font-extrabold">Grow Labs</span> 🚀
              </a>
            </p>
          </footer>
        </main>
      </div>

      {/* Global Feature Lock Modal */}
      <FeatureLockModal />

      {/* Global Interactive Step-by-Step Tutorial Modal */}
      <InteractiveTutorialModal isOpen={isTutorialOpen} onClose={closeTutorialModal} />

      {/* Floating Virtual Advisor Assistant */}
      <VirtualAdvisorFloating />
    </div>
  );
};
