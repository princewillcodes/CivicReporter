import { Report } from "../data/mockData";
import { Icon } from "./Icon";

export function ReportCard({ report, onSelect, nearby = false }: { report: Report; onSelect?: () => void; nearby?: boolean }) {
  return <article className="report-card" onClick={onSelect} role={onSelect ? "button" : undefined} tabIndex={onSelect ? 0 : undefined}>
    <div className={`report-icon icon-${report.accent}`}><Icon name={report.category.includes("Waste") ? "bin" : report.category.includes("Street") ? "light" : report.category.includes("Flood") ? "water" : "road"} size={19} /></div>
    <div className="report-card-content"><div className="report-card-top"><span className="eyebrow">{report.category}</span><StatusPill status={report.status} /></div>
      <h3>{report.title}</h3><p>{report.description}</p>
      <div className="report-meta"><span><Icon name="pin" size={14} /> {report.area}</span><span><Icon name="clock" size={14} /> {report.time}</span>{nearby && <span className="confirm-count"><Icon name="thumb" size={14} /> {report.confirmations} confirmations</span>}</div>
    </div><Icon name="chevron" size={16} />
  </article>;
}

export function StatusPill({ status }: { status: Report["status"] }) { return <span className={`status-pill status-${status.toLowerCase().replaceAll(" ", "-")}`}><i />{status}</span>; }
