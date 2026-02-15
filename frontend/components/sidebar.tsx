"use client";

interface SidebarProps {
  activeTab: "journal" | "study";
  onNavigate: (tab: "journal" | "study") => void;
}

const navItems: { key: "journal" | "study"; icon: string; label: string }[] = [
  { key: "journal", icon: "📊", label: "JRNL" },
  { key: "study", icon: "📓", label: "STDY" },
];

export function Sidebar({ activeTab, onNavigate }: SidebarProps) {
  return (
    <nav className="flex w-[52px] shrink-0 flex-col items-center border-r border-terminal-border bg-terminal-dark py-2 font-mono">
      {navItems.map((item) => (
        <button
          key={item.key}
          onClick={() => onNavigate(item.key)}
          className={`mb-1 flex w-[44px] flex-col items-center gap-0.5 border px-1 py-2 text-center transition-colors ${
            activeTab === item.key
              ? "border-neon-amber bg-neon-amber/10 text-neon-amber"
              : "border-transparent text-fg-secondary hover:border-terminal-border hover:text-fg-primary"
          }`}
          type="button"
        >
          <span className="text-base leading-none">{item.icon}</span>
          <span className="text-[8px] font-bold tracking-widest">{item.label}</span>
        </button>
      ))}
    </nav>
  );
}
