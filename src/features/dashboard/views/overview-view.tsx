"use client";
import React, { useMemo } from "react";
import { Compass, Users, Sparkles, CalendarDays, CheckCircle2, TrendingUp, ChevronRight, ArrowRight } from "lucide-react";
import { TripItem } from "@/features/dashboard/types/dashboard.types";
import { StatCard } from "../components/stat-card";
import { RecommendationItem } from "../components/recommendation-item";
import { DeadlineProgress } from "../components/deadline-progress";
import { RECOMMENDATIONS, DEADLINES, STATIC_ACTIVITIES } from "../data/dashboard.data";

interface OverviewViewProps {
  trips: TripItem[];
  isLoading: boolean;
  userDisplayName: string;
  setActiveTab: (tab: string) => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({ trips, isLoading, userDisplayName, setActiveTab }) => {
  const metrics = useMemo(() => {
    const totalBudget = trips.reduce((sum, trip) => sum + (trip.budget || 0), 0);
    return {
      activeCount: trips.length,
      budgetSum: totalBudget,
      memberCount: trips.reduce((sum, trip) => sum + (trip.members?.length || 0), 0),
    };
  }, [trips]);

  const formatDateString = (dateStr: string) => {
    if (!dateStr) return "";
    return dateStr.split("T")[0];
  };
  return (
    <div className="space-y-8">
      {/* Welcome Hero Grid Banner */}
      <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-br from-slate-950 via-[#0a0d16] to-[#04060a] border border-white/[0.05] relative overflow-hidden shadow-2xl">
        <div className="relative z-10 max-w-xl">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white mb-2">
            Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-sky-400">{userDisplayName}</span>
          </h1>
          <p className="text-slate-400 text-xs md:text-sm leading-relaxed">
            Your system operations engine has aggregated current blueprint parameters across your active clusters.
          </p>
        </div>
      </div>

      {/* Telemetry Analytical Dash Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard title="Active Blueprints" value={isLoading ? "..." : metrics.activeCount} icon={Compass} colorClass="bg-cyan-500/10 text-cyan-400" />
        <StatCard title="Aggregated Budget" value={isLoading ? "..." : `$${metrics.budgetSum.toLocaleString()}`} icon={TrendingUp} colorClass="bg-emerald-500/10 text-emerald-400" />
        <StatCard title="Network Members" value={isLoading ? "..." : metrics.memberCount} icon={Users} colorClass="bg-purple-500/10 text-purple-400" />
      </div>

      {/* Primary Context Splits */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Live Tracking Feed Container */}
        <div className="lg:col-span-2 space-y-4">
          <div className="p-6 bg-white/[0.01] border border-white/[0.06] rounded-2xl backdrop-blur-md">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-sm font-bold text-white">Live Operations Tracking</h3>
                <p className="text-[11px] text-slate-500">Latest active blueprint deployments pulled from api endpoints.</p>
              </div>
              <button onClick={() => setActiveTab("Trip Blueprints")} className="text-[11px] font-bold text-cyan-400 flex items-center gap-1 bg-transparent border-none cursor-pointer hover:text-cyan-300">
                Manage All <ArrowRight size={12} />
              </button>
            </div>

            {isLoading ? (
              <div className="py-12 flex justify-center">
                <div className="h-5 w-5 border-2 border-cyan-500/20 border-t-cyan-400 animate-spin rounded-full" />
              </div>
            ) : trips.length === 0 ? (
              <div className="py-12 text-center border border-dashed border-white/5 rounded-xl text-xs text-slate-500">
                No telemetry components active inside database structures.
              </div>
            ) : (
              <div className="divide-y divide-white/[0.04]">
                {trips.map((trip) => (
                  <div key={trip._id ?? trip._id} className="py-3.5 flex justify-between items-center first:pt-0 last:pb-0">
                    <div>
                      <p className="text-xs font-semibold text-white">{trip.title}</p>
                      <p className="text-[10px] text-slate-500">{trip.destination || "Global Route"}</p>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-xs font-mono text-cyan-400 px-2.5 py-1 bg-cyan-500/5 border border-cyan-500/10 rounded-lg mb-1">${trip.budget}</span>
                      <span className="text-[9px] text-slate-400">{trip.startDate ? `Start: ${formatDateString(trip.startDate)}` : ""}</span>
                      <span className="text-[9px] text-slate-400">{trip.endDate ? `End: ${formatDateString(trip.endDate)}` : ""}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* System Recommendations & Deadlines Side Panel */}
        <div className="space-y-6">
          <div className="p-5 bg-[#080b11]/40 border border-white/[0.05] rounded-2xl space-y-4">
            <h4 className="text-xs font-bold text-white tracking-wider uppercase text-slate-400">Target Directives</h4>
            <div className="space-y-4">{RECOMMENDATIONS.map((r) => <RecommendationItem key={r.id} rec={r} />)}</div>
          </div>

          <div className="p-5 bg-[#080b11]/40 border border-white/[0.05] rounded-2xl space-y-4">
            <h4 className="text-xs font-bold text-white tracking-wider uppercase text-slate-400">System Deadlines</h4>
            <div className="space-y-4">{DEADLINES.map((d) => <DeadlineProgress key={d.id} d={d} />)}</div>
          </div>
        </div>
      </div>
    </div>
  );
};