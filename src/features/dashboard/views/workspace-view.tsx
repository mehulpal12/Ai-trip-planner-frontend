"use client";
import React from "react";
import { Sparkles } from "lucide-react";

export const WorkspaceView: React.FC = () => (
  <div className="py-16 text-center max-w-md mx-auto border border-dashed border-white/5 bg-white/[0.01] rounded-3xl p-8 backdrop-blur-md">
    <div className="h-12 w-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mx-auto text-cyan-400 mb-4 animate-pulse">
      <Sparkles size={20} />
    </div>
    <h3 className="text-base font-bold text-white mb-1">AI Guide Core Interface</h3>
    <p className="text-xs text-slate-400 leading-relaxed">
      Neural mapping frameworks are being constructed within your development node cluster. AI contextual components will go live shortly.
    </p>
  </div>
);