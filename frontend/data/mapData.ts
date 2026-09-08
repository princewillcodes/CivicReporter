import { reports, Report } from "./mockData";

export type MapReport = Report & { latitude: number; longitude: number; urgency: "High" | "Medium" | "Low" };

const coordinates = [[49, 27, "High"], [32, 61, "Medium"], [67, 73, "Low"], [72, 41, "High"]] as const;

export const mapReports: MapReport[] = reports.map((report, index) => ({
  ...report,
  latitude: coordinates[index][0],
  longitude: coordinates[index][1],
  urgency: coordinates[index][2],
}));
