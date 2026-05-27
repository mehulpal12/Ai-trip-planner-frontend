"use client";
import React from "react";
import { AlertCircle } from "lucide-react";
import { DeadlineTask } from "../types/dashboard.types";

export const DeadlineProgress: React.FC<{ d: DeadlineTask }> = ({ d }) => (
  <div className="space-y-1.5">
    <div className="flex justify-between items-center text-xs">
      <span className="text-slate-400">{d.label}</span>
      <span className={d.variant === "urgent" ? "text-rose-400 font-semibold flex items-center gap-1" : "text-slate-400"}>
        {d.variant === "urgent" && <AlertCircle size={12} />}
        {d.timeLeft}
      </span>
    </div>
    <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
      <div 
        className={`h-full rounded-full transition-all duration-500 ${d.variant === "urgent" ? "bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.4)]" : "bg-cyan-500"}`} 
        style={{ width: `${d.progress}%` }} 
      />
    </div>
  </div>
);