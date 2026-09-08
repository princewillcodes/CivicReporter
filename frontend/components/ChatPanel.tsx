"use client";
import { FormEvent, useEffect, useRef, useState } from "react";
import { chatMessages, ChatMessage, currentChatUser } from "../data/chatData";
import { useReportStore } from "./ReportStore";
import { Icon } from "./Icon";

export function ChatPanel() {
  const [signedIn, setSignedIn] = useState(false); const [messages, setMessages] = useState<ChatMessage[]>(chatMessages); const [draft, setDraft] = useState(""); const [attachedReportId, setAttachedReportId] = useState<string | null>(null); const [pickerOpen, setPickerOpen] = useState(false); const [hidden, setHidden] = useState<string[]>([]); const [openMenu, setOpenMenu] = useState<string | null>(null); const [moderationNotice, setModerationNotice] = useState("");
  const attachPickerRef = useRef<HTMLDivElement>(null);
  const { reports } = useReportStore();
  useEffect(() => {
    if (!pickerOpen) return;

    const closeOnOutsideClick = (event: PointerEvent) => {
      if (!attachPickerRef.current?.contains(event.target as Node)) setPickerOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setPickerOpen(false);
    };

    document.addEventListener("pointerdown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [pickerOpen]);
  const send = (event: FormEvent) => { event.preventDefault(); const body = draft.trim(); const blocked = ["kill yourself", "dox", "bomb threat"]; if (!body) return; if (blocked.some(term => body.toLowerCase().includes(term))) { setModerationNotice("This message was blocked. Please keep the conversation respectful and focused on local issues."); return; } setMessages(current => [...current, { id: `m-${Date.now()}`, author: currentChatUser.displayName, area: currentChatUser.municipality, body, time: "Just now", mine: true, reportId: attachedReportId || undefined }]); setDraft(""); setAttachedReportId(null); setModerationNotice(""); };
  const attachedReport = reports.find(report => report.id === attachedReportId);
  const visible = messages.filter(message => !hidden.includes(message.id));
  if (!signedIn) return <div className="chat-page"><div className="chat-auth-card"><div className="chat-auth-icon"><Icon name="user" size={25} /></div><span className="section-kicker">Accra Metropolitan</span><h1>Join the community chat</h1><p>Community conversations are available to CivicReporter account holders. Accounts help keep discussions accountable and protect the wider community.</p><button className="button button-primary" onClick={() => setSignedIn(true)}>Sign in to continue</button><small>Your profile name is shown. Contact details and exact location stay private.</small></div></div>;
  return <div className="chat-page"><header className="chat-page-header"><div><span className="section-kicker">Your civic area</span><h1>Community Chat</h1></div><div className="chat-area-badge"><Icon name="pin" size={15} /> Accra Metropolitan</div></header><div className="chat-guidelines"><Icon name="info" size={16} /><span>Messages use account profile names and are moderated. Keep conversations respectful and focused on local civic issues.</span></div><div className="chat-window">{visible.length === 0 ? <div className="chat-empty"><div className="empty-icon"><Icon name="chat" size={22} /></div><strong>No messages yet</strong><p>Start a useful conversation in your civic area.</p></div> : <div className="chat-message-list">{visible.map(message => <article className={`community-message ${message.mine ? "message-mine" : ""}`} key={message.id}><div className="message-top"><strong>{message.mine ? "You" : message.author}</strong><span>{message.time}</span><button type="button" onClick={() => setOpenMenu(current => current === message.id ? null : message.id)} aria-label={`Open actions for ${message.author}`}><Icon name="more" size={15} /></button>{openMenu === message.id && <div className="message-actions"><button type="button" onClick={() => setOpenMenu(null)}>Report message</button><button type="button" onClick={() => { setHidden(current => [...current, message.id]); setOpenMenu(null); }}>Hide message</button></div>}</div><small>{message.area}</small><p>{message.body}</p>{message.reportId && <span className="attached-report"><Icon name="file" size={13} /> Report {message.reportId}</span>}</article>)}</div>}</div><form className="community-composer" onSubmit={send}><div className="composer-identity"><span><Icon name="user" size={14} /></span><div><small>Sending as</small><strong>{currentChatUser.displayName}</strong></div><em>Profile name</em></div><div className="composer-row"><div className="attach-wrap" ref={attachPickerRef}><button type="button" className={`attach-report ${attachedReport ? "attached" : ""}`} onClick={() => setPickerOpen(value => !value)} aria-expanded={pickerOpen} aria-haspopup="listbox"><Icon name="file" size={15} /> {attachedReport ? attachedReport.id : "Attach report"}</button>{pickerOpen && <div className="report-picker" role="listbox" aria-label="Select a report"><strong>Select a report</strong>{reports.map(report => <button type="button" role="option" aria-selected={attachedReportId === report.id} key={report.id} onClick={() => { setAttachedReportId(report.id); setPickerOpen(false); }}>{report.id} · {report.title}</button>)}</div>}</div><input value={draft} onChange={event => setDraft(event.target.value)} aria-label="Message" placeholder="Write to your community…" /><button className="send-message" type="submit" aria-label="Send message"><Icon name="arrow" size={17} /></button></div>{moderationNotice && <p className="moderation-notice">{moderationNotice}</p>}</form></div>;
}
