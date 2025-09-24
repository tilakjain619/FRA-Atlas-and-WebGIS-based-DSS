'use client';

import { useState } from 'react';
import { DashboardSidebar } from '../components/dashboard/DashboardSidebar';
import { DashboardHeader } from '../components/dashboard/DashboardHeader';
import { Overview } from '../components/dashboard/workflow/Overview';
import { DocumentUpload } from '../components/dashboard/workflow/DocumentUpload';
import { OCRData } from '../components/dashboard/workflow/OCRData';
import { GISMapping } from '../components/dashboard/workflow/GISMapping';
import { AIDetection } from '../components/dashboard/workflow/AIDetection';
import { BlockchainPattas } from '../components/dashboard/workflow/BlockchainPattas';
import { DSSDashboard } from '../components/dashboard/workflow/DSSDashboard';
import { PredictiveAnalytics } from '../components/dashboard/workflow/PredictiveAnalytics';

export default function DashboardPage() {
  const [activeStep, setActiveStep] = useState('overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

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
      <div className="lg:pl-64">
        {/* Header */}
        <DashboardHeader />
        
        {/* Content */}
        <main className="p-6">
          {renderWorkflowComponent()}
        </main>
      </div>
    </div>
  );
}