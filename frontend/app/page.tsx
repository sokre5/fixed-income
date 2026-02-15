"use client";

import { useState } from "react";
import { Dashboard } from "@/components/dashboard";
import { StudyNotes } from "@/components/study-notes";
import { Sidebar } from "@/components/sidebar";

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<"journal" | "study">("journal");

  return (
    <div className="flex h-screen overflow-hidden bg-terminal-black">
      <Sidebar activeTab={activeTab} onNavigate={setActiveTab} />
      <div className="flex flex-1 flex-col overflow-hidden">
        {activeTab === "journal" ? <Dashboard /> : <StudyNotes />}
      </div>
    </div>
  );
}
