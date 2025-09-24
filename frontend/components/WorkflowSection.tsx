import { WorkflowStep } from './WorkflowStep';

export function WorkflowSection() {
  const workflowSteps = [
    {
      number: 1,
      title: "Document Upload → OCR + NER",
      description: "Automated document processing with Optical Character Recognition and Named Entity Recognition for data extraction.",
      imageUrl: "https://images.unsplash.com/photo-1612886652368-3dfdfa8c4cbe?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkaWdpdGFsJTIwdHJhbnNmb3JtYXRpb24lMjB0ZWNobm9sb2d5JTIwd29ya2Zsb3d8ZW58MXx8fHwxNzU4NjA2MTA3fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
    },
    {
      number: 2,
      title: "GIS Mapping & Auto-GeoTagging",
      description: "Geographic Information System integration with automatic location tagging and spatial data management.",
      imageUrl: "https://images.unsplash.com/photo-1628158145409-9e222b56cc0b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxHSVMlMjBtYXBwaW5nJTIwdGVjaG5vbG9neXxlbnwxfHx8fDE3NTg1Mzc1OTR8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
    },
    {
      number: 3,
      title: "AI Anomaly Detection → Risk Heatmaps",
      description: "Machine learning algorithms detect anomalies and generate visual risk assessment heatmaps for decision making.",
      imageUrl: "https://images.unsplash.com/photo-1612886652368-3dfdfa8c4cbe?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkaWdpdGFsJTIwdHJhbnNmb3JtYXRpb24lMjB0ZWNobm9sb2d5JTIwd29ya2Zsb3d8ZW58MXx8fHwxNzU4NjA2MTA3fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
    },
    {
      number: 4,
      title: "Blockchain QR-linked Pattas",
      description: "Secure, immutable land records with QR code integration on blockchain technology for transparency and verification.",
      imageUrl: "https://images.unsplash.com/photo-1694219782948-afcab5c095d3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxibG9ja2NoYWluJTIwdGVjaG5vbG9neXxlbnwxfHx8fDE3NTg1MTE1MTZ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
    },
    {
      number: 5,
      title: "Officer Decision via DSS Dashboard / AR App",
      description: "Decision Support System with interactive dashboards and Augmented Reality applications for field officers.",
      imageUrl: "https://images.unsplash.com/photo-1612886652368-3dfdfa8c4cbe?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkaWdpdGFsJTIwdHJhbnNmb3JtYXRpb24lMjB0ZWNobm9sb2d5JTIwd29ya2Zsb3d8ZW58MXx8fHwxNzU4NjA2MTA3fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
    },
    {
      number: 6,
      title: "Predictive Hotspot & Policy Simulation",
      description: "Advanced analytics for predicting risk hotspots and simulating policy outcomes for proactive governance.",
      imageUrl: "https://images.unsplash.com/photo-1628158145409-9e222b56cc0b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxHSVMlMjBtYXBwaW5nJTIwdGVjaG5vbG9neXxlbnwxfHx8fDE3NTg1Mzc1OTR8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      isLast: true
    }
  ];

  return (
    <section className="py-20 lg:py-32 bg-secondary/10">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-5xl font-semibold mb-4">
            Complete Workflow Process
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Our comprehensive system integrates cutting-edge technologies to streamline 
            administrative processes from document intake to policy implementation.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
          {workflowSteps.map((step) => (
            <WorkflowStep
              key={step.number}
              number={step.number}
              title={step.title}
              description={step.description}
              imageUrl={step.imageUrl}
              isLast={step.isLast}
            />
          ))}
        </div>
      </div>
    </section>
  );
}