import { Separator } from './ui/separator';
import { Mail, Phone, MapPin } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-secondary/20 py-16">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Smart Workflow System</h3>
            <p className="text-sm text-muted-foreground">
              Advanced digital transformation solutions for modern administrative workflows 
              with AI, blockchain, and GIS integration.
            </p>
          </div>
          
          <div className="space-y-4">
            <h4 className="font-semibold">Services</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>Document Processing</li>
              <li>GIS Mapping</li>
              <li>AI Analytics</li>
              <li>Blockchain Integration</li>
              <li>AR Applications</li>
            </ul>
          </div>
          
          <div className="space-y-4">
            <h4 className="font-semibold">Technologies</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>OCR + NER</li>
              <li>Machine Learning</li>
              <li>Predictive Analytics</li>
              <li>Decision Support</li>
              <li>Mobile AR</li>
            </ul>
          </div>
          
          <div className="space-y-4">
            <h4 className="font-semibold">Contact</h4>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="w-4 h-4" />
                <span>info@smartworkflow.com</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="w-4 h-4" />
                <span>+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="w-4 h-4" />
                <span>Tech City, Innovation District</span>
              </div>
            </div>
          </div>
        </div>
        
        <Separator className="mb-8" />
        
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            © 2024 Smart Workflow System. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-foreground transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-foreground transition-colors">Support</a>
          </div>
        </div>
      </div>
    </footer>
  );
}