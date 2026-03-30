import React from "react";

const PanelSelector = ({ panelTabs, activePanel, onSelect }) => (
  <div className="mt-5 flex flex-wrap gap-3">
    {panelTabs.map((tab) => (
      <button
        key={tab.id}
        type="button"
        className={`rounded-2xl border px-5 py-2 text-xs font-black tracking-[0.3em] transition ${
          tab.id === activePanel
            ? "border-transparent bg-gradient-to-r from-[#F97316] to-[#D41304] text-white shadow-lg"
            : "border-white/30 bg-white/5 text-white/60 hover:text-white hover:border-white/60"
        }`}
        onClick={() => onSelect(tab.id)}
      >
        {tab.label}
      </button>
    ))}
  </div>
);

export default PanelSelector;
