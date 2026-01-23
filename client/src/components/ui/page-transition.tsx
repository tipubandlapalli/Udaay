import { ReactNode } from "react";

interface PageTransitionProps {
  children: ReactNode;
  delay?: number;
}

export const PageTransition = ({ children, delay = 0 }: PageTransitionProps) => {
  return (
    <div 
      className="animate-fade-in"
      style={{ animationDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

export const PageSlideUp = ({ children, delay = 0 }: PageTransitionProps) => {
  return (
    <div 
      className="animate-slide-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

export const PageScaleIn = ({ children, delay = 0 }: PageTransitionProps) => {
  return (
    <div 
      className="animate-scale-in"
      style={{ animationDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};
