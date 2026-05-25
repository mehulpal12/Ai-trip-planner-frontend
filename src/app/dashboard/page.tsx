"use client";

import React, {
  useEffect,
  useRef,
  useState,
  useMemo,
  useCallback,
} from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

// Icons
import {
  LayoutDashboard,
  Compass,
  Sparkles,
  Users,
  Settings,
  Plus,
  HelpCircle,
  LogOut,
  Bell,
  Search,
  Map,
  Home,
  Bot,
  User,
  Menu,
  X,
  Grid,
  List,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  Calendar,
  MapPin,
  DollarSign,
  FileText,
  Trash2,
  Edit3,
  Globe,
  ChevronDown,
  Check,
} from "lucide-react";

// Store & Global State hooks
import { useUserStore } from "@/store/useUserStore";
import { useAuthStore } from "@/lib/authStore";

// Static UI Layout Elements
import { AuroraBackground, SideNavItem } from "./dashboard-components";

// 🌟 Integrated Isolated Tab Views
import { DashboardOverview, AlternativeWorkspace } from "./dashboard-views";

// Import data helpers from country-state-city dependency
import { Country, City } from "country-state-city";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import CollaboratorsPage from "./components/CollaboratorsPage";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/* ─────────────────────────── Data Structures ─────────────────────────── */
interface TripItem {
  id: string;
  title: string;
  destination: string;
  startDate: string;
  endDate: string;
  budget: number;
  notes: string;
  owner: { name: string; email: string; avatar?: string };
  members: { id?: string; name: string; avatar?: string }[];
  activities: { id: string; text: string; time: string }[];
}

interface ApiTrip {
  id: string;
  title: string;
  description?: string | null;
  startDate: string;
  endDate: string;
  budget?: number | null;
  createdBy: string;
  createdAt?: string;
  destinations?: Array<{
    id: string;
    name: string;
    city?: string | null;
    state?: string | null;
    country?: string | null;
  }>;
  members?: Array<{
    id: string;
    userId: string;
    memberName?: string | null;
    role: string;
  }>;
}

const TRIP_API_URL = "http://localhost:4001/api/trips";

const formatDateString = (dateStr?: string | null) => {
  if (!dateStr) return "";
  return dateStr.split("T")[0];
};

const getDestinationLabel = (trip: ApiTrip) => {
  const destination = trip.destinations?.[0];
  if (!destination) return "No destination set";

  const locationParts = [
    destination.city,
    destination.state,
    destination.country,
  ].filter((part): part is string => Boolean(part));

  return locationParts.length > 0 ? locationParts.join(", ") : destination.name;
};

const normalizeTrip = (trip: ApiTrip, currentUserName = "You"): TripItem => ({
  id: trip.id,
  title: trip.title,
  destination: getDestinationLabel(trip),
  startDate: formatDateString(trip.startDate),
  endDate: formatDateString(trip.endDate),
  budget: trip.budget ?? 0,
  notes: trip.description ?? "",
  owner: {
    name: trip.createdBy,
    email: trip.createdBy,
  },
  members: (trip.members ?? []).map((member) => ({
    id: member.id,
    name:
      member.memberName ||
      (member.role === "OWNER" ? currentUserName : member.userId),
  })),
  activities: [
    {
      id: `created-${trip.id}`,
      text: "Trip created",
      time: trip.createdAt ? formatDateString(trip.createdAt) : "Recently",
    },
  ],
});

/* ─────────────────────────── Component: TripsPage ─────────────────────────── */
interface TripsPageProps {
  trips: TripItem[];
  setTrips: React.Dispatch<React.SetStateAction<TripItem[]>>;
  triggerToast: (msg: string) => void;
  fetchTrips: () => Promise<void>;
  isTripsLoading: boolean;
  tripsError: string | null;
  accessToken: string;
}

const TripsPage: React.FC<TripsPageProps> = ({
  trips,
  setTrips,
  triggerToast,
  fetchTrips,
  isTripsLoading,
  tripsError,
  accessToken,
}) => {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedTrip, setSelectedTrip] = useState<TripItem | null>(null);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"title" | "budget" | "date">("date");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTrip, setEditingTrip] = useState<TripItem | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(
    null,
  );

  // Advanced Destination Autocomplete Fields State Machine
  const [countryInput, setCountryInput] = useState("");
  const [selectedCountryCode, setSelectedCountryCode] = useState("");
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [destinationInput, setDestinationInput] = useState("");
  const [showDestinationDropdown, setShowDestinationDropdown] = useState(false);

  const countryRef = useRef<HTMLDivElement>(null);
  const destRef = useRef<HTMLDivElement>(null);

  // Global static memory reference initialization for Country Lists
  const allCountries = useMemo(() => Country.getAllCountries(), []);

  // Filter countries conditionally matching context input limits
  const filteredCountries = useMemo(() => {
    if (countryInput.trim() === "") {
      return allCountries.slice(0, 10);
    }
    return allCountries
      .filter((c) => c.name.toLowerCase().includes(countryInput.toLowerCase()))
      .slice(0, 10);
  }, [countryInput, allCountries]);

  // Compute and compile city suggestions dynamically based on structural rules
  const filteredDestinations = useMemo(() => {
    if (selectedCountryCode) {
      const countryCities = City.getCitiesOfCountry(selectedCountryCode) || [];
      if (destinationInput.trim() === "") {
        return countryCities.slice(0, 15);
      }
      return countryCities
        .filter((city) =>
          city.name.toLowerCase().includes(destinationInput.toLowerCase())
        )
        .slice(0, 15);
    } else {
      const popularCities = [
        { name: "New Delhi" },
        { name: "Reykjavik" },
        { name: "Oslo" },
        { name: "Paris" },
        { name: "Tokyo" },
        { name: "New York" },
        { name: "London" },
      ];
      if (destinationInput.trim() === "") return popularCities;
      return popularCities.filter((city) =>
        city.name.toLowerCase().includes(destinationInput.toLowerCase())
      );
    }
  }, [selectedCountryCode, destinationInput]);

  // Event handlers to safely trap contextual layout click boundaries
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (countryRef.current && !countryRef.current.contains(e.target as Node)) {
        setShowCountryDropdown(false);
      }
      if (destRef.current && !destRef.current.contains(e.target as Node)) {
        setShowDestinationDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const [formState, setFormState] = useState({
    title: "",
    destination: "",
    city: "",
    state: "",
    country: "",
    startDate: "",
    endDate: "",
    budget: 0,
    notes: "",
  });

  const openCreateModal = () => {
    setEditingTrip(null);
    setCountryInput("");
    setSelectedCountryCode("");
    setDestinationInput("");
    setFormState({
      title: "",
      destination: "",
      city: "",
      state: "",
      country: "",
      startDate: "",
      endDate: "",
      budget: 0,
      notes: "",
    });
    setIsModalOpen(true);
  };

  const openEditModal = (trip: TripItem, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingTrip(trip);
    
    // Parse individual segments cleanly backwards out of serialized context strings
    const segments = trip.destination.split(",").map((s) => s.trim());
    const parsedCity = segments[0] || "";
    const parsedCountry = segments[segments.length - 1] || "";

    // Match up matching ISO Country tracking codes
    const matchedCountry = allCountries.find(
      (c) => c.name.toLowerCase() === parsedCountry.toLowerCase()
    );

    setCountryInput(parsedCountry);
    setSelectedCountryCode(matchedCountry ? matchedCountry.isoCode : "");
    setDestinationInput(parsedCity);

    setFormState({
      title: trip.title,
      destination: trip.destination,
      city: parsedCity,
      state: segments.length > 2 ? segments[1] : "",
      country: parsedCountry,
      startDate: trip.startDate,
      endDate: trip.endDate,
      budget: trip.budget,
      notes: trip.notes,
    });
    setIsModalOpen(true);
  };

  const getHeaders = () => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${accessToken}`,
  });

  const handleSelectCountry = (countryName: string, countryCode: string) => {
    setCountryInput(countryName);
    setSelectedCountryCode(countryCode);
    setShowCountryDropdown(false);

    const mergedDestination = destinationInput
      ? `${destinationInput}, ${countryName}`
      : countryName;

    setFormState((prev) => ({
      ...prev,
      country: countryName,
      destination: mergedDestination,
    }));
  };

  const handleSelectDestination = (cityName: string) => {
    setDestinationInput(cityName);
    setShowDestinationDropdown(false);

    const mergedDestination = countryInput
      ? `${cityName}, ${countryInput}`
      : cityName;

    setFormState((prev) => ({
      ...prev,
      city: cityName,
      destination: mergedDestination,
    }));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const finalCity = destinationInput || formState.city;
    const finalCountry = countryInput || formState.country;
    const computedLabel = finalCity && finalCountry 
      ? `${finalCity}, ${finalCountry}` 
      : (finalCity || finalCountry || "Unmapped Coordinates");

    const formattedDestinationPayload = {
      title: formState.title,
      startDate: formState.startDate,
      endDate: formState.endDate,
      budget: formState.budget,
      notes: formState.notes,
      destinations: [
        {
          name: computedLabel,
          city: finalCity || null,
          state: formState.state || null,
          country: finalCountry || null,
        },
      ],
    };

    try {
      if (editingTrip) {
        const response = await fetch(`${TRIP_API_URL}/${editingTrip.id}`, {
          method: "PUT",
          headers: getHeaders(),
          body: JSON.stringify(formattedDestinationPayload),
        });

        if (!response.ok) {
          throw new Error(`Trip update failed with status ${response.status}`);
        }

        const result = await response.json();
        const updatedTrip = normalizeTrip(result.data);
        setTrips((current) =>
          current.map((trip) =>
            trip.id === editingTrip.id ? updatedTrip : trip
          )
        );
        if (selectedTrip?.id === editingTrip.id) {
          setSelectedTrip(updatedTrip);
        }
        triggerToast(`Successfully modified details for "${formState.title}"`);
      } else {
        const response = await fetch(TRIP_API_URL, {
          method: "POST",
          headers: getHeaders(),
          body: JSON.stringify(formattedDestinationPayload),
        });

        if (!response.ok) {
          throw new Error(
            `Trip creation failed with status ${response.status}`
          );
        }

        const result = await response.json();
        const newTrip = normalizeTrip(result.data);
        setTrips((current) => [
          newTrip,
          ...current.filter((trip) => trip.id !== newTrip.id),
        ]);
        triggerToast(`"${formState.title}" successfully organized!`);
      }
      setIsModalOpen(false);
      await fetchTrips();
    } catch (error) {
      triggerToast(
        error instanceof Error ? error.message : "Trip save failed."
      );
    }
  };

  const handleDeleteTrip = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const target = trips.find((t) => t.id !== id);
    const previousTrips = trips;
    setTrips(trips.filter((t) => t.id !== id));
    if (selectedTrip?.id === id) setSelectedTrip(null);
    setShowDeleteConfirm(null);
    try {
      const response = await fetch(`${TRIP_API_URL}/${id}`, {
        method: "DELETE",
        headers: getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Trip deletion failed with status ${response.status}`);
      }

      triggerToast(`Archived and removed "${target?.title}"`);
    } catch (error) {
      setTrips(previousTrips);
      triggerToast(
        error instanceof Error ? error.message : "Trip deletion failed."
      );
    }
  };

  const processedTrips = useMemo(() => {
    let filtered = trips.filter(
      (t) =>
        t.title.toLowerCase().includes(search.toLowerCase()) ||
        t.destination.toLowerCase().includes(search.toLowerCase())
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
      {!selectedTrip ? (
        <>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/[0.06] pb-5">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-white">
                Trip Frameworks
              </h1>
              <p className="text-slate-400 text-sm mt-0.5">
                Manage pipelines, budget parameters, and collaborator nodes.
              </p>
            </div>
            <button
              onClick={openCreateModal}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-500 text-[#080a10] text-sm font-semibold hover:bg-cyan-400 transition-all duration-200 shadow-[0_0_20px_rgba(0,209,255,0.2)] cursor-pointer border-none"
            >
              <Plus size={16} /> Organize Trip
            </button>
          </div>

          <div className="flex flex-col md:flex-row justify-between gap-4 bg-white/[0.02] border border-white/[0.06] p-4 rounded-xl backdrop-blur-xl">
            <div className="relative flex-1">
              <Search
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500"
                size={16}
              />
              <input
                type="text"
                placeholder="Search by title or targeted destination..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full bg-[#080a10]/40 border border-white/[0.08] rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 transition-colors"
              />
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 bg-[#080a10]/40 border border-white/[0.08] px-3 py-1.5 rounded-xl text-xs text-slate-400">
                <SlidersHorizontal size={13} />
                <span>Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-transparent text-white border-none outline-none focus:ring-0 cursor-pointer font-medium"
                >
                  <option value="date" className="bg-[#0c0f17]">
                    Timeline
                  </option>
                  <option value="budget" className="bg-[#0c0f17]">
                    Budget Cap
                  </option>
                  <option value="title" className="bg-[#0c0f17]">
                    Alphabetical
                  </option>
                </select>
              </div>
              <div className="flex items-center border border-white/[0.08] rounded-xl overflow-hidden bg-[#080a10]/40 p-0.5">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-1.5 rounded-lg transition-colors ${viewMode === "grid" ? "bg-cyan-500/10 text-cyan-400" : "text-slate-500 hover:text-slate-300"}`}
                >
                  <Grid size={15} />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-1.5 rounded-lg transition-colors ${viewMode === "list" ? "bg-cyan-500/10 text-cyan-400" : "text-slate-500 hover:text-slate-300"}`}
                >
                  <List size={15} />
                </button>
              </div>
            </div>
          </div>

          {isTripsLoading ? (
            <div className="flex justify-center py-16">
              <div className="h-6 w-6 rounded-full border-2 border-cyan-500 border-t-transparent animate-spin" />
            </div>
          ) : tripsError ? (
            <div className="text-center py-12 border border-rose-500/20 bg-rose-500/[0.03] rounded-2xl">
              <p className="text-rose-300 text-sm mb-3">{tripsError}</p>
              <button
                onClick={fetchTrips}
                className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-200 hover:bg-white/10 transition-colors"
              >
                Retry
              </button>
            </div>
          ) : paginatedTrips.length === 0 ? (
            <div className="text-center py-16 border border-dashed border-white/[0.08] rounded-2xl">
              <p className="text-slate-400 text-sm">
                No matching travel blueprints discovered.
              </p>
            </div>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {paginatedTrips.map((trip) => (
                <div
                  key={trip.id}
                  onClick={() => setSelectedTrip(trip)}
                  className="group relative border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] p-5 rounded-2xl transition-all duration-300 hover:-translate-y-0.5 backdrop-blur-xl cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    <div className="flex justify-between items-start gap-4 mb-3">
                      <span className="px-2.5 py-0.5 text-[10px] uppercase tracking-wider font-semibold rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
                        Active Pipeline
                      </span>
                      <div className="flex items-center gap-1.5 opacity-60 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => openEditModal(trip, e)}
                          className="p-1 text-slate-400 hover:text-cyan-400 bg-transparent border-none cursor-pointer"
                        >
                          <Edit3 size={14} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowDeleteConfirm(trip.id);
                          }}
                          className="p-1 text-slate-400 hover:text-rose-400 bg-transparent border-none cursor-pointer"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                    <h3 className="text-lg font-bold text-white group-hover:text-cyan-300 transition-colors line-clamp-1">
                      {trip.title}
                    </h3>
                    <p className="text-slate-400 text-xs flex items-center gap-1 mt-1">
                      <MapPin size={12} className="text-cyan-500/70" />{" "}
                      {trip.destination}
                    </p>
                    <p className="text-slate-500 text-xs mt-3 line-clamp-2 leading-relaxed font-light">
                      {trip.notes || "No extra contextual details mapped."}
                    </p>
                  </div>
                  <div className="border-t border-white/[0.06] mt-5 pt-4 flex justify-between items-center text-xs">
                    <div className="text-slate-400 flex items-center gap-1">
                      <Calendar size={12} /> {trip.startDate}
                    </div>
                    <div className="text-cyan-400 font-semibold bg-cyan-500/[0.04] px-2.5 py-1 rounded-lg">
                      ${trip.budget}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {paginatedTrips.map((trip) => (
                <div
                  key={trip.id}
                  onClick={() => setSelectedTrip(trip)}
                  className="group border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] px-5 py-4 rounded-xl transition-all flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 cursor-pointer backdrop-blur-xl"
                >
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors truncate">
                      {trip.title}
                    </h3>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-xs text-slate-400">
                      <span className="flex items-center gap-1">
                        <MapPin size={12} className="text-cyan-500/70" />{" "}
                        {trip.destination}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar size={12} /> {trip.startDate} to{" "}
                        {trip.endDate}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-6 border-t sm:border-none border-white/[0.06] pt-3 sm:pt-0">
                    <div className="text-cyan-400 font-mono font-semibold">
                      ${trip.budget}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => openEditModal(trip, e)}
                        className="p-1.5 text-slate-400 hover:text-cyan-400 bg-white/5 rounded-lg border-none cursor-pointer"
                      >
                        <Edit3 size={13} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowDeleteConfirm(trip.id);
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-400 bg-white/5 rounded-lg border-none cursor-pointer"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 pt-4">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
                className="p-2 rounded-xl bg-white/5 border border-white/10 text-slate-400 disabled:opacity-30 disabled:cursor-not-allowed hover:text-white transition-colors cursor-pointer"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="text-xs text-slate-400 font-medium px-3">
                Page {currentPage} of {totalPages}
              </span>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
                className="p-2 rounded-xl bg-white/5 border border-white/10 text-slate-400 disabled:opacity-30 disabled:cursor-not-allowed hover:text-white transition-colors cursor-pointer"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="space-y-6">
          <button
            onClick={() => setSelectedTrip(null)}
            className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-cyan-400 transition-colors bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl cursor-pointer"
          >
            <ChevronLeft size={14} /> Back to listing
          </button>

          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
            <div className="xl:col-span-8 space-y-6">
              <div className="border border-white/[0.07] bg-white/[0.03] backdrop-blur-xl p-6 rounded-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 h-32 w-32 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-white">
                      {selectedTrip.title}
                    </h2>
                    <p className="text-cyan-400 text-sm flex items-center gap-1 mt-1">
                      <MapPin size={14} /> {selectedTrip.destination}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={(e) => openEditModal(selectedTrip, e)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs font-medium hover:bg-white/10 text-slate-200 transition-all cursor-pointer"
                    >
                      <Edit3 size={13} /> Edit
                    </button>
                    <button
                      onClick={() => setShowDeleteConfirm(selectedTrip.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs font-medium hover:bg-rose-500/20 text-rose-400 transition-all cursor-pointer"
                    >
                      <Trash2 size={13} /> Delete
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-y border-white/[0.06] py-4 my-4 text-sm">
                  <div>
                    <span className="text-slate-500 text-xs block">
                      Start Blueprint
                    </span>
                    <span className="text-slate-200 font-medium flex items-center gap-1.5 mt-0.5">
                      <Calendar size={14} className="text-slate-400" />{" "}
                      {selectedTrip.startDate}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-xs block">
                      End Pipeline
                    </span>
                    <span className="text-slate-200 font-medium flex items-center gap-1.5 mt-0.5">
                      <Calendar size={14} className="text-slate-400" />{" "}
                      {selectedTrip.endDate}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-xs block">
                      Allocated Cap
                    </span>
                    <span className="text-cyan-400 font-semibold flex items-center gap-1 mt-0.5">
                      <DollarSign size={14} /> {selectedTrip.budget}
                    </span>
                  </div>
                </div>

                <div className="pt-2">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                    <FileText size={12} /> Notes & Scope Parameters
                  </h4>
                  <p className="text-slate-300 text-sm leading-relaxed bg-[#080a10]/40 p-4 rounded-xl border border-white/[0.04] font-light">
                    {selectedTrip.notes || "No extended descriptions appended."}
                  </p>
                </div>
              </div>

              <div className="border border-white/[0.07] bg-white/[0.03] backdrop-blur-xl p-6 rounded-2xl">
                <h3 className="text-base font-bold text-white mb-4">
                  Activity Timeline log
                </h3>
                <div className="space-y-4 relative before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-px before:bg-white/[0.06]">
                  {selectedTrip.activities.map((act) => (
                    <div key={act.id} className="flex gap-4 relative pl-7">
                      <span className="absolute left-1.5 top-1.5 h-2 w-2 rounded-full bg-cyan-400 ring-4 ring-cyan-900/30" />
                      <div className="flex-1 bg-[#080a10]/20 p-3 rounded-xl border border-white/[0.04]">
                        <p className="text-sm text-slate-300">{act.text}</p>
                        <span className="text-[10px] text-slate-500 mt-1 block">
                          {act.time}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="xl:col-span-4 space-y-6">
              <div className="border border-white/[0.07] bg-white/[0.03] backdrop-blur-xl p-5 rounded-2xl">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                  Owner Details
                </h3>
                <div className="flex items-center gap-3 bg-[#080a10]/30 p-3 rounded-xl border border-white/[0.04]">
                  <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-cyan-500 to-sky-600 flex items-center justify-center font-bold text-xs text-white">
                    PE
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-white truncate">
                      {selectedTrip.owner.name}
                    </p>
                    <p className="text-xs text-slate-500 truncate">
                      {selectedTrip.owner.email}
                    </p>
                  </div>
                </div>
              </div>

              <div className="border border-white/[0.07] bg-white/[0.03] backdrop-blur-xl p-5 rounded-2xl">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between mb-3">
                  <span>Collaborators ({selectedTrip.members.length})</span>
                </h3>
                {selectedTrip.members.length === 0 ? (
                  <p className="text-xs text-slate-500 italic py-2">
                    No active workspace nodes joined yet.
                  </p>
                ) : (
                  <div className="space-y-2.5">
                    {selectedTrip.members.map((m, idx) => (
                      <div
                        key={m.id ?? idx}
                        className="flex items-center gap-2.5 text-sm text-slate-300"
                      >
                        {m.avatar ? (
                          <img
                            src={m.avatar}
                            alt={m.name}
                            className="h-6 w-6 rounded-full object-cover border border-white/10"
                          />
                        ) : (
                          <div className="h-6 w-6 rounded-full bg-white/10 text-[10px] flex items-center justify-center font-bold text-white uppercase">
                            {m.name.slice(0, 2)}
                          </div>
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

      {/* Form Modal Layer */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-[#04060a]/80 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative bg-[#0c0f17] border border-white/[0.08] w-full max-w-lg p-6 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.5)] z-10 max-h-[90vh] overflow-y-auto text-left"
            >
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors bg-transparent border-none cursor-pointer"
              >
                <X size={18} />
              </button>
              <h2 className="text-xl font-bold text-white mb-4">
                {editingTrip
                  ? "Modify Blueprint Parameters"
                  : "Map New Journey Blueprint"}
              </h2>

              <form onSubmit={handleFormSubmit} className="space-y-4 text-sm">
                <div>
                  <label className="text-slate-400 font-medium block mb-1.5">
                    Trip Title
                  </label>
                  <input
                    type="text"
                    required
                    value={formState.title}
                    onChange={(e) =>
                      setFormState({ ...formState, title: e.target.value })
                    }
                    placeholder="e.g., Summer Alpine Framework"
                    className="w-full bg-[#080a10] border border-white/[0.08] rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-cyan-500/50"
                  />
                </div>

                {/* ── 🚀 Dynamic Location Autocomplete Component Core ── */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Country Selection Wrapper */}
                  <div className="relative" ref={countryRef}>
                    <label className="text-slate-400 font-medium block mb-1.5">
                      Target Country
                    </label>
                    <div className="relative">
                      <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                      <input
                        type="text"
                        required
                        placeholder="Select Country..."
                        value={countryInput}
                        onFocus={() => setShowCountryDropdown(true)}
                        onChange={(e) => {
                          setCountryInput(e.target.value);
                          setSelectedCountryCode(""); // Clear code if they manually override typing rules
                        }}
                        className="w-full bg-[#0c0f17] border border-white/[0.08] rounded-xl pl-10 pr-10 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 transition-colors"
                      />
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 pointer-events-none" />
                    </div>

                    {showCountryDropdown && filteredCountries.length > 0 && (
                      <div className="absolute left-0 right-0 top-[105%] z-50 max-h-60 overflow-y-auto rounded-xl border border-white/[0.1] bg-[#0c0f17] p-1 shadow-2xl backdrop-blur-md">
                        {filteredCountries.map((country) => (
                          <button
                            key={country.isoCode}
                            type="button"
                            onClick={() => handleSelectCountry(country.name, country.isoCode)}
                            className="flex items-center justify-between w-full text-left px-3 py-2 text-sm text-slate-300 hover:bg-white/[0.05] hover:text-cyan-400 rounded-lg transition-colors"
                          >
                            <div className="flex items-center gap-2">
                              <span className="text-base">{country.flag}</span>
                              <span>{country.name}</span>
                            </div>
                            {selectedCountryCode === country.isoCode && (
                              <Check className="h-4 w-4 text-cyan-400" />
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Destination / City Selection Wrapper */}
                  <div className="relative" ref={destRef}>
                    <label className="text-slate-400 font-medium block mb-1.5">
                      Target City
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                      <input
                        type="text"
                        required
                        placeholder={selectedCountryCode ? "Search local cities..." : "Search global cities..."}
                        value={destinationInput}
                        onFocus={() => setShowDestinationDropdown(true)}
                        onChange={(e) => setDestinationInput(e.target.value)}
                        className="w-full bg-[#0c0f17] border border-white/[0.08] rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 transition-colors"
                      />
                    </div>

                    {showDestinationDropdown && filteredDestinations.length > 0 && (
                      <div className="absolute left-0 right-0 top-[105%] z-50 max-h-60 overflow-y-auto rounded-xl border border-white/[0.1] bg-[#0c0f17] p-1 shadow-2xl backdrop-blur-md">
                        <div className="px-3 py-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                          {selectedCountryCode ? "Suggested Local Cities" : "Popular Global Destinations"}
                        </div>
                        {filteredDestinations.map((city, idx) => (
                          <button
                            key={`${city.name}-${idx}`}
                            type="button"
                            onClick={() => handleSelectDestination(city.name)}
                            className="flex items-center gap-2.5 w-full text-left px-3 py-2 text-sm text-slate-300 hover:bg-white/[0.05] hover:text-cyan-400 rounded-lg transition-colors"
                          >
                            <MapPin className="h-3.5 w-3.5 text-slate-500 group-hover:text-cyan-400" />
                            <span>{city.name}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-slate-400 font-medium block mb-1.5">
                      Start Date
                    </label>
                    <input
                      type="date"
                      required
                      value={formState.startDate}
                      onChange={(e) =>
                        setFormState({
                          ...formState,
                          startDate: e.target.value,
                        })
                      }
                      className="w-full bg-[#080a10] border border-white/[0.08] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500/50 [color-scheme:dark]"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 font-medium block mb-1.5">
                      End Date
                    </label>
                    <input
                      type="date"
                      required
                      value={formState.endDate}
                      onChange={(e) =>
                        setFormState({ ...formState, endDate: e.target.value })
                      }
                      className="w-full bg-[#080a10] border border-white/[0.08] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500/50 [color-scheme:dark]"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-slate-400 font-medium block mb-1.5">
                    Budget Allocation ($)
                  </label>
                  <input
                    type="number"
                    required
                    value={formState.budget || ""}
                    onChange={(e) =>
                      setFormState({
                        ...formState,
                        budget: Number(e.target.value),
                      })
                    }
                    placeholder="4000"
                    className="w-full bg-[#080a10] border border-white/[0.08] rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-cyan-500/50"
                  />
                </div>
                <div>
                  <label className="text-slate-400 font-medium block mb-1.5">
                    Context Scope & Notes
                  </label>
                  <textarea
                    rows={3}
                    value={formState.notes}
                    onChange={(e) =>
                      setFormState({ ...formState, notes: e.target.value })
                    }
                    placeholder="Describe key priorities, modular routes, structural stops..."
                    className="w-full bg-[#080a10] border border-white/[0.08] rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-cyan-500/50 resize-none"
                  />
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 rounded-xl border border-white/10 text-slate-400 hover:text-white transition-colors bg-transparent cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-cyan-50 text-[#080a10] font-semibold hover:bg-cyan-400 transition-colors shadow-lg border-none cursor-pointer"
                  >
                    Save Configuration
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal Layer */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDeleteConfirm(null)}
              className="absolute inset-0 bg-[#04060a]/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-[#0c0f17] border border-rose-500/20 w-full max-w-sm p-5 rounded-2xl shadow-2xl z-10 text-center"
            >
              <div className="h-10 w-10 bg-rose-500/10 border border-rose-500/20 rounded-full flex items-center justify-center mx-auto text-rose-400 mb-3">
                <Trash2 size={18} />
              </div>
              <h3 className="text-base font-bold text-white mb-1">
                Archive Trip Blueprint?
              </h3>
              <p className="text-slate-400 text-xs mb-5">
                This action safely detaches data segments. This can't be undone.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="flex-1 py-2 rounded-xl border border-white/10 text-xs text-slate-400 hover:text-white transition-colors bg-transparent cursor-pointer"
                >
                  Abort
                </button>
                <button
                  onClick={() => handleDeleteTrip(showDeleteConfirm)}
                  className="flex-1 py-2 rounded-xl bg-rose-500 text-white text-xs font-semibold hover:bg-rose-400 transition-colors border-none cursor-pointer"
                >
                  Confirm Removal
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

/* ─────────────────────────── Component: Main Dashboard ─────────────────────────── */
const AetherDashboard: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("Dashboard");
  const [trips, setTrips] = useState<TripItem[]>([]);
  const [isTripsLoading, setIsTripsLoading] = useState(false);
  const [tripsError, setTripsError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const heroRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const accessToken = useAuthStore((state) => state.accessToken);
  const fetchUserData = useUserStore((state) => state.fetchUserData);
  const userData = useUserStore((state) => state.data);
  const isLoading = useUserStore((state) => state.isLoading);
  const userDisplayName = isLoading
    ? "Loading..."
    : userData?.name || userData?.email || "Traveler";

  const fetchTrips = useCallback(async () => {
    if (!accessToken) return;

    setIsTripsLoading(true);
    setTripsError(null);
    try {
      const response = await fetch(TRIP_API_URL, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error(
          `Failed to fetch trips. Server responded with status ${response.status}`
        );
      }

      const result = await response.json();
      const payload = Array.isArray(result)
        ? result
        : (result.data ?? result.trips ?? []);
      setTrips(
        payload.map((trip: ApiTrip) => normalizeTrip(trip, userDisplayName))
      );
    } catch (error) {
      setTripsError(
        error instanceof Error ? error.message : "Failed to fetch trips."
      );
      setTrips([]);
    } finally {
      setIsTripsLoading(false);
    }
  }, [accessToken, userDisplayName]);

  const triggerToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  };

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;
    if (!accessToken) {
      router.replace("/");
    } else {
      fetchUserData();
    }
  }, [accessToken, router, fetchUserData, isMounted]);

  useEffect(() => {
    if (!isMounted || !accessToken) return;
    fetchTrips();
  }, [accessToken, fetchTrips, isMounted]);

  // Entrance GSAP Orchestration Trigger Effect
  useEffect(() => {
    if (!isMounted || !accessToken || activeTab !== "Dashboard") return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline();
      if (heroRef.current) {
        tl.fromTo(
          heroRef.current,
          { opacity: 0, y: 25 },
          { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" }
        );
      }
      tl.fromTo(
        ".gsap-stat-card",
        { opacity: 0, y: 30, scale: 0.97 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.6,
          ease: "power2.out",
          stagger: 0.08,
        },
        "-=0.5"
      );
    });
    return () => ctx.revert();
  }, [accessToken, isMounted, activeTab]);

  const navLinks = [
    { icon: <LayoutDashboard size={18} />, label: "Dashboard" },
    { icon: <Compass size={18} />, label: "My Trips" },
    { icon: <Sparkles size={18} />, label: "AI Planner" },
    { icon: <Users size={18} />, label: "Collaborators" },
    { icon: <Settings size={18} />, label: "Settings" },
  ];

  if (!isMounted || !accessToken) {
    return (
      <div className="min-h-screen bg-[#080a10] flex items-center justify-center">
        <div className="h-6 w-6 rounded-full border-2 border-cyan-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-[#080a10] text-white overflow-x-hidden font-sans antialiased selection:bg-cyan-500/30">
      <AuroraBackground />

      {/* ── Toast Notifications ── */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed top-6 right-6 z-[130] bg-cyan-900/80 backdrop-blur-xl border border-cyan-500/30 text-cyan-200 px-5 py-3 rounded-xl shadow-[0_0_30px_rgba(0,209,255,0.15)] flex items-center gap-2 text-sm font-medium"
          >
            <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Top Bar Navigation ── */}
      <header className="fixed top-0 inset-x-0 z-50 h-[68px] flex items-center justify-between px-6 md:px-12 border-b border-white/[0.06] bg-[#080a10]/80 backdrop-blur-2xl">
        <div className="flex items-center gap-10">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-cyan-400 to-sky-600 flex items-center justify-center">
              <Map size={16} className="text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight text-white">
              Aether<span className="text-cyan-400">.</span>
            </span>
          </div>
          <nav className="hidden md:flex items-center gap-1">
            {[
              "Dashboard",
              "Destinations",
              "Itineraries",
              "AI Assistant",
              "Community",
            ].map((item) => (
              <button
                key={item}
                onClick={() =>
                  setActiveTab(
                    item === "AI Assistant"
                      ? "AI Planner"
                      : item === "Destinations" || item === "Itineraries"
                        ? "My Trips"
                        : item
                  )
                }
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer border-none ${activeTab === item || (item === "AI Assistant" && activeTab === "AI Planner") || ((item === "Destinations" || item === "Itineraries") && activeTab === "My Trips") ? "text-cyan-400 bg-cyan-500/10" : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.05]"}`}
              >
                {item}
              </button>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <button className="p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-white/[0.06] transition-all bg-transparent border-none cursor-pointer">
            <Search size={18} />
          </button>
          <button className="p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-white/[0.06] transition-all relative bg-transparent border-none cursor-pointer">
            <Bell size={18} />
            <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-cyan-400 shadow-[0_0_6px_rgba(0,209,255,0.9)]" />
          </button>
          <button
            onClick={() => setActiveTab("My Trips")}
            className="hidden md:flex items-center gap-2 px-5 py-2 rounded-xl bg-cyan-500 text-[#080a10] text-sm font-semibold hover:bg-cyan-400 transition-colors duration-200 shadow-[0_0_20px_rgba(0,209,255,0.2)] border-none cursor-pointer"
          >
            <Plus size={15} />
            Start Planning
          </button>
          <div className="relative h-9 w-9 rounded-full overflow-hidden border-2 border-cyan-500/30">
            <Image
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCf85sTSU0A5UOsFd-Dprjjfjedp4nkjSOxDj72qX6Rk8MNdqetl4mhhA1UldyRads1O-Ud9-FCqqqQObqFGxRXXpnujJWF77qqyYisF4d-6UbRfzzvv-WrhHTR6IA_3rxzhf3pxQP5K0_utNtu43KRIyJlLdzhhxeUDiw5gaXCf7kLwXiYBl--itBL-wzQz_AvzIhJhacMaDTHk5BEPEYNnjQQOkRcyWfOLKiNfbQFY1wlCxUFSxbJgZaqmYjdh94S4pzqYNzPJA"
              alt={userDisplayName}
              fill
              className="object-cover"
              sizes="36px"
            />
          </div>
          <button
            className="md:hidden p-2 text-slate-400 hover:text-slate-200 bg-transparent border-none cursor-pointer"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>

      <div className="flex min-h-screen pt-[68px]">
        {/* ── Sidebar Layout ── */}
        <aside
          className={[
            "fixed top-[68px] left-0 h-[calc(100vh-68px)] w-64 border-r border-white/[0.06] bg-[#080a10]/90 backdrop-blur-2xl p-5 flex flex-col transition-transform duration-300 ease-in-out z-40 md:translate-x-0 transform-gpu",
            sidebarOpen
              ? "translate-x-0"
              : "-translate-x-full md:translate-x-0",
          ].join(" ")}
        >
          <div className="mb-6 px-2">
            <p className="text-base font-bold text-white truncate">
              {userDisplayName}
            </p>
            <p className="text-xs text-slate-500 mt-0.5 font-medium">
              Pro Explorer
            </p>
          </div>
          <nav className="flex-1 space-y-1">
            {navLinks.map((n) => (
              <SideNavItem
                key={n.label}
                icon={n.icon}
                label={n.label}
                active={activeTab === n.label}
                onClick={() => {
                  setActiveTab(n.label);
                  setSidebarOpen(false);
                }}
              />
            ))}
          </nav>
          <button
            onClick={() => setActiveTab("My Trips")}
            className="w-full py-3 mb-6 rounded-xl bg-gradient-to-r from-cyan-500 to-sky-500 text-[#080a10] text-sm font-bold flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,209,255,0.15)] hover:shadow-[0_0_30px_rgba(0,209,255,0.25)] transition-all duration-200 border-none cursor-pointer"
          >
            <Plus size={16} />
            New Trip
          </button>
          <div className="border-t border-white/[0.06] pt-4 space-y-1">
            <SideNavItem
              icon={<HelpCircle size={17} />}
              label="Support"
              onClick={() => setActiveTab("Settings")}
            />
            <SideNavItem
              icon={<LogOut size={17} />}
              label="Logout"
              danger
              onClick={() => router.push("/")}
            />
          </div>
        </aside>

        {/* ── Main Canvas Viewport ── */}
        <main className="relative z-10 flex-1 md:ml-64 px-6 md:px-12 py-10 min-h-screen">
          {activeTab === "Dashboard" ? (
            <DashboardOverview
              heroRef={heroRef}
              userDisplayName={userDisplayName}
              setActiveTab={setActiveTab}
            />
          ) : activeTab === "My Trips" ? (
            <TripsPage
              trips={trips}
              setTrips={setTrips}
              triggerToast={triggerToast}
              fetchTrips={fetchTrips}
              isTripsLoading={isTripsLoading}
              tripsError={tripsError}
              accessToken={accessToken}
            />
          ) : activeTab === "Collaborators" ? (
            <CollaboratorsPage
              trips={trips}
              accessToken={accessToken}
              triggerToast={triggerToast}
            />
          ) : (
            <AlternativeWorkspace
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              fallbackIcon={navLinks.find((n) => n.label === activeTab)?.icon}
            />
          )}
        </main>
      </div>

      {/* ── Mobile Navigation Bar Menu ── */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-50 flex justify-around items-center px-4 py-3 bg-[#080a10]/90 backdrop-blur-2xl border-t border-white/[0.07]">
        {[
          { icon: <Home size={22} />, label: "Home", target: "Dashboard" },
          { icon: <Compass size={22} />, label: "Trips", target: "My Trips" },
          { icon: <Bot size={22} />, label: "AI", target: "AI Planner" },
          { icon: <User size={22} />, label: "Profile", target: "Settings" },
        ].map((item) => (
          <button
            key={item.label}
            onClick={() => setActiveTab(item.target)}
            className={`flex flex-col items-center justify-center gap-1 px-4 py-1.5 rounded-xl transition-all border-none bg-transparent cursor-pointer ${activeTab === item.target ? "text-cyan-400 bg-cyan-500/10" : "text-slate-500 hover:text-slate-300"}`}
          >
            {item.icon}
            <span className="text-[10px] font-medium">{item.label}</span>
          </button>
        ))}
      </nav>

      {/* ── Global Footer Block ── */}
      <footer className="relative z-10 md:ml-64 border-t border-white/[0.06] bg-[#080a10]/80 backdrop-blur-xl px-6 md:px-12 py-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="h-6 w-6 rounded-lg bg-gradient-to-br from-cyan-400 to-sky-600 flex items-center justify-center">
              <Map size={12} className="text-white" />
            </div>
            <span className="text-sm font-bold text-white">Aether Travel</span>
          </div>
          <p className="text-slate-600 text-xs">
            © 2026 Aether Travel Technologies. All rights reserved.
          </p>
        </div>
        <div className="flex flex-wrap gap-6">
          {[
            "Privacy Policy",
            "Terms of Service",
            "Cookie Settings",
            "Global Support",
          ].map((link) => (
            <a
              key={link}
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setActiveTab("Settings");
              }}
              className="text-slate-500 text-xs hover:text-cyan-400 transition-colors duration-200 no-underline"
            >
              {link}
            </a>
          ))}
        </div>
      </footer>
    </div>
  );
};

export default AetherDashboard;