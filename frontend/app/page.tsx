"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AppShell } from "../components/AppShell";
import { Icon } from "../components/Icon";
import { MapCanvas } from "../components/MapCanvas";
import { ReportCard } from "../components/ReportCard";
import { ReportFlow as NewReportFlow } from "../components/ReportFlow";
import { InsightsPanel } from "../components/InsightsPanel";
import { ChatPanel } from "../components/ChatPanel";
import { currentMockWeather, dashboardData, Report } from "../data/mockData";
import { useReportStore } from "../components/ReportStore";

type WeatherVisual = "rainy" | "cloudy" | "sunny";

const weatherImages: Record<WeatherVisual, string> = {
  rainy: "/weather/rainy-ghana.png",
  cloudy: "/weather/cloudy-ghana.png",
  sunny: "/weather/sunny-ghana.png",
};

function getWeatherVisual(condition: string): WeatherVisual {
  const normalizedCondition = condition.trim().toLowerCase();

  if (normalizedCondition.includes("rain")) return "rainy";
  if (normalizedCondition.includes("cloud") || normalizedCondition.includes("overcast")) return "cloudy";
  if (normalizedCondition.includes("sun") || normalizedCondition.includes("clear")) return "sunny";

  return "cloudy";
}

function WeatherBackdrop({ imageUrl }: { imageUrl: string }) {
  const [activeImage, setActiveImage] = useState(imageUrl);
  const [incomingImage, setIncomingImage] = useState<string | null>(null);

  useEffect(() => {
    if (imageUrl === activeImage) return;

    const preloader = new Image();
    let transitionTimer: number | undefined;
    preloader.src = imageUrl;
    preloader.onload = () => {
      setIncomingImage(imageUrl);
      transitionTimer = window.setTimeout(() => {
        setActiveImage(imageUrl);
        setIncomingImage(null);
      }, 600);
    };

    return () => {
      preloader.onload = null;
      if (transitionTimer) window.clearTimeout(transitionTimer);
    };
  }, [activeImage, imageUrl]);

  return <>
    <span className="weather-image-layer" style={{ backgroundImage: `url(${activeImage})` }} aria-hidden="true" />
    {incomingImage && <span className="weather-image-layer weather-image-incoming" style={{ backgroundImage: `url(${incomingImage})` }} aria-hidden="true" />}
  </>;
}

export default function Home() {
  const pathname = usePathname();
  const router = useRouter();
  const active = pathname === "/map" ? "map" : pathname === "/reports" ? "reports" : pathname === "/chat" ? "nearby" : pathname === "/profile" ? "profile" : pathname === "/notifications" ? "notifications" : "home";
  const navigate = (value: string) => {
    const routes: Record<string, string> = { home: "/", map: "/map", reports: "/reports", nearby: "/chat", profile: "/profile", notifications: "/notifications" };
    if (routes[value]) router.push(routes[value]);
  };
  const [reportOpen, setReportOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const { reports, addReport } = useReportStore();
  return <AppShell active={active} onNavigate={navigate} onReport={() => setReportOpen(true)}>
    {active === "home" && <Dashboard onNavigate={navigate} onReport={() => setReportOpen(true)} onSelect={setSelectedReport} />}
    {active === "map" && <MapScreen onReport={() => setReportOpen(true)} />}
    {active === "reports" && <ReportsHub reports={reports} onSelect={setSelectedReport} onReport={() => setReportOpen(true)} />}
    {active === "nearby" && <ChatPanel />}
    {active === "profile" && <Profile />}
    {active === "notifications" && <Notifications />}
    {reportOpen && <NewReportFlow onClose={() => setReportOpen(false)} onSubmitted={report => addReport(report)} />}
    {selectedReport && <ReportDetails report={selectedReport} onClose={() => setSelectedReport(null)} />}
  </AppShell>;
}

function PageHeader({ eyebrow, title, action }: { eyebrow: string; title: string; action?: React.ReactNode }) { return <div className="page-header"><div><span className="section-kicker">{eyebrow}</span><h1>{title}</h1></div>{action}</div>; }

function Dashboard({ onNavigate, onReport, onSelect }: { onNavigate: (value: string) => void; onReport: () => void; onSelect: (report: Report) => void }) {
  const { reports } = useReportStore();
  const weather = getWeatherVisual(currentMockWeather.condition);
  return <div className="page-wrap"><div className="welcome-row"><div><span className="section-kicker">{dashboardData.dateLabel}</span><h1>{dashboardData.greeting}, <em>{dashboardData.citizenName}.</em></h1><p className="lead">Help keep your neighbourhood moving forward.</p></div><button className="avatar desktop-avatar" onClick={() => onNavigate("profile")} aria-label="Open profile">AK</button></div>
    <section className={`hero-panel weather-${weather}`}>
      <WeatherBackdrop imageUrl={weatherImages[weather]} />
      {weather === "rainy" && <span className="weather-rain-animation" aria-hidden="true" />}
      <span className="weather-readability-layer" aria-hidden="true" />
      <span className="weather-glass-layer" aria-hidden="true" />
      <div className="weather-copy">
        <span className="hero-label"><span className="live-dot" /> {dashboardData.civicArea}</span>
        <span className="weather-date">{currentMockWeather.dateTime}</span>
        <h2>{currentMockWeather.condition}</h2>
        <strong className="weather-temperature">{currentMockWeather.temperature}</strong>
        <p>{dashboardData.civicAreaDescription}</p>
        <button className="button button-light" onClick={onReport}><Icon name="plus" size={17} /> Report a problem</button>
      </div>
    </section>
    <div className="stats-grid"><StatCard icon="map" value={String(dashboardData.nearbyReportCount)} label="Nearby reports" detail="in your area" color="orange" /><StatCard icon="check" value={String(dashboardData.resolvedReportCount)} label="Resolved reports" detail="this month" color="green" /></div>
    <section className="content-section"><div className="section-heading"><div><span className="section-kicker">Around you</span><h2>Nearby civic issues</h2></div><button className="text-button" onClick={() => onNavigate("reports")}>View all <Icon name="arrow" size={16} /></button></div><div className="dashboard-columns"><div className="map-preview"><MapCanvas compact /><button className="map-overlay-button" onClick={() => onNavigate("map")}>Explore live map <Icon name="arrow" size={15} /></button></div><div className="report-list">{reports.slice(0, 2).map(report => <ReportCard key={report.id} report={report} onSelect={() => onSelect(report)} />)}</div></div></section>
  </div>;
}

function StatCard({ icon, value, label, detail, color }: { icon: "map" | "check" | "thumb"; value: string; label: string; detail: string; color: string }) { return <div className="stat-card"><div className={`stat-icon stat-${color}`}><Icon name={icon} size={18} /></div><strong>{value}</strong><span>{label}</span><small>{detail}</small></div>; }

function MapScreen({ onReport }: { onReport: () => void }) { return <div className="map-page"><div className="map-screen"><MapCanvas /><div className="map-location-badge"><span className="live-dot" /><div><small>Current municipality</small><strong>Accra Metropolitan</strong></div></div><button className="map-report-button button button-primary" onClick={onReport}><Icon name="plus" size={17} /> Report here</button></div></div>; }

function MyReports({ reports: reportItems, onSelect, onReport }: { reports: Report[]; onSelect: (report: Report) => void; onReport: () => void }) {
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "resolved">("all");
  const activeReports = reportItems.filter(report => !["Resolved", "Rejected", "Duplicate"].includes(report.status));
  const resolvedReports = reportItems.filter(report => report.status === "Resolved");
  const filteredReports = statusFilter === "active" ? activeReports : statusFilter === "resolved" ? resolvedReports : reportItems;

  return <div className="page-wrap">
    <PageHeader eyebrow="Your activity" title="My reports" action={<button type="button" className="button button-primary" onClick={onReport}><Icon name="plus" size={17} /> New report</button>} />
    <div className="tabs" aria-label="Filter my reports">
      <button type="button" className={statusFilter === "all" ? "tab-active" : ""} aria-pressed={statusFilter === "all"} onClick={() => setStatusFilter("all")}>All reports <span>{reportItems.length}</span></button>
      <button type="button" className={statusFilter === "active" ? "tab-active" : ""} aria-pressed={statusFilter === "active"} onClick={() => setStatusFilter("active")}>Active <span>{activeReports.length}</span></button>
      <button type="button" className={statusFilter === "resolved" ? "tab-active" : ""} aria-pressed={statusFilter === "resolved"} onClick={() => setStatusFilter("resolved")}>Resolved <span>{resolvedReports.length}</span></button>
    </div>
    {filteredReports.length > 0
      ? <div className="report-list wide-list">{filteredReports.map(report => <ReportCard key={report.id} report={report} onSelect={() => onSelect(report)} />)}</div>
      : <div className="reports-empty"><Icon name="info" size={20} /><strong>No {statusFilter} reports</strong><p>Reports matching this status will appear here.</p></div>}
  </div>;
}

function ReportsHub({ reports: reportItems, onSelect, onReport }: { reports: Report[]; onSelect: (report: Report) => void; onReport: () => void }) { const [tab, setTab] = useState("mine"); return <div className="reports-hub"><div className="reports-tabs"><button className={tab === "mine" ? "active" : ""} onClick={() => setTab("mine")}>My Reports</button><button className={tab === "nearby" ? "active" : ""} onClick={() => setTab("nearby")}>Nearby</button><button className={tab === "insights" ? "active" : ""} onClick={() => setTab("insights")}>Insights</button></div>{tab === "mine" && <MyReports reports={reportItems} onSelect={onSelect} onReport={onReport} />}{tab === "nearby" && <NearbyReports onSelect={onSelect} />}{tab === "insights" && <InsightsPanel />}</div>; }

function NearbyReports({ onSelect }: { onSelect: (report: Report) => void }) { const [confirmed, setConfirmed] = useState<string[]>([]); const { reports } = useReportStore(); return <div className="page-wrap"><PageHeader eyebrow="Your community" title="Nearby reports" action={<div className="area-selector"><Icon name="pin" size={16} /> 2 km radius <Icon name="chevron" size={14} /></div>} /><div className="privacy-note"><Icon name="info" size={18} /><p><strong>Privacy first.</strong> Reporter identities are hidden and locations are rounded to protect everyone.</p></div><div className="nearby-grid">{reports.map(report => <div className="nearby-card" key={report.id}><ReportCard report={report} nearby onSelect={() => onSelect(report)} /><button className={`confirm-button ${confirmed.includes(report.id) ? "confirmed" : ""}`} onClick={() => setConfirmed(current => current.includes(report.id) ? current.filter(id => id !== report.id) : [...current, report.id])}><Icon name={confirmed.includes(report.id) ? "check" : "thumb"} size={16} /> {confirmed.includes(report.id) ? "Confirmed" : "I can confirm this issue"}</button></div>)}</div></div>; }

function Profile() { return <div className="page-wrap"><PageHeader eyebrow="Account" title="Your profile" /><div className="profile-card"><div className="profile-avatar">AK</div><div><h2>Akosua Kwarteng</h2><p>Accra Metropolitan · Member since 2026</p></div><button className="button button-outline">Edit profile</button></div><div className="settings-list"><div><Icon name="pin" size={19} /><span><strong>Default civic area</strong><small>Accra Metropolitan</small></span><Icon name="chevron" size={16} /></div><div><Icon name="bell" size={19} /><span><strong>Notifications</strong><small>Updates on your reports and nearby issues</small></span><Icon name="chevron" size={16} /></div><div><Icon name="info" size={19} /><span><strong>About CivicReporter</strong><small>Version 2.0 · Ghana</small></span><Icon name="chevron" size={16} /></div></div></div>; }
function Notifications() { return <div className="page-wrap"><PageHeader eyebrow="Stay informed" title="Notifications" /><div className="empty-state"><div className="empty-icon"><Icon name="bell" size={25} /></div><h2>You&apos;re all caught up</h2><p>New updates about your reports and civic area will appear here.</p></div></div>; }

function ReportDetails({ report, onClose }: { report: Report; onClose: () => void }) { return <div className="modal-backdrop"><div className="report-modal detail-modal"><header><div><span className="section-kicker">Report {report.id}</span><h2>{report.title}</h2></div><button className="icon-button" onClick={onClose} aria-label="Close report details"><Icon name="close" size={20} /></button></header><StatusTimeline status={report.status} /><div className="detail-body"><p>{report.description}</p><div className="report-meta"><span><Icon name="pin" size={14} /> {report.area}</span><span><Icon name="clock" size={14} /> Reported {report.time}</span></div></div><div className="detail-note"><Icon name="info" size={18} /><span>Updates are shared as the responsible assembly reviews and acts on this issue.</span></div></div></div>; }
function StatusTimeline({ status }: { status: Report["status"] }) { const statuses = ["Submitted", "Under Review", "Assigned", "In Progress", "Resolved"]; const activeIndex = statuses.indexOf(status); return <div className="timeline">{statuses.map((item, index) => <div className={index <= activeIndex ? "timeline-active" : ""} key={item}><span>{index < activeIndex ? <Icon name="check" size={13} /> : index + 1}</span><small>{item}</small>{index < statuses.length - 1 && <i />}</div>)}</div>; }
