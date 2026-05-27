import { ReactNode } from "react";

export interface TripItem {
  _id: string; // Synced with Express/MongoDB Conventional Identifier
  title: string;
  country?: string;
  destination: string;
  startDate: string;
  endDate: string;
  budget: number;
  notes: string;
  owner: string | { _id: string; name: string; email: string; avatar?: string };
  members: Array<{ _id: string; name: string; memberName?: string; avatar?: string }>;
  activities: Array<{ id: string; text: string; time: string }>;
  createdAt?: string;
}

export interface ActivityLog {
  id: string;
  icon: ReactNode;
  iconBg: string;
  text: ReactNode;
  time: string;
}

export interface RecommendationCard {
  id: string;
  title: string;
  location: string;
  image: string;
  imageAlt: string;
}

export interface DeadlineTask {
  id: string;
  label: string;
  timeLeft: string;
  progress: number;
  variant: "urgent" | "normal";
}