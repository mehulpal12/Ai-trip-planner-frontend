import React from "react";
import { MessageSquare, Plane } from "lucide-react";
import { ActivityLog, RecommendationCard, DeadlineTask } from "../types/dashboard.types";

export const RECOMMENDATIONS: RecommendationCard[] = [
  {
    id: "r1",
    title: "Glacial Ice Cave Exploring",
    location: "Vatnajökull, Iceland",
    image: "https://images.unsplash.com/photo-1504893524553-ac55fce698be?auto=format&fit=crop&w=400&q=80",
    imageAlt: "Glacial cavern interior",
  },
  {
    id: "r2",
    title: "Hidden Hot Springs Hike",
    location: "Reykjadalur, Iceland",
    image: "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?auto=format&fit=crop&w=400&q=80",
    imageAlt: "Thermal valley steam",
  },
];

export const DEADLINES: DeadlineTask[] = [
  { id: "visa", label: "Iceland Visa App", timeLeft: "2 days left", progress: 90, variant: "urgent" },
  { id: "hotel", label: "Basecamp Hotel Booking", timeLeft: "In 5 days", progress: 40, variant: "normal" },
];

export const STATIC_ACTIVITIES: ActivityLog[] = [
  {
    id: "a1",
    icon: React.createElement(MessageSquare, { size: 14 }),
    iconBg: "bg-cyan-500/10 text-cyan-400",
    text: React.createElement(React.Fragment, null, "Sarah Chen requested access authorization to updates."),
    time: "2 hours ago",
  },
  {
    id: "a2",
    icon: React.createElement(Plane, { size: 14 }),
    iconBg: "bg-emerald-500/10 text-emerald-400",
    text: React.createElement(React.Fragment, null, "Flight tracking nodes parsed for local routes."),
    time: "1 day ago",
  },
];