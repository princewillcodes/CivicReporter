"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { mapReports, MapReport } from "../data/mapData";
import { Icon } from "./Icon";
import { useReportStore } from "./ReportStore";
import districtData from "../data/accra_districts.json";

export function MapCanvas({ compact = false }: { compact?: boolean }) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [selected, setSelected] = useState<MapReport | null>(null);
  const [category, setCategory] = useState("All");
  const { reports } = useReportStore();
  const visibleReports = useMemo(() => reports.map((report, index) => { const base = mapReports.find(item => item.id === report.id) ?? mapReports[index % mapReports.length]; return { ...report, latitude: base.latitude + (index > 3 ? (index % 3) - 1 : 0), longitude: base.longitude + (index > 3 ? (index % 2) - .5 : 0), urgency: base.urgency } as MapReport; }), [reports]);
  useEffect(() => {
    const mapContainer = mapRef.current;
    if (compact || !mapContainer) return;
    let map: import("leaflet").Map | undefined;
    let cancelled = false;
    let zoomTimer: number | undefined;
    import("leaflet").then(leafletModule => {
      const L = leafletModule.default ?? leafletModule;
      if (cancelled) return;
      if ((mapContainer as HTMLDivElement & { _leaflet_id?: number })._leaflet_id) return;
      map = L.map(mapContainer, { zoomControl: false, attributionControl: true }).setView([7.9, -1.2], 6);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { attribution: "© OpenStreetMap contributors" }).addTo(map);
      L.control.zoom({ position: "topright" }).addTo(map);
      const districts = L.geoJSON(districtData as import("geojson").GeoJsonObject, { style: { color: "#9fbea8", weight: 1, fillColor: "#dcecdf", fillOpacity: .22 } }).addTo(map);
      map.fitBounds(districts.getBounds(), { padding: [18, 18] });
      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      zoomTimer = window.setTimeout(() => { if (map) map.flyTo([5.56, -0.19], 12, { duration: reduceMotion ? 0 : 1.4 }); }, reduceMotion ? 0 : 350);
      L.marker([5.56, -0.19], { icon: L.divIcon({ className: "user-map-pin", html: "<span></span>", iconSize: [30, 38], iconAnchor: [15, 38] }) }).bindTooltip("You're here", { direction: "top", offset: [0, -30] }).addTo(map);
      visibleReports.filter(report => category === "All" || report.category === category).forEach(report => { const markerColor = report.accent === "red" ? "red" : report.accent === "amber" ? "amber" : report.accent === "blue" ? "blue" : "green"; L.marker([5.56 + (report.latitude - 50) / 250, -0.19 + (report.longitude - 50) / 250], { icon: L.divIcon({ className: `report-map-pin report-pin-${markerColor}`, html: "<span></span>", iconSize: [24, 31], iconAnchor: [12, 31] }) }).on("click", () => setSelected(report)).addTo(map!).bindTooltip(report.category); });
    });
    return () => {
      cancelled = true;
      if (zoomTimer) window.clearTimeout(zoomTimer);
      map?.remove();
      mapContainer.innerHTML = "";
    };
  }, [compact, category, visibleReports]);
  if (!compact) return <div className="map-canvas leaflet-map-wrap"><div ref={mapRef} className="leaflet-map" /><div className="map-filter-bar"><select value={category} onChange={event => setCategory(event.target.value)} aria-label="Filter by category"><option>All</option><option>Flooding & drainage</option><option>Street lighting</option><option>Waste & sanitation</option><option>Roads & transport</option></select><select aria-label="Filter by urgency"><option>Urgency</option><option>High</option><option>Medium</option><option>Low</option></select><select aria-label="Filter by status"><option>Status</option><option>Open</option><option>Resolved</option></select></div>{selected && <div className="map-preview-sheet"><button className="sheet-close" onClick={() => setSelected(null)} aria-label="Close report preview"><Icon name="close" size={16} /></button><span className="eyebrow">{selected.category}</span><h3>{selected.title}</h3><p>{selected.description}</p><div className="map-sheet-meta"><span><Icon name="pin" size={13} /> Approx. {selected.area}</span><span><Icon name="clock" size={13} /> {selected.time}</span><span><Icon name="thumb" size={13} /> {selected.confirmations} confirmations</span></div><span className={`status-pill status-${selected.status.toLowerCase().replaceAll(" ", "-")}`}><i />{selected.status}</span></div>}</div>;
  return <div className="map-canvas map-canvas-compact"><div className="map-grid" /><div className="map-road road-one" /><div className="map-road road-two" /><span className="map-label label-one">Osu</span><span className="map-label label-two">Labone</span>{visibleReports.map(report => <span key={report.id} className={`map-marker marker-${report.accent}`} style={{ left: `${report.longitude}%`, top: `${report.latitude}%` }}><Icon name="pin" size={14} /></span>)}<span className="user-location" style={{ left: "51%", top: "49%" }}><span /></span></div>;
}
