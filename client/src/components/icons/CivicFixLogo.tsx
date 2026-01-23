import { Wrench } from "lucide-react";

interface CivicFixLogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
}

export const CivicFixLogo = ({ size = "md", showText = true }: CivicFixLogoProps) => {
  const sizes = {
    sm: { icon: 24, container: 40, text: "text-lg" },
    md: { icon: 32, container: 56, text: "text-xl" },
    lg: { icon: 48, container: 80, text: "text-3xl" },
  };

  const { icon, container, text } = sizes[size];

  return (
    <div className="flex items-center gap-3">
      <div
        className="flex items-center justify-center rounded-2xl bg-primary/10"
        style={{ width: container, height: container }}
      >
        <div className="relative">
          <Wrench 
            size={icon} 
            className="text-primary rotate-[-45deg]" 
            strokeWidth={2.5}
          />
          <Wrench 
            size={icon} 
            className="text-primary rotate-[45deg] absolute top-0 left-0 opacity-80" 
            strokeWidth={2.5}
          />
        </div>
      </div>
      {showText && (
        <span className={`font-display font-bold text-primary ${text}`}>
          CivicFix
        </span>
      )}
    </div>
  );
};
