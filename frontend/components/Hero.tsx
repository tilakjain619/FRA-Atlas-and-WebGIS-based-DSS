import { ImageWithFallback } from './figma/ImageWithFallback';
import { Button } from './ui/button';
import { ArrowRight, FileText, Map, Brain, Shield, Smartphone, TrendingUp } from 'lucide-react';

export function Hero() {
  return (
    <section className="relative bg-gradient-to-br from-background to-secondary/20 py-20 lg:py-32">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl lg:text-6xl font-semibold tracking-tight">
                Smart Workflow
                <br />
                <span className="text-primary">Management System</span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-lg">
                Advanced document processing, GIS mapping, AI detection, and blockchain integration 
                for modern administrative workflows.
              </p>
            </div>
            
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center gap-2 bg-secondary/50 px-3 py-2 rounded-full">
                <FileText className="w-4 h-4 text-primary" />
                <span className="text-sm">OCR + NER</span>
              </div>
              <div className="flex items-center gap-2 bg-secondary/50 px-3 py-2 rounded-full">
                <Map className="w-4 h-4 text-primary" />
                <span className="text-sm">GIS Mapping</span>
              </div>
              <div className="flex items-center gap-2 bg-secondary/50 px-3 py-2 rounded-full">
                <Brain className="w-4 h-4 text-primary" />
                <span className="text-sm">AI Detection</span>
              </div>
              <div className="flex items-center gap-2 bg-secondary/50 px-3 py-2 rounded-full">
                <Shield className="w-4 h-4 text-primary" />
                <span className="text-sm">Blockchain</span>
              </div>
            </div>
            
            <div className="flex gap-4">
              <Button size="lg" className="gap-2">
                Get Started
                <ArrowRight className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="lg">
                Learn More
              </Button>
            </div>
          </div>
          
          <div className="relative">
            <div className="relative w-full h-96 rounded-2xl overflow-hidden border border-border shadow-2xl">
              <ImageWithFallback 
                src="https://images.unsplash.com/photo-1612886652368-3dfdfa8c4cbe?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkaWdpdGFsJTIwdHJhbnNmb3JtYXRpb24lMjB0ZWNobm9sb2d5JTIwd29ya2Zsb3d8ZW58MXx8fHwxNzU4NjA2MTA3fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                alt="Digital Transformation Workflow"
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* Floating cards */}
            <div className="absolute -top-6 -right-6 bg-card border border-border rounded-xl p-4 shadow-lg">
              <div className="flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium">AR Dashboard</span>
              </div>
            </div>
            
            <div className="absolute -bottom-6 -left-6 bg-card border border-border rounded-xl p-4 shadow-lg">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium">Predictive Analytics</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}