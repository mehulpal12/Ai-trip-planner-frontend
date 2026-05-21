"use client";

import React, { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Plus, Search, Grid, List, ChevronLeft, ChevronRight,
    SlidersHorizontal, Calendar, MapPin, DollarSign, FileText,
    Trash2, Edit3, X, Loader2
} from "lucide-react";
// Import the authStore from your lib folder
import { useAuthStore } from "@/lib/authStore"; 

// Synchronized with Backend Schema
interface TripItem {
    _id: string; // Express/MongoDB conventional identifier
    title: string;
    destination: string;
    startDate: string;
    endDate: string;
    budget: number;
    notes: string;
    owner: string | { _id: string; name: string; email: string; avatar?: string };
    members: Array<{ _id: string; name: string; avatar?: string }>;
    activities: Array<{ id: string; text: string; time: string }>;
    createdAt?: string;
}

export const TripsPage: React.FC = () => {
    // --- Auth State Token Pull ---
    // Extracting the token cleanly from your custom authStore framework
      const token = useAuthStore(state => state.accessToken);
    

    // --- Core API Data States ---
    const [trips, setTrips] = useState<TripItem[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [apiError, setApiError] = useState<string | null>(null);

    // --- UI Layout & View States ---
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
    const [selectedTrip, setSelectedTrip] = useState<TripItem | null>(null);

    // --- Search, Filter & Pagination States ---
    const [search, setSearch] = useState("");
    const [sortBy, setSortBy] = useState<"title" | "budget" | "date">("date");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 4;

    // --- Modal Controllers ---
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTrip, setEditingTrip] = useState<TripItem | null>(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
    const [toast, setToast] = useState<string | null>(null);

    // --- Form Local States ---
    const [formState, setFormState] = useState({
        title: "", destination: "", startDate: "", endDate: "", budget: 0, notes: ""
    });

    const triggerToast = (msg: string) => {
        setToast(msg);
        setTimeout(() => setToast(null), 4000);
    };

    // Helper formatting helper for DB timestamps (YYYY-MM-DD parsing safe)
    const formatDateString = (dateStr: string) => {
        if (!dateStr) return "";
        return dateStr.split("T")[0];
    };

    // Harmonized Base Endpoint URL targeting local gateway server ports cleanly
    const BASE_URL = "http://localhost:4001";

    // Reusable Authorization Header Builder to eliminate dry redundancies
    const getHeaders = () => ({
        "Content-Type": "application/json",
        ...(token ? { "Authorization": `Bearer ${token}` } : {})
    });

    // ─── HTTP REST FETCH CONTEXT PIPELINES ───

    // Pipeline 1: GET /api/trips (Fetch all authenticated pipelines)
    const fetchTrips = async () => {
        setIsLoading(true);
        setApiError(null);
        try {
            const res = await fetch(`${BASE_URL}/api/trips`, {
                method: "GET",
                headers: getHeaders()
            });
            if (!res.ok) throw new Error(`HTTP Error Status: ${res.status}`);
            const data = await res.json();
            setTrips(Array.isArray(data) ? data : data.trips || []);
        } catch (err: any) {
            setApiError(err.message || "Failed to download trip modules.");
        } finally {
            setIsLoading(false);
        }
    };

    // Trigger initial mount pipeline sync loop when authorization token initializes successfully
    useEffect(() => {
        if (!token) {
        setIsLoading(false); // Stop showing the loading spinner since we are just waiting for auth
        return;
    }
        fetchTrips();
    }, [token]);

    // Pipeline 2: POST & PUT Orchestrator (POST /api/trips vs PUT /api/trips/:id)
    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            if (editingTrip) {
                // Optimistic UI updates
                const fallbackTrips = [...trips];
                const updatedTrips = trips.map(t => t._id === editingTrip._id ? { ...t, ...formState } : t);
                setTrips(updatedTrips as any);

                const res = await fetch(`${BASE_URL}/api/trips/${editingTrip._id}`, {
                    method: "PUT",
                    headers: getHeaders(),
                    body: JSON.stringify(formState)
                });

                if (!res.ok) {
                    setTrips(fallbackTrips);
                    throw new Error("Failed modifications on targeted backend node.");
                }

                const data = await res.json();
                // Update deep canvas focus view state if viewing the updated segment
                if (selectedTrip?._id === editingTrip._id) {
                    setSelectedTrip(data.trip || data);
                }
                triggerToast(`Successfully modified framework for "${formState.title}"`);
            } else {
                // POST /api/trips execution
                const res = await fetch(`${BASE_URL}/api/trips`, {
                    method: "POST",
                    headers: getHeaders(),
                    body: JSON.stringify(formState)
                });

                if (!res.ok) throw new Error("Initialization request failed at gateway.");
                const data = await res.json();

                setTrips([data.trip || data, ...trips]);
                triggerToast(`"${formState.title}" successfully organized and serialized!`);
            }
            setIsModalOpen(false);
            fetchTrips(); // Pull to sync auto-generated activities structural logs
        } catch (err: any) {
            triggerToast(`Pipeline error: ${err.message}`);
        }
    };

    // Pipeline 3: DELETE /api/trips/:id
    const handleDeleteTrip = async (id: string, e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        const target = trips.find(t => t._id === id);
        const fallbackTrips = [...trips];

        // Optimistic clean
        setTrips(trips.filter(t => t._id !== id));
        if (selectedTrip?._id === id) setSelectedTrip(null);
        setShowDeleteConfirm(null);

        try {
            const res = await fetch(`${BASE_URL}/api/trips/${id}`, {
                method: "DELETE",
                headers: getHeaders()
            });
            if (!res.ok) {
                setTrips(fallbackTrips);
                throw new Error("Server rejected deletion constraint parameters.");
            }
            triggerToast(`Archived and completely removed configuration "${target?.title}"`);
        } catch (err: any) {
            triggerToast(`Error: ${err.message}`);
        }
    };

    // --- Modal Open Handlers ---
    const openCreateModal = () => {
        setEditingTrip(null);
        setFormState({ title: "", destination: "", startDate: "", endDate: "", budget: 0, notes: "" });
        setIsModalOpen(true);
    };

    const openEditModal = (trip: TripItem, e: React.MouseEvent) => {
        e.stopPropagation();
        setEditingTrip(trip);
        setFormState({
            title: trip.title,
            destination: trip.destination,
            startDate: formatDateString(trip.startDate),
            endDate: formatDateString(trip.endDate),
            budget: trip.budget,
            notes: trip.notes
        });
        setIsModalOpen(true);
    };

    // --- Computational Grid Hooks (Search, Filter, Sort, Pagination) ---
    const processedTrips = useMemo(() => {
        let filtered = trips.filter(t =>
            t.title?.toLowerCase().includes(search.toLowerCase()) ||
            t.destination?.toLowerCase().includes(search.toLowerCase())
        );

        return filtered.sort((a, b) => {
            if (sortBy === "title") return a.title.localeCompare(b.title);
            if (sortBy === "budget") return b.budget - a.budget;
            return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
        });
    }, [trips, search, sortBy]);

    const paginatedTrips = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return processedTrips.slice(startIndex, startIndex + itemsPerPage);
    }, [processedTrips, currentPage]);

    const totalPages = Math.ceil(processedTrips.length / itemsPerPage) || 1;

    return (
        <div className="space-y-6">
            {/* ── Toast Notifications ── */}
            <AnimatePresence>
                {toast && (
                    <motion.div initial={{ opacity: 0, y: -20, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="fixed top-6 right-6 z-[100] bg-cyan-900/80 backdrop-blur-xl border border-cyan-500/30 text-cyan-200 px-5 py-3 rounded-xl shadow-[0_0_30px_rgba(0,209,255,0.15)] flex items-center gap-2 text-sm font-medium">
                        <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
                        {toast}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── Dynamic Layout Engine ── */}
            {!selectedTrip ? (
                <>
                    {/* Header Management Module */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/[0.06] pb-5">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight text-white">Trip Frameworks</h1>
                            <p className="text-slate-400 text-sm mt-0.5">Manage pipelines, budget parameters, and collaborator nodes.</p>
                        </div>
                        <button onClick={openCreateModal} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-500 text-[#080a10] text-sm font-semibold hover:bg-cyan-400 transition-all duration-200 shadow-[0_0_20px_rgba(0,209,255,0.2)] cursor-pointer">
                            <Plus size={16} /> Organize Trip
                        </button>
                    </div>

                    {/* Search Filtering Action Strip */}
                    <div className="flex flex-col md:flex-row justify-between gap-4 bg-white/[0.02] border border-white/[0.06] p-4 rounded-xl backdrop-blur-xl">
                        <div className="relative flex-1">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                            <input type="text" placeholder="Search by title or targeted destination..." value={search} onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }} className="w-full bg-[#080a10]/40 border border-white/[0.08] rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 transition-colors" />
                        </div>
                        <div className="flex flex-wrap items-center gap-3">
                            <div className="flex items-center gap-2 bg-[#080a10]/40 border border-white/[0.08] px-3 py-1.5 rounded-xl text-xs text-slate-400">
                                <SlidersHorizontal size={13} />
                                <span>Sort:</span>
                                <select value={sortBy} onChange={(e) => setSortBy(e.target.value as any)} className="bg-transparent text-white border-none outline-none focus:ring-0 cursor-pointer font-medium">
                                    <option value="date" className="bg-[#0c0f17]">Timeline</option>
                                    <option value="budget" className="bg-[#0c0f17]">Budget Cap</option>
                                    <option value="title" className="bg-[#0c0f17]">Alphabetical</option>
                                </select>
                            </div>
                            <div className="flex items-center border border-white/[0.08] rounded-xl overflow-hidden bg-[#080a10]/40 p-0.5">
                                <button onClick={() => setViewMode("grid")} className={`p-1.5 rounded-lg transition-colors ${viewMode === "grid" ? "bg-cyan-500/10 text-cyan-400" : "text-slate-500 hover:text-slate-300"}`}><Grid size={15} /></button>
                                <button onClick={() => setViewMode("list")} className={`p-1.5 rounded-lg transition-colors ${viewMode === "list" ? "bg-cyan-500/10 text-cyan-400" : "text-slate-500 hover:text-slate-300"}`}><List size={15} /></button>
                            </div>
                        </div>
                    </div>

                    {/* Core Dynamic Content Container */}
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-3">
                            <Loader2 className="animate-spin text-cyan-500" size={32} />
                            <p className="text-slate-400 text-sm font-light">Downloading secure framework schemas...</p>
                        </div>
                    ) : apiError ? (
                        <div className="text-center py-12 border border-rose-500/10 bg-rose-500/[0.02] rounded-2xl p-6">
                            <p className="text-rose-400 text-sm mb-2">Failed sync sequence: {apiError}</p>
                            <button onClick={fetchTrips} className="text-xs bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg text-slate-300 hover:text-white transition-colors">Re-attempt Sync</button>
                        </div>
                    ) : paginatedTrips.length === 0 ? (
                        <div className="text-center py-16 border border-dashed border-white/[0.08] rounded-2xl">
                            <p className="text-slate-400 text-sm">No travel blueprints discovered matching criteria parameters.</p>
                        </div>
                    ) : viewMode === "grid" ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            {paginatedTrips.map((trip) => (
                                <div key={trip._id} onClick={() => setSelectedTrip(trip)} className="group relative border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] p-5 rounded-2xl transition-all duration-300 hover:-translate-y-0.5 backdrop-blur-xl cursor-pointer flex flex-col justify-between">
                                    <div>
                                        <div className="flex justify-between items-start gap-4 mb-3">
                                            <span className="px-2.5 py-0.5 text-[10px] uppercase tracking-wider font-semibold rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">Active Pipeline</span>
                                            <div className="flex items-center gap-1.5 opacity-60 group-hover:opacity-100 transition-opacity">
                                                <button onClick={(e) => openEditModal(trip, e)} className="p-1 text-slate-400 hover:text-cyan-400"><Edit3 size={14} /></button>
                                                <button onClick={(e) => { e.stopPropagation(); setShowDeleteConfirm(trip._id); }} className="p-1 text-slate-400 hover:text-rose-400"><Trash2 size={14} /></button>
                                            </div>
                                        </div>
                                        <h3 className="text-lg font-bold text-white group-hover:text-cyan-300 transition-colors line-clamp-1">{trip.title}</h3>
                                        <p className="text-slate-400 text-xs flex items-center gap-1 mt-1"><MapPin size={12} className="text-cyan-500/70" /> {trip.destination}</p>
                                        <p className="text-slate-500 text-xs mt-3 line-clamp-2 leading-relaxed font-light">{trip.notes || "No extra contextual details mapped."}</p>
                                    </div>
                                    <div className="border-t border-white/[0.06] mt-5 pt-4 flex justify-between items-center text-xs">
                                        <div className="text-slate-400 flex items-center gap-1"><Calendar size={12} /> {formatDateString(trip.startDate)}</div>
                                        <div className="text-cyan-400 font-semibold bg-cyan-500/[0.04] px-2.5 py-1 rounded-lg">${trip.budget}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {paginatedTrips.map((trip) => (
                                <div key={trip._id} onClick={() => setSelectedTrip(trip)} className="group border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] px-5 py-4 rounded-xl transition-all flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 cursor-pointer backdrop-blur-xl">
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors truncate">{trip.title}</h3>
                                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-xs text-slate-400">
                                            <span className="flex items-center gap-1"><MapPin size={12} className="text-cyan-500/70" /> {trip.destination}</span>
                                            <span className="flex items-center gap-1"><Calendar size={12} /> {formatDateString(trip.startDate)} to {formatDateString(trip.endDate)}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-6 border-t sm:border-none border-white/[0.06] pt-3 sm:pt-0">
                                        <div className="text-cyan-400 font-mono font-semibold">${trip.budget}</div>
                                        <div className="flex items-center gap-2">
                                            <button onClick={(e) => openEditModal(trip, e)} className="p-1.5 text-slate-400 hover:text-cyan-400 bg-white/5 rounded-lg"><Edit3 size={13} /></button>
                                            <button onClick={(e) => { e.stopPropagation(); setShowDeleteConfirm(trip._id); }} className="p-1.5 text-slate-400 hover:text-rose-400 bg-white/5 rounded-lg"><Trash2 size={13} /></button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                        <div className="flex justify-center items-center gap-2 pt-4">
                            <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="p-2 rounded-xl bg-white/5 border border-white/10 text-slate-400 disabled:opacity-30 disabled:cursor-not-allowed hover:text-white transition-colors"><ChevronLeft size={16} /></button>
                            <span className="text-xs text-slate-400 font-medium px-3">Page {currentPage} of {totalPages}</span>
                            <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)} className="p-2 rounded-xl bg-white/5 border border-white/10 text-slate-400 disabled:opacity-30 disabled:cursor-not-allowed hover:text-white transition-colors"><ChevronRight size={16} /></button>
                        </div>
                    )}
                </>
            ) : (
                /* ── Detailed Canvas Focused View (GET /trips/:id context mappings) ── */
                <div className="space-y-6">
                    <button onClick={() => setSelectedTrip(null)} className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-cyan-400 transition-colors bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl cursor-pointer">
                        <ChevronLeft size={14} /> Back to listing
                    </button>

                    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                        {/* Left Primary Meta View */}
                        <div className="xl:col-span-8 space-y-6">
                            <div className="border border-white/[0.07] bg-white/[0.03] backdrop-blur-xl p-6 rounded-2xl relative overflow-hidden">
                                <div className="absolute top-0 right-0 h-32 w-32 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                                    <div>
                                        <h2 className="text-2xl font-bold text-white">{selectedTrip.title}</h2>
                                        <p className="text-cyan-400 text-sm flex items-center gap-1 mt-1"><MapPin size={14} /> {selectedTrip.destination}</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={(e) => openEditModal(selectedTrip, e)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs font-medium hover:bg-white/10 text-slate-200 transition-all cursor-pointer"><Edit3 size={13} /> Edit</button>
                                        <button onClick={() => setShowDeleteConfirm(selectedTrip._id)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs font-medium hover:bg-rose-500/20 text-rose-400 transition-all cursor-pointer"><Trash2 size={13} /> Delete</button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-y border-white/[0.06] py-4 my-4 text-sm">
                                    <div>
                                        <span className="text-slate-500 text-xs block">Start Blueprint</span>
                                        <span className="text-slate-200 font-medium flex items-center gap-1.5 mt-0.5"><Calendar size={14} className="text-slate-400" /> {formatDateString(selectedTrip.startDate)}</span>
                                    </div>
                                    <div>
                                        <span className="text-slate-500 text-xs block">End Pipeline</span>
                                        <span className="text-slate-200 font-medium flex items-center gap-1.5 mt-0.5"><Calendar size={14} className="text-slate-400" /> {formatDateString(selectedTrip.endDate)}</span>
                                    </div>
                                    <div>
                                        <span className="text-slate-500 text-xs block">Allocated Cap</span>
                                        <span className="text-cyan-400 font-semibold flex items-center gap-1 mt-0.5"><DollarSign size={14} /> {selectedTrip.budget}</span>
                                    </div>
                                </div>

                                <div className="pt-2">
                                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-2"><FileText size={12} /> Notes & Scope Parameters</h4>
                                    <p className="text-slate-300 text-sm leading-relaxed bg-[#080a10]/40 p-4 rounded-xl border border-white/[0.04] font-light">{selectedTrip.notes || "No extended descriptions appended."}</p>
                                </div>
                            </div>

                            {/* Dynamic Activities Framework Logger */}
                            <div className="border border-white/[0.07] bg-white/[0.03] backdrop-blur-xl p-6 rounded-2xl">
                                <h3 className="text-base font-bold text-white mb-4">Activity Timeline Log</h3>
                                {selectedTrip.activities && selectedTrip.activities.length > 0 ? (
                                    <div className="space-y-4 relative before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-px before:bg-white/[0.06]">
                                        {selectedTrip.activities.map((act) => (
                                            <div key={act.id} className="flex gap-4 relative pl-7">
                                                <span className="absolute left-1.5 top-1.5 h-2 w-2 rounded-full bg-cyan-400 ring-4 ring-cyan-900/30" />
                                                <div className="flex-1 bg-[#080a10]/20 p-3 rounded-xl border border-white/[0.04]">
                                                    <p className="text-sm text-slate-300">{act.text}</p>
                                                    <span className="text-[10px] text-slate-500 mt-1 block">{act.time}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-xs text-slate-500 italic">No automated tracking changes registered on this channel framework yet.</p>
                                )}
                            </div>
                        </div>

                        {/* Right Side Ownership & Collaborators Context Matrix */}
                        <div className="xl:col-span-4 space-y-6">
                            {/* Ownership Meta Processing info */}
                            <div className="border border-white/[0.07] bg-white/[0.03] backdrop-blur-xl p-5 rounded-2xl">
                                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Owner Details</h3>
                                <div className="flex items-center gap-3 bg-[#080a10]/30 p-3 rounded-xl border border-white/[0.04]">
                                    <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-cyan-500 to-sky-600 flex items-center justify-center font-bold text-xs text-white">
                                        {typeof selectedTrip.owner === "object" ? selectedTrip.owner.name?.slice(0, 2).toUpperCase() : "OW"}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-semibold text-white truncate">
                                            {typeof selectedTrip.owner === "object" ? selectedTrip.owner.name : "Secure Node Owner"}
                                        </p>
                                        <p className="text-xs text-slate-500 truncate">
                                            {typeof selectedTrip.owner === "object" ? selectedTrip.owner.email : "Shared internal pipeline"}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Collaborators Framework Module (Dynamic Sub-Routes Sync ready) */}
                            <div className="border border-white/[0.07] bg-white/[0.03] backdrop-blur-xl p-5 rounded-2xl">
                                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between mb-3">
                                    <span>Collaborators ({selectedTrip.members?.length || 0})</span>
                                </h3>
                                {!selectedTrip.members || selectedTrip.members.length === 0 ? (
                                    <p className="text-xs text-slate-500 italic py-2">No workspace network access node channels added.</p>
                                ) : (
                                    <div className="space-y-2.5">
                                        {selectedTrip.members.map((m) => (
                                            <div key={m._id} className="flex items-center gap-2.5 text-sm text-slate-300">
                                                {m.avatar ? (
                                                    <img src={m.avatar} alt={m.name} className="h-6 w-6 rounded-full object-cover border border-white/10" />
                                                ) : (
                                                    <div className="h-6 w-6 rounded-full bg-white/10 text-[10px] flex items-center justify-center font-bold text-white uppercase">{m.name?.slice(0, 2)}</div>
                                                )}
                                                <span>{m.name}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Action Form Modal: Create & Edit Configuration ── */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-[#04060a]/80 backdrop-blur-md" />
                        <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }} className="relative bg-[#0c0f17] border border-white/[0.08] w-full max-w-lg p-6 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.5)] z-10 max-h-[90vh] overflow-y-auto">
                            <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"><X size={18} /></button>
                            <h2 className="text-xl font-bold text-white mb-4">{editingTrip ? "Modify Blueprint Parameters" : "Map New Journey Blueprint"}</h2>

                            <form onSubmit={handleFormSubmit} className="space-y-4 text-sm">
                                <div>
                                    <label className="text-slate-400 font-medium block mb-1.5">Trip Title</label>
                                    <input type="text" required value={formState.title} onChange={e => setFormState({ ...formState, title: e.target.value })} placeholder="e.g., Summer Alpine Framework" className="w-full bg-[#080a10] border border-white/[0.08] rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-cyan-500/50" />
                                </div>
                                <div>
                                    <label className="text-slate-400 font-medium block mb-1.5">Destination</label>
                                    <input type="text" required value={formState.destination} onChange={e => setFormState({ ...formState, destination: e.target.value })} placeholder="e.g., Reykjanes, Iceland" className="w-full bg-[#080a10] border border-white/[0.08] rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-cyan-500/50" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-slate-400 font-medium block mb-1.5">Start Date</label>
                                        <input type="date" required value={formState.startDate} onChange={e => setFormState({ ...formState, startDate: e.target.value })} className="w-full bg-[#080a10] border border-white/[0.08] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500/50 [color-scheme:dark]" />
                                    </div>
                                    <div>
                                        <label className="text-slate-400 font-medium block mb-1.5">End Date</label>
                                        <input type="date" required value={formState.endDate} onChange={e => setFormState({ ...formState, endDate: e.target.value })} className="w-full bg-[#080a10] border border-white/[0.08] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500/50 [color-scheme:dark]" />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-slate-400 font-medium block mb-1.5">Budget Allocation ($)</label>
                                    <input type="number" required value={formState.budget || ""} onChange={e => setFormState({ ...formState, budget: Number(e.target.value) })} placeholder="4000" className="w-full bg-[#080a10] border border-white/[0.08] rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-cyan-500/50" />
                                </div>
                                <div>
                                    <label className="text-slate-400 font-medium block mb-1.5">Context Scope & Notes</label>
                                    <textarea rows={3} value={formState.notes} onChange={e => setFormState({ ...formState, notes: e.target.value })} placeholder="Describe key priorities, modular routes, structural stops..." className="w-full bg-[#080a10] border border-white/[0.08] rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-cyan-500/50 resize-none" />
                                </div>
                                <div className="flex justify-end gap-3 pt-2">
                                    <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-xl border border-white/10 text-slate-400 hover:text-white transition-colors">Cancel</button>
                                    <button type="submit" className="px-5 py-2 rounded-xl bg-cyan-50 text-[#080a10] font-semibold hover:bg-cyan-400 transition-colors shadow-lg">Save Configuration</button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* ── Action Modal: Delete Confirmation ── */}
            <AnimatePresence>
                {showDeleteConfirm && (
                    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowDeleteConfirm(null)} className="absolute inset-0 bg-[#04060a]/80 backdrop-blur-sm" />
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative bg-[#0c0f17] border border-rose-500/20 w-full max-w-sm p-5 rounded-2xl shadow-2xl z-10 text-center">
                            <div className="h-10 w-10 bg-rose-500/10 border border-rose-500/20 rounded-full flex items-center justify-center mx-auto text-rose-400 mb-3"><Trash2 size={18} /></div>
                            <h3 className="text-base font-bold text-white mb-1">Archive Trip Blueprint?</h3>
                            <p className="text-slate-400 text-xs mb-5">This action safely detaches data segments. This can't be undone.</p>
                            <div className="flex gap-2">
                                <button onClick={() => setShowDeleteConfirm(null)} className="flex-1 py-2 rounded-xl border border-white/10 text-xs text-slate-400 hover:text-white transition-colors">Abort</button>
                                <button onClick={() => handleDeleteTrip(showDeleteConfirm)} className="flex-1 py-2 rounded-xl bg-rose-500 text-white text-xs font-semibold hover:bg-rose-400 transition-colors">Confirm Removal</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};