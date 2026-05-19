"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform, AnimatePresence, stagger, useAnimate , Variants } from "framer-motion";
import {
  LayoutDashboard, Compass, Sparkles, Users, Settings, Plus, HelpCircle,
  LogOut, Bell, Search, TrendingUp, CheckCircle2, CalendarDays,
  Plane, MessageSquare, Zap, ChevronRight, Map, Star, Clock,
  AlertCircle, Home, Bot, User, Menu, X, ArrowUpRight
} from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/* ─────────────────────────── Types ─────────────────────────── */
interface Trip {
  id: string;
  title: string;
  dates: string;
  image: string;
  imageAlt: string;
  badge: string;
  badgeVariant: "upcoming" | "past";
  collaborators?: { src: string; alt: string }[];
  rating?: number;
  extra?: number;
}

interface Activity {
  id: string;
  icon: React.ReactNode;
  iconBg: string;
  text: React.ReactNode;
  time: string;
}

interface Recommendation {
  id: string;
  title: string;
  location: string;
  image: string;
  imageAlt: string;
}

interface Deadline {
  id: string;
  label: string;
  timeLeft: string;
  progress: number;
  variant: "urgent" | "normal";
}

/* ─────────────────────────── Data ─────────────────────────── */
const TRIPS: Trip[] = [
  {
    id: "iceland",
    title: "Iceland Expedition",
    dates: "Sep 14 – Sep 28, 2024",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAOLOfwbsF8HlnngrN2Hrlsmhv2iE4J71X0uqYoxm8ZZesJOHnQ31OQz2LhOcRgdUm-4u3xbZvTsLYrT00GePhVbjkGSkd8hOI46b88kpSYkSXfeOROFE1KaYftt0DtiaYMw4UTDwevhJ4yaHNJWa97vbCxSpVpvWLpS9PxMd5bwdYYYUffOprHGy6ZFJF1JdC3BtcIHQOu_aYT7Y0bBejckYPF2kbMtDFqa-MkLaEeuYq5IbfG2bxby0FLG3U4xKrJGIk9b6X7mg",
    imageAlt: "Aurora Borealis over Icelandic glacial lagoon",
    badge: "In 12 Days",
    badgeVariant: "upcoming",
    collaborators: [
      { src: "https://lh3.googleusercontent.com/aida-public/AB6AXuDgeTGX5WKYysANQU1c1nRE_ra2jVymhEytWuT0PrEu1bVdfHlejXHYlaFD3lDeMHFMpmdgLlRoGTazN2PD9uFhsnpqqmqSxREZCddRUZxlP9-_1Aa-ZL0KweafmNI2r7A29ks5YgxnoxQ_ssJ2401Hf2m9sJv3mHfU8I_aW7A0PZqzYp8wf9i7LUKBY4aEOvhlcwp4iaFralwQt_y-_13_Wd61ZTDmtt5w_rhfHwkKB3rU1cDbGf4ssUiB8xDsRbAx8NQcLjznVA", alt: "Collaborator 1" },
      { src: "https://lh3.googleusercontent.com/aida-public/AB6AXuA34mk5mQE0ZIsN7U7YTOlxvkx9koen-XDeAV6bl3N9KqrguTzYUazXYSrHIbZh5mHYNNlCunl4FV6i37p19iYEzsx2YUArjUBCu3CNNE-YiK8lNVUkhwUHoQCl05R3nHjtzNR_UTUfSC7LzC2Dn9E0HMNWqmFlFMSY6AMUgwVv31P_dfg6brhHJnLjQfwWK8vMkn5Phsgo8nNjyXipRtoocdDDAXfJ6WMCqtI6K19bzJdCrpdKxcbDVYso8COep9YKEN8qykXoYg", alt: "Collaborator 2" },
    ],
    extra: 3,
  },
  {
    id: "alpine",
    title: "Alpine Retreat",
    dates: "Aug 02 – Aug 09, 2024",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDlu_c3L6B-u_hQYV3S3mOzNUG3LhLb5RNIfZ5tHEW0uijdPBIGLaaMU2XmpoCzbNuOmAUC7reCJAm1OOlodD-WU7Z_L6kAn8-t2PwXEWT8492CPE8NIArsv4VxYn-x20_1SEv1TBduAqOELG9TGwbCy4TJOiooOVM_cbumR3BzrcgO4it7SHUZDSpv6AoflsAumNnVhEnXloEyuuC30NudJsCczk7W-jUj7xjzwXzrAq1Bn56Z8ec7XW5rT0JEKuCRHNGGcckvQQ",
    imageAlt: "Luxury alpine pool with mountain backdrop",
    badge: "Past Trip",
    badgeVariant: "past",
    rating: 4.8,
  },
];

const RECOMMENDATIONS: Recommendation[] = [
  {
    id: "mirror-cube",
    title: "The Mirror Cube",
    location: "Harads, Sweden",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAXwNOlq11QjAM3aiNTGWBWJEXeyT9XinwH5TXngG0PIxhTm76njWSGyD-tNd_rtAbpf9Z-dwcbyWn5bCC014qWNL5NJ9oa-84Kj0KaKNeiUUnLXGdbzRgEoX5MP3H1id3os_BQ5RnZvE8U5_DaXILrOXDjTMzoabN6wV4kp24v8AxLOwwzJzipshHTSDVxYasTovSVlqYk_nSsZLqoKyDa8QYLR1hAVAcLKKn6nqZ7Nf4I3Twbdp5YoIHbCI_XuMKTvKtvzLYhDg",
    imageAlt: "Minimalist forest cabin with glass panels",
  },
  {
    id: "vora",
    title: "Vora Cliffside",
    location: "Santorini, Greece",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDNv5SzYSJm_ONQUEh8XDeI3YvPN9y9fU9fCc9Ket2I-F3duYyaLP82BslMSCVa3hr7Iye05nd1UHKSvyfB4OTuqPikRCS-IWW5WnJHiCXIXuYyrwBac4RGqjvu2wH0ics773nE8oUz3Pog04OZgzZFlaQAtgNAg-Cm3iaI5_ez4qOikstnROXKCNIIe3WH3KPzWObRZTYnZK4kLPfeSXZnUAqvbF0s4hXDSD4C18FP3lVdVpOSqaQaT-b-EzpFUkgAosF4bOMTbw",
    imageAlt: "Santorini infinity pool at dusk",
  },
  {
    id: "hotel-particulier",
    title: "L'Hôtel Particulier",
    location: "Paris, France",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBBIOIGCas8xytVTBr24SCGH0Da7Pg5t1FJ3YAmMcEWjs9pETYHnjCV34UtF2g9hg7Aw-Dh3rt5b9q2ZcFC-KhPY3C5a59ackkzdW1-ZhCCosJaH88YaP282LNkkKUIWXfN_WHilB4F3qqeNBI9_DQ0VLhgDkqpRuNtf3KOt42Gxi_sU2aVjsHTWVaLWgsDgl2FC9luIeBRHPsf2qBwtCnZIAggmRRsH8ERi6u9xcWhkNVVabC-ZnjB4eDwwQkaU3W03Yeh2Josmg",
    imageAlt: "Eiffel Tower at night through rain-streaked window",
  },
];

const DEADLINES: Deadline[] = [
  { id: "visa", label: "Iceland Visa", timeLeft: "2 days left", progress: 90, variant: "urgent" },
  { id: "hotel", label: "Hotel Booking", timeLeft: "In 5 days", progress: 40, variant: "normal" },
];

const ACTIVITIES: Activity[] = [
  {
    id: "a1",
    icon: <MessageSquare size={16} />,
    iconBg: "bg-sky-500/20 text-sky-400",
    text: <><strong className="text-white">Sarah Chen</strong> added 3 hidden gems to <strong className="text-white">Kyoto Discovery</strong></>,
    time: "2 hours ago",
  },
  {
    id: "a2",
    icon: <Plane size={16} />,
    iconBg: "bg-cyan-500/20 text-cyan-400",
    text: <>Flight prices dropped for your <strong className="text-white">Patagonia</strong> trip!</>,
    time: "5 hours ago",
  },
  {
    id: "a3",
    icon: <MessageSquare size={16} />,
    iconBg: "bg-slate-600/60 text-slate-400",
    text: <><strong className="text-white">Marcus</strong> commented: "Should we rent a 4x4 or a van for the coast road?"</>,
    time: "Yesterday",
  },
];

/* ─────────────────────────── Animation variants ─────────────────────────── */
const fadeUp:Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] },
  }),
};

const scaleIn:Variants = {
  hidden: { opacity: 0, scale: 0.94 },
  visible: (i = 0) => ({
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, delay: i * 0.07, ease: [0.22, 1, 0.36, 1] },
  }),
};

/* ─────────────────────────── Sub-components ─────────────────────────── */

/** Animated aurora / radial glow background — GPU-composited, no layout shift */
const AuroraBackground: React.FC = () => (
  <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
    <div className="absolute -top-1/2 left-1/2 -translate-x-1/2 h-[900px] w-[900px] rounded-full bg-cyan-500/[0.06] blur-[120px]" />
    <div className="absolute top-1/3 -left-1/4 h-[600px] w-[600px] rounded-full bg-sky-600/[0.05] blur-[100px]" />
    <div className="absolute bottom-0 right-0 h-[500px] w-[500px] rounded-full bg-indigo-600/[0.04] blur-[100px]" />
    {/* Animated orbit ring */}
    <motion.div
      className="absolute top-24 left-1/2 -translate-x-1/2 h-[700px] w-[700px] rounded-full border border-cyan-400/[0.04]"
      animate={{ rotate: 360 }}
      transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
    />
    <motion.div
      className="absolute top-32 left-1/2 -translate-x-1/2 h-[500px] w-[500px] rounded-full border border-sky-400/[0.04]"
      animate={{ rotate: -360 }}
      transition={{ duration: 45, repeat: Infinity, ease: "linear" }}
    />
    {/* Grid overlay */}
    <div
      className="absolute inset-0 opacity-[0.03]"
      style={{
        backgroundImage: "linear-gradient(rgba(0,209,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(0,209,255,0.8) 1px, transparent 1px)",
        backgroundSize: "72px 72px",
      }}
    />
  </div>
);

/** Sidebar nav item */
const SideNavItem: React.FC<{
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  danger?: boolean;
  onClick?: () => void;
}> = ({ icon, label, active, danger, onClick }) => (
  <motion.a
    href="#"
    onClick={onClick}
    whileHover={{ x: 3 }}
    whileTap={{ scale: 0.97 }}
    className={[
      "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer",
      active
        ? "bg-cyan-500/15 text-cyan-300 border border-cyan-500/20"
        : danger
        ? "text-slate-400 hover:text-red-400 hover:bg-red-500/10"
        : "text-slate-400 hover:text-slate-200 hover:bg-white/5",
    ].join(" ")}
  >
    <span className={active ? "text-cyan-400" : ""}>{icon}</span>
    <span>{label}</span>
    {active && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-cyan-400 shadow-[0_0_6px_rgba(0,209,255,0.8)]" />}
  </motion.a>
);

/** Stat card */
const StatCard: React.FC<{
  icon: React.ReactNode;
  iconColor: string;
  label: string;
  value: string;
  sub: string;
  subIcon?: React.ReactNode;
  delay?: number;
}> = ({ icon, iconColor, label, value, sub, subIcon, delay = 0 }) => (
  <motion.div
    variants={scaleIn}
    custom={delay}
    initial="hidden"
    animate="visible"
    className="relative overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.03] backdrop-blur-xl p-6 group hover:border-cyan-500/20 hover:bg-white/[0.05] transition-all duration-300"
  >
    {/* Subtle inner glow on hover */}
    <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl bg-gradient-to-br from-cyan-500/[0.04] to-transparent" />
    <span className={`mb-3 inline-flex ${iconColor}`}>{icon}</span>
    <p className="text-xs uppercase tracking-widest text-slate-500 font-medium mb-1">{label}</p>
    <p className="text-4xl font-bold text-white tracking-tight">{value}</p>
    <div className="mt-4 flex items-center gap-1.5 text-slate-400 text-sm">
      {subIcon && <span>{subIcon}</span>}
      <span>{sub}</span>
    </div>
  </motion.div>
);

/** Trip card */
const TripCard: React.FC<{ trip: Trip; delay?: number }> = ({ trip, delay = 0 }) => (
  <motion.div
    variants={scaleIn}
    custom={delay}
    initial="hidden"
    animate="visible"
    whileHover={{ y: -4 }}
    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
    className="group relative rounded-2xl overflow-hidden border border-white/[0.07] bg-white/[0.03] backdrop-blur-xl cursor-pointer hover:border-cyan-500/20 transition-all duration-300"
  >
    <div className="relative h-52 overflow-hidden">
      <motion.div
        whileHover={{ scale: 1.06 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full h-full"
      >
        <Image src={trip.image} alt={trip.imageAlt} fill className="object-cover" />
      </motion.div>
      <div className="absolute inset-0 bg-gradient-to-t from-[#080a10] via-[#080a10]/40 to-transparent" />
      <div className="absolute bottom-4 left-4">
        <span
          className={[
            "text-xs px-3 py-1.5 rounded-full border backdrop-blur-md font-medium",
            trip.badgeVariant === "upcoming"
              ? "bg-cyan-500/10 text-cyan-300 border-cyan-500/30"
              : "bg-white/[0.08] text-slate-400 border-white/10",
          ].join(" ")}
        >
          {trip.badge}
        </span>
      </div>
    </div>
    <div className="p-5">
      <h3 className="text-base font-semibold text-white mb-1 group-hover:text-cyan-300 transition-colors duration-200">
        {trip.title}
      </h3>
      <p className="text-slate-500 text-sm mb-4">{trip.dates}</p>
      {trip.collaborators && (
        <div className="flex items-center -space-x-2">
          {trip.collaborators.map((c) => (
            <div key={c.alt} className="relative h-8 w-8 rounded-full border-2 border-[#080a10] overflow-hidden">
              <Image src={c.src} alt={c.alt} fill className="object-cover" />
            </div>
          ))}
          {trip.extra && (
            <div className="h-8 w-8 rounded-full border-2 border-[#080a10] bg-slate-700 flex items-center justify-center text-[10px] font-bold text-slate-300">
              +{trip.extra}
            </div>
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

/** Activity feed item */
const ActivityItem: React.FC<{ item: Activity; delay?: number }> = ({ item, delay = 0 }) => (
  <motion.div
    variants={fadeUp}
    custom={delay}
    initial="hidden"
    animate="visible"
    className="flex items-start gap-4"
  >
    <div className={`h-10 w-10 rounded-full flex-shrink-0 flex items-center justify-center ${item.iconBg}`}>
      {item.icon}
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-slate-300 text-sm leading-relaxed">{item.text}</p>
      <p className="text-slate-600 text-xs mt-1">{item.time}</p>
    </div>
  </motion.div>
);

/** AI recommendation item */
const RecommendationItem: React.FC<{ rec: Recommendation; delay?: number }> = ({ rec, delay = 0 }) => (
  <motion.div
    variants={fadeUp}
    custom={delay}
    initial="hidden"
    animate="visible"
    whileHover={{ x: 4 }}
    transition={{ duration: 0.25 }}
    className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/[0.05] transition-colors cursor-pointer group"
  >
    <div className="relative h-14 w-14 rounded-xl overflow-hidden flex-shrink-0 border border-white/[0.07]">
      <Image src={rec.image} alt={rec.imageAlt} fill className="object-cover" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-slate-200 text-sm font-semibold group-hover:text-cyan-300 transition-colors duration-200 truncate">
        {rec.title}
      </p>
      <p className="text-slate-500 text-xs mt-0.5">{rec.location}</p>
    </div>
    <ArrowUpRight size={14} className="text-slate-600 group-hover:text-cyan-400 transition-colors flex-shrink-0" />
  </motion.div>
);

/* ─────────────────────────── Main Dashboard ─────────────────────────── */
const AetherDashboard: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);
  const [scope, animate] = useAnimate();

  /* GSAP hero entrance */
  useEffect(() => {
    if (!heroRef.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        heroRef.current,
        { opacity: 0, y: 32 },
        { opacity: 1, y: 0, duration: 0.9, ease: "power3.out", delay: 0.1 }
      );
    });
    return () => ctx.revert();
  }, []);

  /* GSAP stat cards stagger */
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".gsap-stat-card",
        { opacity: 0, y: 40, scale: 0.95 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.7,
          ease: "power3.out",
          stagger: 0.1,
          delay: 0.3,
        }
      );
    });
    return () => ctx.revert();
  }, []);

  const navLinks = [
    { icon: <LayoutDashboard size={18} />, label: "Dashboard", active: true },
    { icon: <Compass size={18} />, label: "My Trips" },
    { icon: <Sparkles size={18} />, label: "AI Planner" },
    { icon: <Users size={18} />, label: "Collaborators" },
    { icon: <Settings size={18} />, label: "Settings" },
  ];

  return (
    <div className="relative min-h-screen bg-[#080a10] text-white overflow-x-hidden font-sans">
      <AuroraBackground />

      {/* ── Top AppBar ── */}
      <header className="fixed top-0 inset-x-0 z-50 h-[68px] flex items-center justify-between px-6 md:px-12 border-b border-white/[0.06] bg-[#080a10]/80 backdrop-blur-2xl">
        <div className="flex items-center gap-10">
          <motion.div
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="flex items-center gap-2"
          >
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-cyan-400 to-sky-600 flex items-center justify-center">
              <Map size={16} className="text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight text-white">
              Aether<span className="text-cyan-400">.</span>
            </span>
          </motion.div>
          <nav className="hidden md:flex items-center gap-1">
            {["Dashboard", "Destinations", "Itineraries", "AI Assistant", "Community"].map((item, i) => (
              <motion.a
                key={item}
                href="#"
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * i + 0.2, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className={`px-4 py-2 rounded-lg text-sm transition-all duration-200 ${
                  item === "Dashboard"
                    ? "text-cyan-400 bg-cyan-500/10"
                    : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.05]"
                }`}
              >
                {item}
              </motion.a>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-white/[0.06] transition-all"
          >
            <Search size={18} />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-white/[0.06] transition-all relative"
          >
            <Bell size={18} />
            <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-cyan-400 shadow-[0_0_6px_rgba(0,209,255,0.9)]" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            className="hidden md:flex items-center gap-2 px-5 py-2 rounded-xl bg-cyan-500 text-[#080a10] text-sm font-semibold hover:bg-cyan-400 transition-colors duration-200 shadow-[0_0_20px_rgba(0,209,255,0.2)]"
          >
            <Plus size={15} />
            Start Planning
          </motion.button>
          <div className="relative h-9 w-9 rounded-full overflow-hidden border-2 border-cyan-500/30 cursor-pointer">
            <Image
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCf85sTSU0A5UOsFd-Dprjjfjedp4nkjSOxDj72qX6Rk8MNdqetl4mhhA1UldyRads1O-Ud9-FCqqqQObqFGxRXXpnujJWF77qqyYisF4d-6UbRfzzvv-WrhHTR6IA_3rxzhf3pxQP5K0_utNtu43KRIyJlLdzhhxeUDiw5gaXCf7kLwXiYBl--itBL-wzQz_AvzIhJhacMaDTHk5BEPEYNnjQQOkRcyWfOLKiNfbQFY1wlCxUFSxbJgZaqmYjdh94S4pzqYNzPJA"
              alt="Alex Rivera"
              fill
              className="object-cover"
            />
          </div>
          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 text-slate-400 hover:text-slate-200"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>

      <div className="flex min-h-screen pt-[68px]">
        {/* ── Sidebar ── */}
        <AnimatePresence>
          {(sidebarOpen || true) && (
            <motion.aside
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className={[
                "fixed top-[68px] left-0 h-[calc(100vh-68px)] w-64 z-40 flex flex-col border-r border-white/[0.06] bg-[#080a10]/90 backdrop-blur-2xl p-5",
                sidebarOpen ? "flex" : "hidden md:flex",
              ].join(" ")}
            >
              {/* Profile */}
              <div className="mb-6 px-2">
                <p className="text-base font-bold text-white">Alex Rivera</p>
                <p className="text-xs text-slate-500 mt-0.5">Pro Explorer</p>
              </div>

              {/* Nav */}
              <nav className="flex-1 space-y-1">
                {navLinks.map((n) => (
                  <SideNavItem key={n.label} icon={n.icon} label={n.label} active={n.active} />
                ))}
              </nav>

              {/* New Trip CTA */}
              <motion.button
                whileHover={{ scale: 1.02, boxShadow: "0 0 30px rgba(0,209,255,0.25)" }}
                whileTap={{ scale: 0.97 }}
                className="w-full py-3 mb-6 rounded-xl bg-gradient-to-r from-cyan-500 to-sky-500 text-[#080a10] text-sm font-bold flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,209,255,0.15)] transition-all duration-200"
              >
                <Plus size={16} />
                New Trip
              </motion.button>

              {/* Footer links */}
              <div className="border-t border-white/[0.06] pt-4 space-y-1">
                <SideNavItem icon={<HelpCircle size={17} />} label="Support" />
                <SideNavItem icon={<LogOut size={17} />} label="Logout" danger />
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* ── Main Canvas ── */}
        <main className="relative z-10 flex-1 md:ml-64 px-6 md:px-12 py-10 min-h-screen">

          {/* Hero header */}
          <section ref={heroRef} className="mb-12 opacity-0">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-2">
              Welcome back,{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-sky-400">
                Alex
              </span>
            </h1>
            <p className="text-slate-400 text-lg">Your next adventure in Iceland starts in 12 days.</p>
          </section>

          {/* Stat cards */}
          <section className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-12">
            {[
              {
                icon: <CalendarDays size={22} />, iconColor: "text-cyan-400",
                label: "Upcoming", value: "04",
                sub: "2 new this month", subIcon: <TrendingUp size={13} className="text-cyan-400" />,
              },
              {
                icon: <CheckCircle2 size={22} />, iconColor: "text-sky-400",
                label: "Completed", value: "28",
                sub: "Across 14 countries",
              },
              {
                icon: <Users size={22} />, iconColor: "text-indigo-400",
                label: "Members", value: "12",
                sub: "Active collaborators",
              },
            ].map((s, i) => (
              <div key={s.label} className="gsap-stat-card opacity-0">
                <StatCard {...s} delay={i} />
              </div>
            ))}
          </section>

          {/* Main grid */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
            {/* Left column */}
            <div className="xl:col-span-8 space-y-8">
              {/* My Trips */}
              <div>
                <div className="flex justify-between items-center mb-5">
                  <motion.h2
                    variants={fadeUp}
                    initial="hidden"
                    animate="visible"
                    className="text-xl font-semibold text-white"
                  >
                    My Trips
                  </motion.h2>
                  <motion.button
                    variants={fadeUp}
                    initial="hidden"
                    animate="visible"
                    whileHover={{ x: 2 }}
                    className="text-cyan-400 text-sm font-medium flex items-center gap-1 hover:text-cyan-300 transition-colors"
                  >
                    View All <ChevronRight size={14} />
                  </motion.button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {TRIPS.map((trip, i) => (
                    <TripCard key={trip.id} trip={trip} delay={i} />
                  ))}
                </div>
              </div>

              {/* Recent Activity */}
              <motion.div
                variants={scaleIn}
                initial="hidden"
                animate="visible"
                className="rounded-2xl border border-white/[0.07] bg-white/[0.03] backdrop-blur-xl p-7"
              >
                <h2 className="text-xl font-semibold text-white mb-6">Recent Activity</h2>
                <div className="space-y-6">
                  {ACTIVITIES.map((item, i) => (
                    <ActivityItem key={item.id} item={item} delay={i} />
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Right sidebar */}
            <div className="xl:col-span-4 space-y-5">
              {/* AI Insights */}
              <motion.div
                variants={scaleIn}
                initial="hidden"
                animate="visible"
                className="relative overflow-hidden rounded-2xl border border-cyan-500/20 bg-cyan-500/[0.04] backdrop-blur-xl p-6"
              >
                {/* Glowing orb */}
                <div className="pointer-events-none absolute -top-12 -right-12 h-36 w-36 rounded-full bg-cyan-400/10 blur-3xl" />

                <div className="flex items-center gap-2 mb-2">
                  <div className="h-7 w-7 rounded-lg bg-cyan-500/20 flex items-center justify-center">
                    <Zap size={14} className="text-cyan-400" />
                  </div>
                  <h2 className="text-cyan-300 font-semibold">AI Insights</h2>
                </div>
                <p className="text-slate-400 text-sm leading-relaxed mb-6">
                  Based on your love for minimalist architecture and alpine landscapes, we've found these unique spots.
                </p>
                <div className="space-y-1">
                  {RECOMMENDATIONS.map((rec, i) => (
                    <RecommendationItem key={rec.id} rec={rec} delay={i} />
                  ))}
                </div>
                <motion.button
                  whileHover={{ scale: 1.02, boxShadow: "0 0 24px rgba(0,209,255,0.2)" }}
                  whileTap={{ scale: 0.97 }}
                  className="w-full mt-5 py-3 rounded-xl border border-cyan-500/30 text-cyan-400 text-sm font-semibold hover:bg-cyan-500/10 transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <Sparkles size={14} />
                  Generate Itinerary
                </motion.button>
              </motion.div>

              {/* Upcoming Deadlines */}
              <motion.div
                variants={scaleIn}
                custom={1}
                initial="hidden"
                animate="visible"
                className="rounded-2xl border border-white/[0.07] bg-white/[0.03] backdrop-blur-xl p-6"
              >
                <h3 className="text-white font-semibold mb-5 flex items-center gap-2">
                  <Clock size={16} className="text-slate-400" />
                  Upcoming Deadlines
                </h3>
                <div className="space-y-5">
                  {DEADLINES.map((d) => (
                    <div key={d.id}>
                      <div className="flex justify-between items-center text-sm mb-2">
                        <span className="text-slate-400">{d.label}</span>
                        <span className={d.variant === "urgent" ? "text-red-400 font-semibold" : "text-slate-300 font-medium"}>
                          {d.variant === "urgent" && <AlertCircle size={12} className="inline mr-1" />}
                          {d.timeLeft}
                        </span>
                      </div>
                      <div className="h-1 rounded-full bg-white/[0.06] overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${d.progress}%` }}
                          transition={{ duration: 1.2, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
                          className={`h-full rounded-full ${
                            d.variant === "urgent"
                              ? "bg-gradient-to-r from-red-500 to-orange-400"
                              : "bg-gradient-to-r from-cyan-500 to-sky-400"
                          }`}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </main>
      </div>

      {/* ── Mobile Bottom Nav ── */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-50 flex justify-around items-center px-4 py-3 bg-[#080a10]/90 backdrop-blur-2xl border-t border-white/[0.07]">
        {[
          { icon: <Home size={22} />, label: "Home", active: true },
          { icon: <Compass size={22} />, label: "Trips" },
          { icon: <Bot size={22} />, label: "AI" },
          { icon: <User size={22} />, label: "Profile" },
        ].map((item) => (
          <motion.a
            key={item.label}
            href="#"
            whileTap={{ scale: 0.88 }}
            className={`flex flex-col items-center justify-center gap-1 px-4 py-1.5 rounded-xl transition-all ${
              item.active ? "text-cyan-400 bg-cyan-500/10" : "text-slate-500 hover:text-slate-300"
            }`}
          >
            {item.icon}
            <span className="text-[10px] font-medium">{item.label}</span>
          </motion.a>
        ))}
      </nav>

      {/* ── Footer ── */}
      <footer className="relative z-10 md:ml-64 border-t border-white/[0.06] bg-[#080a10]/80 backdrop-blur-xl px-6 md:px-12 py-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="h-6 w-6 rounded-lg bg-gradient-to-br from-cyan-400 to-sky-600 flex items-center justify-center">
              <Map size={12} className="text-white" />
            </div>
            <span className="text-sm font-bold text-white">Aether Travel</span>
          </div>
          <p className="text-slate-600 text-xs">© 2024 Aether Travel Technologies. All rights reserved.</p>
        </div>
        <div className="flex flex-wrap gap-6">
          {["Privacy Policy", "Terms of Service", "Cookie Settings", "Global Support"].map((link) => (
            <motion.a
              key={link}
              href="#"
              whileHover={{ color: "#22d3ee" }}
              className="text-slate-500 text-xs hover:text-cyan-400 transition-colors duration-200"
            >
              {link}
            </motion.a>
          ))}
        </div>
      </footer>
    </div>
  );
};

export default AetherDashboard;