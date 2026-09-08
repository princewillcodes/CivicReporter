"use client";

import { FormEvent, useState } from "react";
import { categories, Report } from "../data/mockData";
import { Icon } from "./Icon";
import { MapCanvas } from "./MapCanvas";

type ReportFlowProps = {
  onClose: () => void;
  onSubmitted: (report: Report) => void;
};

export function ReportFlow({ onClose, onSubmitted }: ReportFlowProps) {
  const [step, setStep] = useState<"details" | "review">("details");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [urgency, setUrgency] = useState("Medium");
  const [contact, setContact] = useState("");
  const [photo, setPhoto] = useState("");
  const [location, setLocation] = useState("Accra Metropolitan");
  const [pickerOpen, setPickerOpen] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [submitted, setSubmitted] = useState<Report | null>(null);

  const review = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!category) {
      setError("Choose a hazard type before continuing.");
      return;
    }
    if (description.trim().length < 10) {
      setError("Add at least 10 characters describing the issue or a nearby landmark.");
      return;
    }
    setError("");
    setStep("review");
  };

  const submit = () => {
    if (saving) return;
    setError("");
    setSaving(true);

    window.setTimeout(() => {
      try {
        const report: Report = {
          id: `CR-${Math.floor(2000 + Math.random() * 8000)}`,
          title: description.trim().slice(0, 64),
          category,
          description: description.trim(),
          status: "Submitted",
          area: "Accra, Ghana",
          municipality: location,
          time: "Just now",
          distance: "0.0 km",
          confirmations: 0,
          accent: urgency === "High" ? "red" : urgency === "Low" ? "green" : "amber",
        };
        onSubmitted(report);
        setSubmitted(report);
      } catch {
        setError("The report could not be submitted. Please try again.");
      } finally {
        setSaving(false);
      }
    }, 550);
  };

  return <div className="modal-backdrop" role="presentation">
    <section className="report-modal report-flow-modal" role="dialog" aria-modal="true" aria-labelledby="report-flow-title">
      <header className="report-flow-header">
        <div>
          <span className="section-kicker">New civic report</span>
          <h2 id="report-flow-title">{submitted ? "Report submitted" : step === "review" ? "Review your report" : "Report infrastructure hazard"}</h2>
          {!submitted && <p>{step === "details" ? "Tell the assembly what needs attention." : "Confirm the details before publishing."}</p>}
        </div>
        <button type="button" className="icon-button" onClick={onClose} aria-label="Close report form"><Icon name="close" size={20} /></button>
      </header>

      {!submitted && <div className="report-progress" aria-label="Report progress">
        <span className="current"><b>1</b> Details</span>
        <i />
        <span className={step === "review" ? "current" : ""}><b>2</b> Review</span>
      </div>}

      {submitted
        ? <Success report={submitted} onClose={onClose} />
        : step === "details"
          ? <form className="classic-report-form" onSubmit={review}>
            <label className="report-field" htmlFor="report-hazard">Select hazard type
              <span className="select-wrap"><select id="report-hazard" value={category} onChange={event => setCategory(event.target.value)} required>
                <option value="">Choose an issue...</option>
                {categories.map(item => <option key={item.label} value={item.label}>{item.label}</option>)}
              </select><Icon name="chevron" size={15} /></span>
            </label>

            <label className="report-field" htmlFor="report-urgency">Urgency priority
              <span className="select-wrap"><select id="report-urgency" value={urgency} onChange={event => setUrgency(event.target.value)}>
                <option value="Low">Low · Routine maintenance</option>
                <option value="Medium">Medium · Disrupting movement or access</option>
                <option value="High">High · Immediate risk or hazard</option>
              </select><Icon name="chevron" size={15} /></span>
            </label>

            <div className="report-field">
              <span>Evidence capture <small>Optional</small></span>
              <label className={`evidence-capture ${photo ? "has-photo" : ""}`}>
                <input type="file" accept="image/*" capture="environment" onChange={event => setPhoto(event.target.files?.[0]?.name || "")} />
                <span className="evidence-icon"><Icon name={photo ? "check" : "camera"} size={22} /></span>
                <span><strong>{photo || "Take or upload a photo"}</strong><small>{photo ? "Photo ready to attach" : "Use your camera or photo library"}</small></span>
                <b>{photo ? "Change" : "Add photo"}</b>
              </label>
            </div>

            <label className="report-field" htmlFor="report-description">Additional details and landmarks
              <textarea id="report-description" value={description} onChange={event => setDescription(event.target.value)} placeholder="For example: Right opposite the station container..." rows={4} required />
              <small className="field-help">Avoid names, phone numbers, or exact home addresses.</small>
            </label>

            <div className="gps-status-card">
              <span className="gps-icon"><Icon name="pin" size={20} /></span>
              <div><small>Approximate GPS location ready</small><strong>{location}</strong><span>Your exact position will not appear publicly.</span></div>
              <button type="button" onClick={() => setPickerOpen(value => !value)}>{pickerOpen ? "Close map" : "Adjust"}</button>
            </div>

            {pickerOpen && <div className="location-picker report-location-picker">
              <p>Tap the map to choose an approximate incident location.</p>
              <MapCanvas compact />
              <button type="button" className="button button-primary" onClick={() => { setLocation("Accra Metropolitan"); setPickerOpen(false); }}>Use selected location</button>
            </div>}

            <label className="report-field" htmlFor="report-contact">Updates contact <small>Optional</small>
              <input id="report-contact" value={contact} onChange={event => setContact(event.target.value)} placeholder="Email or phone number" />
              <small className="field-help">This is kept private and never shown on the public map.</small>
            </label>

            {error && <p className="form-error" role="alert">{error}</p>}
            <div className="modal-actions report-primary-action"><button type="submit" className="button button-primary full-button">Review report <Icon name="arrow" size={16} /></button></div>
          </form>
          : <ReviewStep category={category} location={location} description={description} urgency={urgency} contact={contact} photo={photo} onBack={() => setStep("details")} onSubmit={submit} saving={saving} error={error} />}
    </section>
  </div>;
}

function ReviewStep({ category, location, description, urgency, contact, photo, onBack, onSubmit, saving, error }: { category: string; location: string; description: string; urgency: string; contact: string; photo: string; onBack: () => void; onSubmit: () => void; saving: boolean; error: string }) {
  return <form className="report-review" onSubmit={event => { event.preventDefault(); onSubmit(); }}>
    <div className="review-summary">
      <div><span className="section-kicker">Hazard</span><strong>{category}</strong></div>
      <div><span className="section-kicker">Priority</span><strong>{urgency}</strong></div>
      <div><span className="section-kicker">Location</span><strong>{location}</strong><small>Approximate public location</small></div>
      <div><span className="section-kicker">Details</span><strong>{description}</strong><small>{photo ? `Evidence attached · ${photo}` : "No photo attached"}</small></div>
      <div><span className="section-kicker">Private updates</span><strong>{contact || "No contact provided"}</strong></div>
    </div>
    <div className="routing-card"><Icon name="info" size={19} /><div><small>This report will be routed to</small><strong>{location} Assembly</strong></div></div>
    {error && <p className="form-error" role="alert">{error}</p>}
    <div className="modal-actions"><button type="button" className="button button-quiet" onClick={onBack} disabled={saving}>Edit details</button><button type="submit" className="button button-primary" disabled={saving}>{saving ? "Publishing…" : "Publish report"} <Icon name="check" size={16} /></button></div>
  </form>;
}

function Success({ report, onClose }: { report: Report; onClose: () => void }) {
  return <div className="success-state"><div className="success-icon"><Icon name="check" size={29} /></div><h2>Thanks for speaking up.</h2><p>Your report <strong>{report.id}</strong> was sent to {report.municipality}.</p><div className="routing-card"><Icon name="pin" size={19} /><div><small>Submitted {report.time}</small><strong>Status: Submitted</strong></div></div><button type="button" className="button button-primary full-button" onClick={onClose}>Done</button></div>;
}
