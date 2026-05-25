import { ReactNode } from "react";

export interface Trip {
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

export interface Activity {
  id: string;
  icon: ReactNode;
  iconBg: string;
  text: ReactNode;
  time: string;
}

export interface Recommendation {
  id: string;
  title: string;
  location: string;
  image: string;
  imageAlt: string;
}

export interface Deadline {
  id: string;
  label: string;
  timeLeft: string;
  progress: number;
  variant: "urgent" | "normal";
}
export interface Member {
  id: string;
  userId: string;
  memberName: string;
  avatar?: string;
  role: "OWNER" | "MEMBER";
  joinedAt: string;
}

export interface TripCollaborators {
  tripId: string;
  tripTitle: string;
  members: Member[];
}