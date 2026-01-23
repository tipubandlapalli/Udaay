import { ReactNode } from "react";
import { BottomNavigation } from "./BottomNavigation";
import { AppHeader } from "./AppHeader";

interface MobileLayoutProps {
  children: ReactNode;
  showHeader?: boolean;
  showNav?: boolean;
  showCitySelector?: boolean;
  headerTitle?: string;
}

export const MobileLayout = ({
  children,
  showHeader = true,
  showNav = true,
  showCitySelector = false,
  headerTitle,
}: MobileLayoutProps) => {
  return (
    <div className="h-screen bg-background flex flex-col max-w-md mx-auto relative overflow-hidden">
      {showHeader && (
        <AppHeader showCitySelector={showCitySelector} title={headerTitle} />
      )}
      
      <main className={`flex-1 overflow-y-auto ${showNav ? "pb-24" : "pb-0"}`}>
        {children}
      </main>

      {showNav && <BottomNavigation />}
    </div>
  );
};
