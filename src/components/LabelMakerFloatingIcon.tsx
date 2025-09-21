"use client";

import { useState } from "react";
import { FileText } from "lucide-react";
import LabelMakerAgentModal from "./LabelMakerAgentModal";

export default function LabelMakerFloatingIcon() {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      {/* Floating sticky icon */}
      <button
        onClick={() => setModalOpen(true)}
        className="fixed bottom-6 left-6 z-50 bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-xl transition-all duration-200 hover:scale-105 group"
        aria-label="Open LabelMaker Agent"
      >
        <FileText className="w-6 h-6" />
        
        {/* Tooltip */}
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
          LabelMaker Agent
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
        </div>
      </button>

      {/* Modal */}
      <LabelMakerAgentModal open={modalOpen} onOpenChange={setModalOpen} />
    </>
  );
}
