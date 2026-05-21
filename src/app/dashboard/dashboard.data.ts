import React from "react";
import { MessageSquare, Plane } from "lucide-react";
import { Trip, Recommendation, Deadline, Activity } from "./dashboard.types";

export const TRIPS: Trip[] = [
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

export const RECOMMENDATIONS: Recommendation[] = [
  { id: "mirror-cube", title: "The Mirror Cube", location: "Harads, Sweden", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAXwNOlq11QjAM3aiNTGWBWJEXeyT9XinwH5TXngG0PIxhTm76njWSGyD-tNd_rtAbpf9Z-dwcbyWn5bCC014qWNL5NJ9oa-84Kj0KaKNeiUUnLXGdbzRgEoX5MP3H1id3os_BQ5RnZvE8U5_DaXILrOXDjTMzoabN6wV4kp24v8AxLOwwzJzipshHTSDVxYasTovSVlqYk_nSsZLqoKyDa8QYLR1hAVAcLKKn6nqZ7Nf4I3Twbdp5YoIHbCI_XuMKTvKtvzLYhDg", imageAlt: "Minimalist forest cabin" },
  { id: "vora", title: "Vora Cliffside", location: "Santorini, Greece", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDNv5SzYSJm_ONQUEh8XDeI3YvPN9y9fU9fCc9Ket2I-F3duYyaLP82BslMSCVa3hr7Iye05nd1UHKSvyfB4OTuqPikRCS-IWW5WnJHiCXIXuYyrwBac4RGqjvu2wH0ics773nE8oUz3Pog04OZgzZFlaQAtgNAg-Cm3iaI5_ez4qOikstnROXKCNIIe3WH3KPzWObRZTYnZK4kLPfeSXZnUAqvbF0s4hXDSD4C18FP3lVdVpOSqaQaT-b-EzpFUkgAosF4bOMTbw", imageAlt: "Santorini infinity pool" },
  { id: "hotel-particulier", title: "L'Hôtel Particulier", location: "Paris, France", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBBIOIGCas8xytVTBr24SCGH0Da7Pg5t1FJ3YAmMcEWjs9pETYHnjCV34UtF2g9hg7Aw-Dh3rt5b9q2ZcFC-KhPY3C5a59ackkzdW1-ZhCCosJaH88YaP282LNkkKUIWXfN_WHilB4F3qqeNBI9_DQ0VLhgDkqpRuNtf3KOt42Gxi_sU2aVjsHTWVaLWgsDgl2FC9luIeBRHPsf2qBwtCnZIAggmRRsH8ERi6u9xcWhkNVVabC-ZnjB4eDwwQkaU3W03Yeh2Josmg", imageAlt: "Eiffel Tower vista" },
];

export const DEADLINES: Deadline[] = [
  { id: "visa", label: "Iceland Visa", timeLeft: "2 days left", progress: 90, variant: "urgent" },
  { id: "hotel", label: "Hotel Booking", timeLeft: "In 5 days", progress: 40, variant: "normal" },
];

export const ACTIVITIES: Activity[] = [
  { 
    id: "a1", 
    icon: React.createElement(MessageSquare, { size: 16 }), 
    iconBg: "bg-sky-500/20 text-sky-400", 
    text: React.createElement(React.Fragment, null, 
      React.createElement("strong", { className: "text-white" }, "Sarah Chen"), " added spots to ", React.createElement("strong", { className: "text-white" }, "Kyoto")
    ), 
    time: "2 hours ago" 
  },
  { 
    id: "a2", 
    icon: React.createElement(Plane, { size: 16 }), 
    iconBg: "bg-cyan-500/20 text-cyan-400", 
    text: React.createElement(React.Fragment, null, "Flight drop notice for ", React.createElement("strong", { className: "text-white" }, "Patagonia"), "!"), 
    time: "5 hours ago" 
  },
  { 
    id: "a3", 
    icon: React.createElement(MessageSquare, { size: 16 }), 
    iconBg: "bg-slate-600/60 text-slate-400", 
    text: React.createElement(React.Fragment, null, React.createElement("strong", { className: "text-white" }, "Marcus"), " commented on rental options"), 
    time: "Yesterday" 
  },
];