import { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export const EmptyState = ({ icon: Icon, title, description, action }: EmptyStateProps) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-6 text-center animate-fade-in">
      <div className="w-20 h-20 rounded-full bg-muted/50 flex items-center justify-center mb-4">
        <Icon size={40} className="text-muted-foreground" />
      </div>
      <h3 className="font-display font-bold text-xl text-foreground mb-2">
        {title}
      </h3>
      {description && (
        <p className="text-muted-foreground text-sm max-w-sm mb-6">
          {description}
        </p>
      )}
      {action && (
        <button
          onClick={action.onClick}
          className="btn-civic-primary px-6 py-3"
        >
          {action.label}
        </button>
      )}
    </div>
  );
};
