'use client';

import { useState } from 'react';
import { DashboardSidebar } from '../../components/dashboard/DashboardSidebar';
import { DashboardHeader } from '../../components/dashboard/DashboardHeader';
import { Overview } from '../../components/dashboard/workflow/Overview';
import { DocumentUpload } from '../../components/dashboard/workflow/DocumentUpload';
import { OCRData } from '../../components/dashboard/workflow/OCRData';
import { GISMapping } from '../../components/dashboard/workflow/GISMapping';
import { AIDetection } from '../../components/dashboard/workflow/AIDetection';
import { BlockchainPattas } from '../../components/dashboard/workflow/BlockchainPattas';
import { DSSDashboard } from '../../components/dashboard/workflow/DSSDashboard';
import { PredictiveAnalytics } from '../../components/dashboard/workflow/PredictiveAnalytics';
import { useUser, UserButton } from '@clerk/nextjs';
import { redirect } from 'next/navigation';

export default function DashboardPage() {
  const { isSignedIn, isLoaded } = useUser();
  const [activeStep, setActiveStep] = useState('overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Wait for user to load
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to home if not signed in
  if (!isSignedIn) {
    redirect('/');
  }

  const renderWorkflowComponent = () => {
    switch (activeStep) {
      case 'overview':
        return <Overview />;
      case 'upload':
        return <DocumentUpload />;
      case 'ocr':
        return <OCRData />;
      case 'gis':
        return <GISMapping />;
      case 'ai':
        return <AIDetection />;
      case 'blockchain':
        return <BlockchainPattas />;
      case 'dss':
        return <DSSDashboard />;
      case 'predictive':
        return <PredictiveAnalytics />;
      default:
        return <Overview />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <DashboardSidebar 
        activeStep={activeStep} 
        onStepChange={setActiveStep}
      />
      
      {/* Main Content */}
      <div className={`transition-all duration-300 ${sidebarCollapsed ? 'ml-16' : 'ml-64'}`}>
        <DashboardHeader 
          userButton={<UserButton afterSignOutUrl="/" />}
        />
        
        {/* Workflow Content */}
        <main className="p-6">
          {renderWorkflowComponent()}
        </main>
      </div>
    </div>
  );
}