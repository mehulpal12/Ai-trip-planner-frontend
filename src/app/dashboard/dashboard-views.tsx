"use client";

import React, { RefObject } from "react";
import { motion } from "framer-motion";
import { 
  CalendarDays, CheckCircle2, Users, TrendingUp, 
  ChevronRight, Zap, Clock, Compass, 
  Sparkles
} from "lucide-react";
import { TRIPS, ACTIVITIES, RECOMMENDATIONS, DEADLINES } from "./dashboard.data";
import { 
  StatCard, TripCard, ActivityItem, 
  RecommendationItem, DeadlineProgress 
} from "./dashboard-components";

interface DashboardOverviewProps {
  heroRef: RefObject<HTMLDivElement | null>;
  userDisplayName: string;
  setActiveTab: (tab: string) => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({ 
  heroRef, 
  userDisplayName, 
  setActiveTab 
}) => {
  return (
    <>
      {/* Hero Welcome Message */}
      <section ref={heroRef} className="mb-12 opacity-0">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-2">
          Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-sky-400">{userDisplayName}</span>
        </h1>
        <p className="text-slate-400 text-base md:text-lg">Your next adventure in Iceland starts in 12 days.</p>
      </section>

      {/* Analytics Banner Info Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-12">
        <div className="gsap-stat-card opacity-0">
          <StatCard icon={<CalendarDays size={22} />} iconColor="text-cyan-400" label="Upcoming" value="04" sub="2 new this month" subIcon={<TrendingUp size={13} className="text-cyan-400" />} delay={0} />
        </div>
        <div className="gsap-stat-card opacity-0">
          <StatCard icon={<CheckCircle2 size={22} />} iconColor="text-sky-400" label="Completed" value="28" sub="Across 14 countries" delay={1} />
        </div>
        <div className="gsap-stat-card opacity-0">
          <StatCard icon={<Users size={22} />} iconColor="text-indigo-400" label="Members" value="12" sub="Active collaborators" delay={2} />
        </div>
      </section>

      {/* Main Split Grid Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        <div className="xl:col-span-8 space-y-8">
          {/* Trip Cards Container */}
          <div>
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-xl font-semibold text-white">My Trips</h2>
             <button 
  onClick={() => setActiveTab("My Trips")} 
  className="text-cyan-400 text-sm font-medium flex items-center gap-1 hover:text-cyan-300 transition-colors group cursor-pointer bg-transparent border-none outline-none"
>
  View All <ChevronRight size={14} className="transform group-hover:translate-x-0.5 transition-transform" />
</button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {TRIPS.map((trip, i) => <TripCard key={trip.id} trip={trip} delay={i} />)}
            </div>
          </div>

          {/* Activity Logger Component */}
          <div className="rounded-2xl border border-white/[0.07] bg-white/[0.03] backdrop-blur-xl p-7">
            <h2 className="text-xl font-semibold text-white mb-6">Recent Activity</h2>
            <div className="space-y-6">
              {ACTIVITIES.map((item, i) => <ActivityItem key={item.id} item={item} delay={i} />)}
            </div>
          </div>
        </div>

        {/* Dynamic Context Sidebars */}
        <div className="xl:col-span-4 space-y-5">
          <div className="relative overflow-hidden rounded-2xl border border-cyan-500/20 bg-cyan-500/[0.04] backdrop-blur-xl p-6">
            <div className="pointer-events-none absolute -top-12 -right-12 h-36 w-36 rounded-full bg-cyan-400/10 blur-3xl" />
            <div className="flex items-center gap-2 mb-2">
              <div className="h-7 w-7 rounded-lg bg-cyan-500/20 flex items-center justify-center"><Zap size={14} className="text-cyan-400" /></div>
              <h2 className="text-cyan-300 font-semibold">AI Insights</h2>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed mb-6">Based on your love for minimalist architecture and alpine landscapes, we've found these unique spots.</p>
            <div className="space-y-1">
              {RECOMMENDATIONS.map((rec, i) => <RecommendationItem key={rec.id} rec={rec} delay={i} />)}
            </div>
            <button onClick={() => setActiveTab("AI Planner")} className="w-full mt-5 py-3 rounded-xl border border-cyan-500/30 text-cyan-400 text-sm font-semibold hover:bg-cyan-500/10 hover:shadow-[0_0_24px_rgba(0,209,255,0.2)] transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer bg-transparent">
              <Sparkles size={14} />Generate Itinerary
            </button>
          </div>

          <div className="rounded-2xl border border-white/[0.07] bg-white/[0.03] backdrop-blur-xl p-6">
            <h3 className="text-white font-semibold mb-5 flex items-center gap-2"><Clock size={16} className="text-slate-400" />Upcoming Deadlines</h3>
            <div className="space-y-5">
              {DEADLINES.map((d) => <DeadlineProgress key={d.id} d={d} />)}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

interface AlternativeWorkspaceProps {
  activeTab: string;
  fallbackIcon?: React.ReactNode;
  setActiveTab: (tab: string) => void;
}

export const AlternativeWorkspace: React.FC<AlternativeWorkspaceProps> = ({ 
  activeTab, 
  fallbackIcon, 
  setActiveTab 
}) => {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="py-12 text-center max-w-xl mx-auto">
      <div className="h-12 w-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mx-auto text-cyan-400 mb-4">
        {fallbackIcon || <Compass />}
      </div>
      <h2 className="text-2xl font-bold mb-2">{activeTab} Workspace</h2>
      <p className="text-slate-400 mb-6 text-sm">Your secure workspace and management portal details for "{activeTab}" are initializing details from server pipelines.</p>
      <button onClick={() => setActiveTab("Dashboard")} className="px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs font-semibold hover:bg-white/10 transition-colors cursor-pointer text-white">
        Return to Dashboard Overview
      </button>
    </motion.div>
  );
};