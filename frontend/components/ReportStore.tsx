"use client";

import { createContext, useContext, useMemo, useState } from "react";
import { reports as initialReports, Report } from "../data/mockData";

type ReportStoreValue = { reports: Report[]; addReport: (report: Report) => void };
const ReportStoreContext = createContext<ReportStoreValue | null>(null);

export function ReportStoreProvider({ children }: { children: React.ReactNode }) { const [reports, setReports] = useState(initialReports); const value = useMemo(() => ({ reports, addReport: (report: Report) => setReports(current => [report, ...current.filter(item => item.id !== report.id)]) }), [reports]); return <ReportStoreContext.Provider value={value}>{children}</ReportStoreContext.Provider>; }
export function useReportStore() { const value = useContext(ReportStoreContext); if (!value) throw new Error("useReportStore must be used inside ReportStoreProvider"); return value; }
