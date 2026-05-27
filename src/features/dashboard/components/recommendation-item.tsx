"use client";
import React from "react";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { RecommendationCard } from "../types/dashboard.types";

export const RecommendationItem: React.FC<{ rec: RecommendationCard }> = ({ rec }) => (
  <div className="flex items-center gap-4 p-3 bg-white/[0.01] hover:bg-white/[0.03] border border-white/[0.04] rounded-xl transition-all duration-200 group cursor-pointer">
    <div className="relative h-12 w-12 rounded-lg overflow-hidden flex-shrink-0 border border-white/[0.07]">
      <Image src={rec.image} alt={rec.imageAlt} fill className="object-cover transition-transform group-hover:scale-105" sizes="48px" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-slate-200 text-xs font-semibold group-hover:text-cyan-400 transition-colors truncate">{rec.title}</p>
      <p className="text-slate-500 text-[10px] mt-0.5">{rec.location}</p>
    </div>
    <ArrowUpRight size={14} className="text-slate-600 group-hover:text-cyan-400 transition-colors" />
  </div>
);