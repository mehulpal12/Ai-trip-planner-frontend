"use client";
import React from "react";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  colorClass: string;
}

export const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, colorClass }) => (
  <div className="p-5 bg-white/[0.01] border border-white/[0.06] rounded-2xl backdrop-blur-md relative overflow-hidden group hover:border-white/10 transition-colors">
    <div className="flex justify-between items-start mb-3">
      <span className="text-[11px] font-bold tracking-wider uppercase text-slate-500">{title}</span>
      <div className={`p-2 rounded-xl ${colorClass}`}><Icon size={14} /></div>
    </div>
    <p className="text-2xl font-black text-white tracking-tight">{value}</p>
  </div>
);