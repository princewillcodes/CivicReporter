"use client";

import { useState } from "react";
import type { FormEvent } from "react";

type Section = "overview" | "map" | "reports" | "insights";

const reports = [
  { icon: "⌁", type: "Clogged drain", place: "Adabraka, Accra", time: "15 min ago", status: "In progress", tone: "amber", id: "GH-0241" },
  { icon: "◉", type: "Pothole", place: "Labone, Accra", time: "1 hr ago", status: "Under review", tone: "blue", id: "GH-0238" },
  { icon: "☼", type: "Streetlight out", place: "Osu, Accra", time: "Yesterday", status: "Resolved", tone: "green", id: "GH-0229" },
];

const navItems: { id: Section; label: string; icon: string }[] = [
  { id: "overview", label: "Home", icon: "⌂" },
  { id: "map", label: "Live Map", icon: "⌖" },
  { id: "insights", label: "Insights", icon: "▥" },
  { id: "reports", label: "Community", icon: "◌" },
];

const communityLocations = ["Accra Metropolitan", "La Dade-Kotopon", "Ayawaso West", "Madina / La Nkwantanang", "Koforidua"];

const assemblyUpdates = [
  { id: "assembly-1", author: "Accra Metropolitan Assembly", initials: "AMA", tone: "green", role: "Official sample update", time: "Today · Example", title: "Drain clearing schedule: Adabraka", body: "A sample notice for residents: drain clearing is planned along the Adabraka market area this week. Please keep access paths clear while work is underway.", replies: ["Sample reply · Thank you for sharing the schedule."] },
  { id: "assembly-2", author: "La Dade-Kotopon Municipal Assembly", initials: "L", tone: "gold", role: "Official sample update", time: "Yesterday · Example", title: "Streetlight maintenance in Osu", body: "Illustrative assembly update: a maintenance team is expected to inspect reported streetlights near Oxford Street. This is sample content and does not represent a live service notice.", replies: ["Sample reply · Is there a nearby landmark residents can use?"] },
];

const residentDiscussions = [
  { id: "resident-1", author: "Ama K.", initials: "AK", tone: "rose", role: "Resident · Sample profile", time: "25 min ago · Example", title: "Water collects near the market after rain", body: "Has anyone else noticed the drain overflowing by the Adabraka market entrance? Sharing this as a sample discussion to show how neighbours might compare observations.", replies: ["Kojo M. · Sample reply: I have seen it near the taxi rank too.", "Efua A. · Sample reply: A landmark could help the assembly identify the spot."] },
  { id: "resident-2", author: "Kojo M.", initials: "KM", tone: "blue", role: "Resident · Sample profile", time: "2 hr ago · Example", title: "Safer walk to the bus stop", body: "The footpath near the junction gets dark in the evening. Where are the best landmarks to describe this location?", replies: ["Abena T. · Sample reply: Mention the clinic on the corner."] },
];

function Brand() {
  return <a className="brand" href="#home" aria-label="CivicReporter Ghana home"><span>CivicReporter<span className="brand-suffix">.gh</span></span></a>;
}

function SampleMap() {
  return (
    <div className="map-art" role="img" aria-label="Illustrative map of Accra with sample community report markers">
      <svg className="map-lines" viewBox="0 0 700 360" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <path className="water" d="M-20 310 C95 255 126 320 240 278 S390 276 476 224 605 196 730 235 L730 390 -20 390Z" />
        <path className="road major" d="M-20 252 C95 207 165 214 255 170 S405 121 515 136 630 92 730 58" />
        <path className="road major" d="M65 -20 C100 69 163 104 196 177 S224 270 302 388" />
        <path className="road major" d="M412 -20 C395 64 431 106 465 167 S502 256 555 385" />
        <path className="road" d="M-10 126 C100 154 180 136 266 105 S440 65 718 100" />
        <path className="road" d="M-10 186 C103 161 155 198 246 215 S414 202 516 174 637 168 720 188" />
        <path className="road" d="M117 -20 C169 42 223 48 291 78 S393 93 464 48 593 17 710 36" />
        <path className="road" d="M279 -20 C263 60 306 99 327 147 S352 254 392 380" />
        <path className="road" d="M555 -10 C532 54 558 113 594 144 S641 228 692 275" />
        <path className="road" d="M-10 82 C52 105 105 103 157 89 S241 49 309 42" />
        <path className="road" d="M24 350 C90 290 136 276 188 250 S286 224 346 232" />
        <path className="road" d="M365 344 C411 292 443 283 484 263 S577 238 710 255" />
        <path className="road minor" d="M26 30 90 120 143 146 172 202 244 246" />
        <path className="road minor" d="M340 20 372 77 352 118 387 165 369 220 426 286" />
        <path className="road minor" d="M624 20 581 72 624 112 600 159 660 211 635 298" />
      </svg>
      <span className="map-label label-madina">MADINA</span>
      <span className="map-label label-adenta">ADENTA</span>
      <span className="map-label label-accra">ACCRA CENTRAL</span>
      <span className="map-label label-osu">OSU</span>
      <span className="map-label label-labone">LABONE</span>
      <span className="map-label label-gulf">GULF OF GUINEA</span>
      <span className="map-pin pin-one"><i>⌁</i></span>
      <span className="map-pin pin-two"><i>◉</i></span>
      <span className="map-pin pin-three"><i>☼</i></span>
      <span className="map-caption"><span className="caption-dot" /> Illustrative map · sample reports</span>
      <span className="map-zoom" aria-hidden="true"><span>+</span><span>−</span></span>
    </div>
  );
}

function ReportRow({ report }: { report: (typeof reports)[number] }) {
  return (
    <article className="report-row">
      <span className={`report-icon ${report.tone}`}>{report.icon}</span>
      <div className="report-main"><div className="report-title-line"><h3>{report.type}</h3><span className={`status ${report.tone}`}>{report.status}</span></div><p><span className="tiny-pin">⌖</span>{report.place}<span className="report-dot">·</span>{report.time}</p></div>
      <span className="report-id">{report.id}</span>
      <span className="row-chevron">›</span>
    </article>
  );
}

export default function Home() {
  const [section, setSection] = useState<Section>("overview");
  const [reportOpen, setReportOpen] = useState(false);
  const [communityLocation, setCommunityLocation] = useState(communityLocations[0]);
  const [communityTab, setCommunityTab] = useState<"assembly" | "residents">("assembly");
  const [draft, setDraft] = useState("");
  const [previewMessage, setPreviewMessage] = useState("");

  const title = section === "overview" ? "Your community, at a glance" : navItems.find((item) => item.id === section)?.label;

  function previewCommunityMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const message = draft.trim();
    if (!message) return;
    setPreviewMessage(message);
    setDraft("");
  }

  return (
    <main className="app-shell" id="home">
      <header className="topbar">
        <Brand />
        <div className="topbar-right">
          <span className="sample-badge"><span className="sample-dot" /> Sample view</span>
          <span className="ghana-badge"><span className="ghana-flag" /> Ghana</span>
          <button className="profile-button" aria-label="Citizen profile">C</button>
        </div>
      </header>

      <div className="layout">
        <section className="main-content">
          <div className={`page-heading ${section === "overview" ? "overview-heading" : ""}`}>
            <div><div className="crumb">CIVICREPORTER <span>/</span> CITIZEN</div><h1>{title}</h1><p>See what neighbours are reporting across your community.</p></div>
            <button className="primary-button heading-action" onClick={() => setReportOpen(true)}><span>＋</span> Report a hazard</button>
          </div>

          <div className="prototype-notice"><span className="notice-icon">i</span><span><strong>Prototype with sample content.</strong> Reports shown here are examples; nothing is submitted or saved.</span></div>

          {section === "overview" && <>
            <section className="welcome-banner">
              <div className="welcome-copy"><span className="welcome-eyebrow"><span className="welcome-spark">✳</span> SAMPLE VIEW · GHANA</span><h2>Welcome Back, Citizen</h2><p>Report structural hazards and follow community updates across your municipal assembly.</p><button className="light-button" onClick={() => setReportOpen(true)}><span className="button-alert">🚨</span> File New Community Report</button></div>
            </section>

            <section className="stats-grid" aria-label="Sample community report summary"><div className="stat-card"><strong>23</strong><span className="stat-label">Total Reports Logged <small>SAMPLE</small></span></div><div className="stat-card"><strong>8</strong><span className="stat-label">Districts Under Watch <small>SAMPLE</small></span></div></section>

            <section className="hotspot-section"><div className="hotspot-section-heading"><h2>Active Municipal Hotspots</h2><span>Sample content</span></div><div className="home-hotspot-list"><article className="home-hotspot"><div><h3>Shai Osudoku Assembly (Greater Accra)</h3><p>7 unresolved civic flags <span>· Sample</span></p></div><span className="risk-tag high">High Risk Zone</span></article><article className="home-hotspot"><div><h3>Ayawaso West Assembly (Greater Accra)</h3><p>5 unresolved civic flags <span>· Sample</span></p></div><span className="risk-tag high">High Risk Zone</span></article><article className="home-hotspot"><div><h3>La Dade-Kotopon Assembly (Greater Accra)</h3><p>4 unresolved civic flags <span>· Sample</span></p></div><span className="risk-tag medium">Active Node</span></article></div></section>

            <section className="panel recent-panel"><div className="panel-header"><div><div className="panel-overline">FROM AROUND YOU · SAMPLE</div><h2>Community reports</h2></div><button className="text-button" onClick={() => setSection("reports")}>See all <span>↗</span></button></div><div className="report-list">{reports.map((report) => <ReportRow key={report.id} report={report} />)}</div></section>
          </>}

          {section === "map" && <section className="panel full-map-panel"><div className="panel-header"><div><div className="panel-overline">GREATER ACCRA · ILLUSTRATIVE</div><h2>Community map</h2></div><span className="map-legend"><i className="legend-urgent" /> Priority <i className="legend-routine" /> Routine</span></div><SampleMap /><div className="map-report-strip">{reports.map((report) => <div className="map-report-chip" key={report.id}><span className={`legend-dot ${report.tone}`} />{report.type}<small>{report.place}</small></div>)}</div></section>}

          {section === "reports" && <section className="community-page" aria-labelledby="community-title">
            <div className="community-intro"><div><div className="panel-overline">COMMUNITY SPACE · SAMPLE CONTENT</div><h2 id="community-title">A place for local updates</h2><p>Read example notices and neighbour discussions from around Ghana.</p></div><label className="community-location">District or community<select value={communityLocation} onChange={(event) => setCommunityLocation(event.target.value)}><option value="Accra Metropolitan">Accra Metropolitan</option><option value="La Dade-Kotopon">La Dade-Kotopon</option><option value="Ayawaso West">Ayawaso West</option><option value="Madina / La Nkwantanang">Madina / La Nkwantanang</option><option value="Koforidua">Koforidua</option></select></label></div>
            <div className="community-sample-notice" role="note"><span aria-hidden="true">i</span><p><strong>Preview only.</strong> All posts and replies are examples. Draft messages stay in this browser view and are not saved or shared with other people.</p></div>
            <div className="community-switch" role="tablist" aria-label="Community feed type"><button id="assembly-tab" type="button" role="tab" aria-selected={communityTab === "assembly"} aria-controls="community-feed" className={communityTab === "assembly" ? "selected" : ""} onClick={() => setCommunityTab("assembly")}>Assembly updates <span>2 examples</span></button><button id="resident-tab" type="button" role="tab" aria-selected={communityTab === "residents"} aria-controls="community-feed" className={communityTab === "residents" ? "selected" : ""} onClick={() => setCommunityTab("residents")}>Resident discussions <span>2 examples</span></button></div>
            <div id="community-feed" role="tabpanel" aria-labelledby={communityTab === "assembly" ? "assembly-tab" : "resident-tab"} className="community-feed">
              <div className="community-feed-heading"><div><h3>{communityTab === "assembly" ? "Official assembly updates" : "Neighbour conversations"}</h3><p>Selected area: <strong>{communityLocation}</strong> · posts below are illustrative examples</p></div><span className="feed-count">Sample feed</span></div>
              {(communityTab === "assembly" ? assemblyUpdates : residentDiscussions).map((post) => <article className="community-post" key={post.id}><header className="post-author"><span className={`post-avatar ${post.tone}`} aria-hidden="true">{post.initials}</span><div><strong>{post.author}</strong><span>{post.role} · {post.time}</span></div>{communityTab === "assembly" && <span className="official-mark">Official · Sample</span>}</header><h4>{post.title}</h4><p className="post-body">{post.body}</p><div className="post-replies"><strong>{post.replies.length} sample {post.replies.length === 1 ? "reply" : "replies"}</strong>{post.replies.map((reply) => <p key={reply}>{reply}</p>)}</div><button className="reply-preview-button" type="button" onClick={() => document.getElementById("community-composer")?.focus()}>Reply in local preview</button></article>)}
              {previewMessage && <article className="community-post local-preview-post" aria-live="polite"><span className="local-only-label">Your local draft preview · only visible here</span><p className="post-body">{previewMessage}</p></article>}
            </div>
            <form className="community-composer" onSubmit={previewCommunityMessage}><label htmlFor="community-composer">Write a local preview message</label><p>Nothing will be sent or saved. Your text appears only in this page preview.</p><textarea id="community-composer" value={draft} onChange={(event) => setDraft(event.target.value)} rows={3} maxLength={500} placeholder="Share a thought about your community…" /><div className="composer-actions"><span>{draft.length}/500 characters</span><button type="submit" disabled={!draft.trim()}>Preview message</button></div></form>
            <div className="community-unavailable"><span aria-hidden="true">◷</span><div><strong>Live community features aren’t available yet</strong><p>Sign-in, shared conversations, and saved messages will need a connected service in a future phase.</p></div></div>
          </section>}

          {section === "insights" && <section className="panel insights-page"><div className="panel-header"><div><div className="panel-overline">EXAMPLE METRICS · NOT LIVE</div><h2>District insights</h2></div><span className="feed-count">Sample dataset</span></div><div className="insight-cards"><div><span>TOP SAMPLE HAZARD</span><strong>Clogged drains</strong><small>31 example reports</small></div><div><span>AREA WITH MOST EXAMPLES</span><strong>Madina</strong><small>5 example reports</small></div><div><span>EXAMPLE RESOLUTION RATE</span><strong>68%</strong><small>Illustrative metric only</small></div></div><div className="insight-bar-title"><span>Sample reports by area</span><small>Example data</small></div><div className="district-bars"><div><span>Madina</span><i><b style={{ width: "86%" }} /></i><small>5</small></div><div><span>Accra Central</span><i><b style={{ width: "68%" }} /></i><small>4</small></div><div><span>Adenta</span><i><b style={{ width: "49%" }} /></i><small>3</small></div><div><span>Osu</span><i><b style={{ width: "32%" }} /></i><small>2</small></div></div></section>}

          <footer className="content-footer"><span>Made for Ghanaian communities <span className="footer-star">✳</span></span><span>Prototype · sample data only</span></footer>
        </section>
      </div>

      <nav className="mobile-nav" aria-label="Main navigation">{navItems.map((item) => <button key={item.id} className={section === item.id ? "active" : ""} onClick={() => setSection(item.id)}><span>{item.icon}</span><small>{item.id === "reports" ? "Chat" : item.label}</small></button>)}</nav>

      {reportOpen && <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setReportOpen(false); }}><section className="report-modal" role="dialog" aria-modal="true" aria-labelledby="modal-title"><div className="modal-heading"><div><div className="panel-overline">REPORT PREVIEW</div><h2 id="modal-title">Tell us what needs attention</h2></div><button className="modal-close" onClick={() => setReportOpen(false)} aria-label="Close report preview">×</button></div><p className="modal-intro">This is a form preview. It will not send or save your information.</p><label>Hazard type<select defaultValue=""><option value="" disabled>Choose a community issue</option><option>Pothole</option><option>Clogged drain</option><option>Flooding</option><option>Broken streetlight</option><option>Burst pipe</option><option>Sanitation concern</option></select></label><label>Urgency<select defaultValue="medium"><option value="low">Routine</option><option value="medium">Needs attention</option><option value="high">Urgent safety concern</option></select></label><label>What is happening?<textarea rows={3} placeholder="Add a short description or nearby landmark" /></label><div className="sample-location"><span className="tiny-pin">⌖</span><div><small>LOCATION PREVIEW</small><strong>Accra, Ghana · sample location</strong></div><span className="location-edit">Not connected</span></div><button className="submit-disabled" disabled>Submissions aren’t connected yet</button><button className="modal-cancel" onClick={() => setReportOpen(false)}>Close preview</button></section></div>}
    </main>
  );
}
