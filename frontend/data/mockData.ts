export type ReportStatus =
  | "Submitted"
  | "Under Review"
  | "Assigned"
  | "In Progress"
  | "Resolved"
  | "Rejected"
  | "Duplicate";

export type Report = {
  id: string;
  title: string;
  category: string;
  description: string;
  status: ReportStatus;
  area: string;
  municipality: string;
  time: string;
  distance: string;
  confirmations: number;
  accent: "red" | "amber" | "green" | "blue";
};

export type DashboardData = {
  greeting: string;
  citizenName: string;
  dateLabel: string;
  civicArea: string;
  civicAreaDescription: string;
  nearbyReportCount: number;
  resolvedReportCount: number;
};

export const dashboardData: DashboardData = {
  greeting: "Welcome back",
  citizenName: "citizen",
  dateLabel: "Tuesday, 08 September 2026",
  civicArea: "Accra Metropolitan",
  civicAreaDescription: "Reports here are routed to the assembly responsible for this location.",
  nearbyReportCount: 24,
  resolvedReportCount: 18,
};

export type MockWeather = {
  condition: string;
  temperature: string;
  dateTime: string;
};

export const mockWeatherConditions: Record<"rainy" | "cloudy" | "sunny", MockWeather> = {
  rainy: {
    condition: "Heavy rain",
    temperature: "22°",
    dateTime: "Tuesday · 11:00",
  },
  cloudy: {
    condition: "Overcast skies",
    temperature: "24°",
    dateTime: "Tuesday · 13:00",
  },
  sunny: {
    condition: "Clear and sunny",
    temperature: "28°",
    dateTime: "Tuesday · 15:00",
  },
};

export const currentMockWeather = mockWeatherConditions.rainy;

export const assemblyInsights = [
  { municipality: "Accra Metropolitan", reports: 24, statusIndex: "Active", averageResolution: "3.2 days", trend: "+12%" },
  { municipality: "La Dadekotopon Municipal", reports: 17, statusIndex: "Watching", averageResolution: "4.8 days", trend: "+6%" },
  { municipality: "Korle Klottey Municipal", reports: 11, statusIndex: "Active", averageResolution: "2.6 days", trend: "−4%" },
  { municipality: "Ablekuma Central Municipal", reports: 8, statusIndex: "Improving", averageResolution: "5.1 days", trend: "+9%" },
];

export const reports: Report[] = [
  {
    id: "CR-2048",
    title: "Open drain on Osu Oxford Street",
    category: "Flooding & drainage",
    description: "The drain beside the pedestrian crossing is uncovered and collecting debris.",
    status: "In Progress",
    area: "Osu, Accra",
    municipality: "Accra Metropolitan",
    time: "2 hours ago",
    distance: "0.8 km",
    confirmations: 12,
    accent: "amber",
  },
  {
    id: "CR-2041",
    title: "Streetlight out near Danquah Circle",
    category: "Street lighting",
    description: "Three lights along the northbound side have been out since last week.",
    status: "Assigned",
    area: "Labone, Accra",
    municipality: "Accra Metropolitan",
    time: "Yesterday",
    distance: "1.4 km",
    confirmations: 8,
    accent: "blue",
  },
  {
    id: "CR-1976",
    title: "Overflowing public waste bin",
    category: "Waste & sanitation",
    description: "The bin at the community park has not been collected and is overflowing onto the pavement.",
    status: "Resolved",
    area: "Cantonments, Accra",
    municipality: "La Dadekotopon Municipal",
    time: "4 days ago",
    distance: "2.1 km",
    confirmations: 19,
    accent: "green",
  },
  {
    id: "CR-1958",
    title: "Pothole widening on Ring Road",
    category: "Roads & transport",
    description: "A deep pothole is affecting the left lane after the roundabout.",
    status: "Under Review",
    area: "Asylum Down, Accra",
    municipality: "Korle Klottey Municipal",
    time: "6 days ago",
    distance: "2.7 km",
    confirmations: 6,
    accent: "red",
  },
];

export const categories = [
  { label: "Roads & transport", icon: "road", color: "orange" },
  { label: "Waste & sanitation", icon: "bin", color: "green" },
  { label: "Flooding & drainage", icon: "water", color: "blue" },
  { label: "Street lighting", icon: "light", color: "amber" },
  { label: "Water supply", icon: "drop", color: "cyan" },
  { label: "Other issue", icon: "more", color: "slate" },
];
