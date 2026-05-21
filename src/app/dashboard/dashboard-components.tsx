"use client";

import React from "react";
import Image from "next/image";
import { motion, Variants } from "framer-motion";
import { Star, AlertCircle, ArrowUpRight } from "lucide-react";
import { Trip, Activity, Recommendation, Deadline } from "./dashboard.types";

const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.94 },
  visible: (i: number) => ({
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, delay: i * 0.07, ease: [0.22, 1, 0.36, 1] },
  }),
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] },
  }),
};

export const AuroraBackground: React.FC = () => (
  <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
    <div className="absolute -top-1/2 left-1/2 -translate-x-1/2 h-[900px] w-[900px] rounded-full bg-cyan-500/[0.06] blur-[120px]" />
    <div className="absolute top-1/3 -left-1/4 h-[600px] w-[600px] rounded-full bg-sky-600/[0.05] blur-[100px]" />
    <div className="absolute bottom-0 right-0 h-[500px] w-[500px] rounded-full bg-indigo-600/[0.04] blur-[100px]" />
    <motion.div
      className="absolute top-24 left-1/2 -translate-x-1/2 h-[700px] w-[700px] rounded-full border border-cyan-400/[0.04]"
      animate={{ rotate: 360 }}
      transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
    />
    <div
      className="absolute inset-0 opacity-[0.03]"
      style={{
        backgroundImage: "linear-gradient(rgba(0,209,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(0,209,255,0.8) 1px, transparent 1px)",
        backgroundSize: "72px 72px",
      }}
    />
  </div>
);

export const SideNavItem: React.FC<{
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  danger?: boolean;
  onClick?: () => void;
}> = ({ icon, label, active, danger, onClick }) => (
  <motion.button
    onClick={onClick}
    whileHover={{ x: 3 }}
    whileTap={{ scale: 0.97 }}
    className={[
      "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer text-left",
      active
        ? "bg-cyan-500/15 text-cyan-300 border border-cyan-500/20"
        : danger
        ? "text-slate-400 hover:text-red-400 hover:bg-red-500/10"
        : "text-slate-400 hover:text-slate-200 hover:bg-white/5",
    ].join(" ")}
  >
    <span className={active ? "text-cyan-400" : ""}>{icon}</span>
    <span className="flex-1">{label}</span>
    {active && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-cyan-400 shadow-[0_0_6px_rgba(0,209,255,0.8)]" />}
  </motion.button>
);

export const StatCard: React.FC<{
  icon: React.ReactNode;
  iconColor: string;
  label: string;
  value: string;
  sub: string;
  subIcon?: React.ReactNode;
  delay: number;
}> = ({ icon, iconColor, label, value, sub, subIcon, delay }) => (
  <motion.div
    variants={scaleIn}
    custom={delay}
    initial="hidden"
    animate="visible"
    className="relative overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.03] backdrop-blur-xl p-6 group hover:border-cyan-500/20 hover:bg-white/[0.05] transition-all duration-300 transform-gpu"
  >
    <span className={`mb-3 inline-flex ${iconColor}`}>{icon}</span>
    <p className="text-xs uppercase tracking-widest text-slate-500 font-medium mb-1">{label}</p>
    <p className="text-4xl font-bold text-white tracking-tight">{value}</p>
    <div className="mt-4 flex items-center gap-1.5 text-slate-400 text-sm">
      {subIcon && <span className="flex-shrink-0">{subIcon}</span>}
      <span>{sub}</span>
    </div>
  </motion.div>
);

export const TripCard: React.FC<{ trip: Trip; delay: number }> = ({ trip, delay }) => {
  // Check if this card represents the above-the-fold primary LCP asset
  const isLcpAsset = trip.id === "iceland";

  return (
    <motion.div
      variants={scaleIn}
      custom={delay}
      initial="hidden"
      animate="visible"
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="group relative rounded-2xl overflow-hidden border border-white/[0.07] bg-white/[0.03] backdrop-blur-xl cursor-pointer hover:border-cyan-500/20 transition-all duration-300 transform-gpu"
    >
      <div className="relative h-52 overflow-hidden">
        <motion.div whileHover={{ scale: 1.06 }} transition={{ duration: 0.6 }} className="relative w-full h-full">
          <Image 
            src={trip.image} 
            alt={trip.imageAlt} 
            fill 
            className="object-cover" 
            sizes="(max-width: 640px) 100vw, (max-width: 1200px) 50vw, 33vw"
            priority={isLcpAsset} // ⚡ Fixes the LCP runtime warning elegantly
          />
        </motion.div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#080a10] via-[#080a10]/40 to-transparent" />
        <div className="absolute bottom-4 left-4">
          <span className={[
            "text-xs px-3 py-1.5 rounded-full border backdrop-blur-md font-medium",
            trip.badgeVariant === "upcoming" ? "bg-cyan-500/10 text-cyan-300 border-cyan-500/30" : "bg-white/[0.08] text-slate-400 border-white/10"
          ].join(" ")}>
            {trip.badge}
          </span>
        </div>
      </div>
      <div className="p-5">
        <h3 className="text-base font-semibold text-white mb-1 group-hover:text-cyan-300 transition-colors duration-200 truncate">{trip.title}</h3>
        <p className="text-slate-500 text-sm mb-4">{trip.dates}</p>
        {trip.collaborators && (
          <div className="flex items-center -space-x-2">
            {trip.collaborators.map((c, i) => (
              <div key={i} className="relative h-8 w-8 rounded-full border-2 border-[#080a10] overflow-hidden">
                <Image src={c.src} alt={c.alt} fill className="object-cover" sizes="32px" />
              </div>
            ))}
            {trip.extra && (
              <div className="h-8 w-8 rounded-full border-2 border-[#080a10] bg-slate-700 flex items-center justify-center text-[10px] font-bold text-slate-300">+{trip.extra}</div>
            )}
          </div>
        )}
        {trip.rating && (
          <div className="flex items-center gap-1.5">
            <Star size={14} className="text-amber-400 fill-amber-400" />
            <span className="text-slate-300 text-sm font-semibold">{trip.rating} Rating</span>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export const ActivityItem: React.FC<{ item: Activity; delay: number }> = ({ item, delay }) => (
  <motion.div variants={fadeUp} custom={delay} initial="hidden" animate="visible" className="flex items-start gap-4 transform-gpu">
    <div className={`h-10 w-10 rounded-full flex-shrink-0 flex items-center justify-center ${item.iconBg}`}>{item.icon}</div>
    <div className="flex-1 min-w-0">
      <div className="text-slate-300 text-sm leading-relaxed">{item.text}</div>
      <p className="text-slate-600 text-xs mt-1">{item.time}</p>
    </div>
  </motion.div>
);

export const RecommendationItem: React.FC<{ rec: Recommendation; delay: number }> = ({ rec, delay }) => (
  <motion.div variants={fadeUp} custom={delay} initial="hidden" animate="visible" whileHover={{ x: 4 }} transition={{ duration: 0.25 }} className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/[0.05] transition-colors cursor-pointer group transform-gpu">
    <div className="relative h-14 w-14 rounded-xl overflow-hidden flex-shrink-0 border border-white/[0.07]">
      <Image src={rec.image} alt={rec.imageAlt} fill className="object-cover" sizes="56px" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-slate-200 text-sm font-semibold group-hover:text-cyan-300 transition-colors duration-200 truncate">{rec.title}</p>
      <p className="text-slate-500 text-xs mt-0.5">{rec.location}</p>
    </div>
    <ArrowUpRight size={14} className="text-slate-600 group-hover:text-cyan-400 transition-colors flex-shrink-0" />
  </motion.div>
);

export const DeadlineProgress: React.FC<{ d: Deadline }> = ({ d }) => (
  <div>
    <div className="flex justify-between items-center text-sm mb-2">
      <span className="text-slate-400">{d.label}</span>
      <span className={d.variant === "urgent" ? "text-red-400 font-semibold flex items-center gap-1" : "text-slate-300 font-medium"}>
        {d.variant === "urgent" && <AlertCircle size={12} />}
        {d.timeLeft}
      </span>
    </div>
    <div className="h-1 rounded-full bg-white/[0.06] overflow-hidden">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${d.progress}%` }}
        transition={{ duration: 1.2, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className={`h-full rounded-full ${d.variant === "urgent" ? "bg-gradient-to-r from-red-500 to-orange-400" : "bg-gradient-to-r from-cyan-500 to-sky-400"}`}
      />
    </div>
  </div>
);