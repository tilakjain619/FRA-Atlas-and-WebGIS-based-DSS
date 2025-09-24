import { useState } from 'react';
import { 
  Upload, 
  FileText, 
  Map, 
  Brain, 
  Shield, 
  Monitor, 
  TrendingUp, 
  Menu,
  X,
  Home
} from 'lucide-react';
import { Button } from '../ui/button';
import { cn } from '../ui/utils';

interface SidebarProps {
  activeStep: string;
  onStepChange: (step: string) => void;
}

export function DashboardSidebar({ activeStep, onStepChange }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const workflowSteps = [
    { id: 'overview', icon: Home, label: 'Overview', color: 'text-blue-600' },
    { id: 'upload', icon: Upload, label: 'Document Upload', color: 'text-blue-600' },
    // { id: 'ocr', icon: FileText, label: 'OCR + NER Data', color: 'text-purple-600' },
    { id: 'gis', icon: Map, label: 'GIS Mapping', color: 'text-green-600' },
    { id: 'ai', icon: Brain, label: 'AI Detection', color: 'text-orange-600' },
    { id: 'blockchain', icon: Shield, label: 'Blockchain Pattas', color: 'text-indigo-600' },
    { id: 'dss', icon: Monitor, label: 'DSS Dashboard', color: 'text-red-600' },
    { id: 'predictive', icon: TrendingUp, label: 'Predictive Analytics', color: 'text-teal-600' }
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {!isCollapsed && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsCollapsed(true)}
        />
      )}
      
      {/* Sidebar */}
      <aside className={cn(
        "fixed left-0 top-0 z-50 h-full bg-white border-r border-gray-200 transition-all duration-300",
        isCollapsed ? "-translate-x-full lg:translate-x-0 lg:w-16" : "w-64"
      )}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          {!isCollapsed && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-semibold text-sm">LG</span>
              </div>
              <span className="font-semibold text-gray-900">Land Governance</span>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="lg:hidden"
          >
            {isCollapsed ? <Menu className="w-4 h-4" /> : <X className="w-4 h-4" />}
          </Button>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2">
          {workflowSteps.map((step) => {
            const IconComponent = step.icon;
            const isActive = activeStep === step.id;
            
            return (
              <button
                key={step.id}
                onClick={() => {
                  onStepChange(step.id);
                  if (window.innerWidth < 1024) setIsCollapsed(true);
                }}
                className={cn(
                  "w-full flex cursor-pointer items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all duration-200",
                  isActive 
                    ? "bg-primary text-white shadow-md" 
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                )}
              >
                <IconComponent className={cn(
                  "w-5 h-5 flex-shrink-0",
                  isActive ? "text-white" : step.color
                )} />
                {!isCollapsed && (
                  <span className="font-medium text-sm truncate">{step.label}</span>
                )}
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Mobile Menu Button */}
      {isCollapsed && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsCollapsed(false)}
          className="lg:hidden fixed top-4 left-4 z-50 bg-white shadow-lg"
        >
          <Menu className="w-4 h-4" />
        </Button>
      )}
    </>
  );
}