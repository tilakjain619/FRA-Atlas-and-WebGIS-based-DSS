import { Card } from './ui/card';
import { FileText, Map, Brain, Shield, Smartphone, TrendingUp, Database, Globe } from 'lucide-react';

export function TechnologyStack() {
  const technologies = [
    {
      icon: FileText,
      name: "OCR + NER",
      description: "Advanced text recognition and entity extraction",
      features: ["Document Processing", "Data Extraction", "Text Analysis"]
    },
    {
      icon: Map,
      name: "GIS Mapping",
      description: "Geographic information systems integration",
      features: ["Spatial Analysis", "Auto-GeoTagging", "Location Services"]
    },
    {
      icon: Brain,
      name: "AI Detection",
      description: "Machine learning anomaly detection",
      features: ["Pattern Recognition", "Risk Assessment", "Automated Analysis"]
    },
    {
      icon: Shield,
      name: "Blockchain",
      description: "Secure, immutable record keeping",
      features: ["Data Integrity", "QR Integration", "Transparency"]
    },
    {
      icon: Smartphone,
      name: "AR Dashboard",
      description: "Augmented reality field applications",
      features: ["Mobile Interface", "Real-time Data", "Field Operations"]
    },
    {
      icon: TrendingUp,
      name: "Predictive Analytics",
      description: "Policy simulation and forecasting",
      features: ["Trend Analysis", "Policy Modeling", "Risk Prediction"]
    },
    {
      icon: Database,
      name: "DSS Platform",
      description: "Decision support system integration",
      features: ["Data Integration", "Analytics Dashboard", "Report Generation"]
    },
    {
      icon: Globe,
      name: "Web Integration",
      description: "Cross-platform accessibility",
      features: ["Cloud Platform", "API Integration", "Multi-device Support"]
    }
  ];

  return (
    <section className="py-20 lg:py-32">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-5xl font-semibold mb-4">
            Technology Stack
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Powered by cutting-edge technologies and advanced algorithms to deliver 
            reliable, scalable, and secure workflow management solutions.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {technologies.map((tech, index) => {
            const IconComponent = tech.icon;
            return (
              <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <IconComponent className="w-6 h-6 text-primary" />
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="font-semibold">{tech.name}</h3>
                    <p className="text-sm text-muted-foreground">{tech.description}</p>
                  </div>
                  
                  <div className="space-y-1">
                    {tech.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="text-xs bg-secondary/50 px-2 py-1 rounded">
                        {feature}
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}