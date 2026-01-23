import { useState } from "react";
import { Bell, CheckCircle2, Clock, MapPin, TrendingUp, ChevronRight, Play, LayoutDashboard, FileText, BarChart3, User } from "lucide-react";
import { CivicFixLogo } from "@/components/icons/CivicFixLogo";

const navItems = [
  { icon: LayoutDashboard, label: "Dash", active: true },
  { icon: FileText, label: "Tasks", active: false },
  { icon: BarChart3, label: "Stats", active: false },
  { icon: User, label: "Profile", active: false },
];

const tasks = [
  {
    id: 1,
    ticketId: "#TSK-8821",
    title: "Broken Streetlight - Sector 4",
    location: "Near Metro Pillar 42, Sector 4",
    priority: "high",
    assignedTime: "2h ago",
    status: "pending",
  },
  {
    id: 2,
    ticketId: "#TSK-9012",
    title: "Garbage Collection - Main Road",
    location: "Commercial Area, Block C",
    priority: "medium",
    assignedTime: "4h ago",
    status: "pending",
  },
];

const OfficerDashboard = () => {
  const [activeNav, setActiveNav] = useState("Dash");

  return (
    <div className="min-h-screen bg-background flex flex-col max-w-md mx-auto">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <img 
              src="/logo_png.png" 
              alt="Udaay" 
              className="h-10 w-10 object-contain"
            />
            <span className="font-display font-semibold">Udaay Officer</span>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative p-2 rounded-full hover:bg-muted transition-colors">
              <Bell size={22} className="text-muted-foreground" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full" />
            </button>
            <button 
              onClick={() => navigate('/profile')}
              className="relative w-9 h-9 rounded-full bg-gradient-to-br from-primary/20 to-success/20 p-0.5 hover:shadow-xl transition-all hover:scale-105 active:scale-95"
            >
              <div className="w-full h-full rounded-full bg-gradient-to-br from-primary/30 to-success/30 flex items-center justify-center">
                {user?.profilePicture ? (
                  <img
                    src={user.profilePicture}
                    alt={user?.name || 'Officer'}
                    className="w-8 h-8 rounded-full object-cover border-2 border-background"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center border-2 border-background text-white font-bold text-xs">
                    {user?.name?.charAt(0)?.toUpperCase() || 'O'}
                  </div>
                )}
              </div>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-4 py-6 pb-24">
        {/* Welcome Section */}
        <div className="mb-6">
          <h1 className="font-display font-bold text-2xl text-foreground mb-1">
            Officer Dashboard
          </h1>
          <p className="text-muted-foreground">
            Welcome back, Officer Sharma. Review and act on pending infrastructure requests.
          </p>
        </div>

        {/* Efficiency Score */}
        <div className="card-civic-elevated mb-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-success font-medium tracking-wider uppercase mb-2">
                Efficiency Score
              </p>
              <div className="flex items-baseline gap-2">
                <span className="font-display font-bold text-4xl text-foreground">92%</span>
                <span className="text-success text-sm font-medium flex items-center gap-1">
                  <TrendingUp size={14} />
                  +5%
                </span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
              <CheckCircle2 size={24} className="text-success" />
            </div>
          </div>
          <div className="mt-4 progress-civic">
            <div className="progress-civic-fill bg-success" style={{ width: "92%" }} />
          </div>
        </div>

        {/* Tickets Resolved */}
        <div className="card-civic-elevated mb-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-muted-foreground tracking-wider uppercase mb-2">
                Tickets Resolved
              </p>
              <div className="flex items-baseline gap-2">
                <span className="font-display font-bold text-4xl text-foreground">45</span>
                <span className="text-success text-sm font-medium flex items-center gap-1">
                  <TrendingUp size={14} />
                  +12%
                </span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">Compared to last 7 days</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <CheckCircle2 size={24} className="text-primary opacity-30" />
            </div>
          </div>
        </div>

        {/* Assigned Tasks */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-semibold text-lg">Assigned Tasks</h2>
            <button className="text-primary text-sm font-medium flex items-center gap-1">
              View All <ChevronRight size={16} />
            </button>
          </div>

          <div className="space-y-4">
            {tasks.map((task) => (
              <div key={task.id} className="card-civic-elevated">
                <div className="flex items-start gap-3">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    task.priority === "high" 
                      ? "bg-destructive/10" 
                      : "bg-warning/10"
                  }`}>
                    <Clock size={20} className={
                      task.priority === "high" 
                        ? "text-destructive" 
                        : "text-warning"
                    } />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs font-semibold uppercase tracking-wider ${
                        task.priority === "high" 
                          ? "badge-priority-high" 
                          : "badge-priority-medium"
                      }`}>
                        {task.priority} priority
                      </span>
                      <span className="text-xs text-muted-foreground">{task.ticketId}</span>
                    </div>
                    <h3 className="font-semibold text-foreground mb-1">{task.title}</h3>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <MapPin size={14} />
                      <span>{task.location}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                  <span className="text-sm text-muted-foreground">
                    Assigned {task.assignedTime}
                  </span>
                  <button className="btn-civic-primary px-5 py-2.5 text-sm gap-2">
                    <Play size={14} />
                    Start Work
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-background border-t border-border max-w-md mx-auto">
        <div className="flex items-center justify-around py-2">
          {navItems.map((item, index) => {
            const isCenter = index === 2;
            if (isCenter) {
              return (
                <div key={item.label} className="flex flex-col items-center">
                  <button className="bottom-nav-fab -mt-6">
                    <span className="text-2xl">+</span>
                  </button>
                </div>
              );
            }
            return (
              <button
                key={item.label}
                onClick={() => setActiveNav(item.label)}
                className={`bottom-nav-item ${item.active ? "active" : ""}`}
              >
                <item.icon size={22} strokeWidth={item.active ? 2.5 : 2} />
                <span className="text-xs font-medium">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

export default OfficerDashboard;
