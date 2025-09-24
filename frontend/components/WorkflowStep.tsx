import { ImageWithFallback } from './figma/ImageWithFallback';
import { ArrowRight } from 'lucide-react';

interface WorkflowStepProps {
  number: number;
  title: string;
  description: string;
  imageUrl?: string;
  isLast?: boolean;
}

export function WorkflowStep({ number, title, description, imageUrl, isLast = false }: WorkflowStepProps) {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="relative mb-6">
        <div className="w-16 h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center mb-4 mx-auto">
          <span className="text-lg font-semibold">{number}</span>
        </div>
        {imageUrl && (
          <div className="w-48 h-32 rounded-lg overflow-hidden border border-border">
            <ImageWithFallback 
              src={imageUrl} 
              alt={title}
              className="w-full h-full object-cover"
            />
          </div>
        )}
      </div>
      
      <h3 className="text-lg font-semibold mb-2 max-w-xs">{title}</h3>
      <p className="text-muted-foreground text-sm max-w-xs leading-relaxed">{description}</p>
      
      {!isLast && (
        <div className="hidden lg:block mt-8">
          <ArrowRight className="w-6 h-6 text-muted-foreground" />
        </div>
      )}
    </div>
  );
}