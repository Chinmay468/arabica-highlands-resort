"use client";

import { useState, useTransition } from "react";
import {
  rerouteEnquiry,
  updateDraftReply,
  approveAndSendReply,
  submitEnquiry,
} from "@/app/actions/enquiry";
import {
  Inbox,
  AlertTriangle,
  Send,
  CheckCircle,
  MessageSquare,
  Mail,
  Globe,
  User,
  Clock,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  Edit3,
  RefreshCw,
  Search,
  Filter,
  Check,
} from "lucide-react";
import type { SessionUser } from "@/lib/auth";

interface EnquiryItem {
  id: string;
  enquiryNumber: string;
  channel: string;
  senderName: string;
  senderEmail: string | null;
  senderPhone: string | null;
  rawMessage: string;
  category: string;
  confidenceScore: number;
  status: string;
  assignedTo: string;
  extractedDates: string | null;
  extractedPax: number | null;
  extractedBudget: number | null;
  notes: string | null;
  draftReply: string;
  isSent: boolean;
  sentAt: Date | null;
  createdAt: Date;
}

interface InboxClientProps {
  initialEnquiries: any[];
  currentUser: SessionUser;
}

export default function InboxClient({ initialEnquiries, currentUser }: InboxClientProps) {
  const [enquiries, setEnquiries] = useState<EnquiryItem[]>(initialEnquiries);
  const [selectedId, setSelectedId] = useState<string>(initialEnquiries[0]?.id || "");
  const [activeTab, setActiveTab] = useState<"ALL" | "PENDING" | "ESCALATED_GM" | "NEEDS_REVIEW" | "REPLIED">("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [simulatorOpen, setSimulatorOpen] = useState(false);

  // Edit draft state
  const selectedEnquiry = enquiries.find((e) => e.id === selectedId) || enquiries[0];
  const [draftText, setDraftText] = useState(selectedEnquiry?.draftReply || "");
  const [draftSaved, setDraftSaved] = useState(false);

  // Re-route state
  const [rerouteOwner, setRerouteOwner] = useState(selectedEnquiry?.assignedTo || "");

  // Simulator Form State
  const [simChannel, setSimChannel] = useState<"WEB_FORM" | "EMAIL" | "WHATSAPP">("WHATSAPP");
  const [simSender, setSimSender] = useState("Pooja Sharma");
  const [simEmail, setSimEmail] = useState("pooja@example.com");
  const [simPhone, setSimPhone] = useState("+91 98860 98765");
  const [simMessage, setSimMessage] = useState("Is a villa free 14-16 Nov for 2 adults and a child?");

  const [isPending, startTransition] = useTransition();

  // Keep draft text synced when selection changes
  const handleSelectEnquiry = (enquiry: EnquiryItem) => {
    setSelectedId(enquiry.id);
    setDraftText(enquiry.draftReply);
    setRerouteOwner(enquiry.assignedTo);
    setDraftSaved(false);
  };

  // Filtered enquiries
  const filteredEnquiries = enquiries.filter((e) => {
    if (activeTab === "PENDING" && (e.status !== "PENDING" && e.status !== "REVIEWED")) return false;
    if (activeTab === "ESCALATED_GM" && e.status !== "ESCALATED_GM") return false;
    if (activeTab === "NEEDS_REVIEW" && e.status !== "NEEDS_REVIEW") return false;
    if (activeTab === "REPLIED" && !e.isSent) return false;

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      return (
        e.enquiryNumber.toLowerCase().includes(q) ||
        e.senderName.toLowerCase().includes(q) ||
        e.rawMessage.toLowerCase().includes(q) ||
        e.category.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Action: 1-Click Re-route
  const handleReroute = (newOwner: string) => {
    setRerouteOwner(newOwner);
    startTransition(async () => {
      const res = await rerouteEnquiry(selectedEnquiry.id, newOwner);
      if (res.success && res.enquiry) {
        setEnquiries((prev) =>
          prev.map((item) => (item.id === res.enquiry.id ? (res.enquiry as any) : item))
        );
      }
    });
  };

  // Action: Save Draft Text
  const handleSaveDraft = () => {
    startTransition(async () => {
      const res = await updateDraftReply(selectedEnquiry.id, draftText);
      if (res.success) {
        setDraftSaved(true);
        setTimeout(() => setDraftSaved(false), 2500);
      }
    });
  };

  // Action: 1-Click Approve & Dispatch Reply
  const handleApproveAndSend = () => {
    startTransition(async () => {
      const res = await approveAndSendReply(selectedEnquiry.id);
      if (res.success && res.enquiry) {
        setEnquiries((prev) =>
          prev.map((item) => (item.id === res.enquiry.id ? (res.enquiry as any) : item))
        );
      }
    });
  };

  // Simulator Ingestion
  const handleRunSimulator = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const res = await submitEnquiry({
        channel: simChannel,
        senderName: simSender,
        senderEmail: simEmail,
        senderPhone: simPhone,
        message: simMessage,
      });

      if (res.success && res.enquiry) {
        setEnquiries((prev) => [res.enquiry as any, ...prev]);
        handleSelectEnquiry(res.enquiry as any);
        setSimulatorOpen(false);
      }
    });
  };

  // Quick preset loader for reviewer testing
  const loadSimulatorPreset = (type: "wedding" | "room" | "offsite" | "complaint" | "low_confidence") => {
    if (type === "wedding") {
      setSimChannel("WEB_FORM");
      setSimSender("Vikramaditya Hegde");
      setSimEmail("vikram@example.com");
      setSimPhone("+91 98450 12345");
      setSimMessage("Venue for my sister's wedding in Feb 2027, about 250 guests, 2 nights");
    } else if (type === "room") {
      setSimChannel("WHATSAPP");
      setSimSender("Pooja Sharma");
      setSimEmail("pooja@example.com");
      setSimPhone("+91 98860 98765");
      setSimMessage("Is a villa free 14-16 Nov for 2 adults and a child?");
    } else if (type === "offsite") {
      setSimChannel("EMAIL");
      setSimSender("Arun Iyer (Tech Mahindra)");
      setSimEmail("arun.iyer@techfirm.io");
      setSimPhone("+91 97410 44556");
      setSimMessage("Team of 45 wants a January offsite with a conference hall");
    } else if (type === "complaint") {
      setSimChannel("WHATSAPP");
      setSimSender("Dr. Sandeep Rao");
      setSimEmail("dr.sandeep@hospital.org");
      setSimPhone("+91 94480 33221");
      setSimMessage("Hot water geyser was completely broken in Cottage 12 during our stay this morning and the front desk took 2 hours to send someone. Deeply disappointed.");
    } else if (type === "low_confidence") {
      setSimChannel("EMAIL");
      setSimSender("Anonymous Inquirer");
      setSimEmail("inquirer@outlook.com");
      setSimPhone("+91 90000 00000");
      setSimMessage("Send best rates and package details.");
    }
  };

  // Tab counts
  const escalatedCount = enquiries.filter((e) => e.status === "ESCALATED_GM").length;
  const needsReviewCount = enquiries.filter((e) => e.status === "NEEDS_REVIEW").length;
  const pendingCount = enquiries.filter((e) => e.status === "PENDING" || e.status === "REVIEWED").length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Header & Simulator Launcher */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[#E3DAC5]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-serif text-2xl font-bold text-[#182F18]">
              Unified AI Enquiry Inbox
            </h1>
            <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full border border-emerald-300">
              Live AI Routing
            </span>
          </div>
          <p className="text-xs text-stone-500 mt-0.5">
            Omnichannel ingestion (Web, Email, WhatsApp) • Rate-table grounded reply drafting • 1-Click human dispatch
          </p>
        </div>

        {/* Inbound Simulator Launcher Button */}
        <button
          onClick={() => setSimulatorOpen(!simulatorOpen)}
          className="px-4 py-2 bg-[#446B44] hover:bg-[#2F502F] text-white text-xs font-semibold rounded-xl flex items-center gap-2 transition shadow-sm"
        >
          <Sparkles className="w-4 h-4 text-[#C5A880]" />
          <span>{simulatorOpen ? "Close Inbound Simulator" : "Simulate Incoming Enquiry"}</span>
        </button>
      </div>

      {/* Simulator Drawer for Reviewers */}
      {simulatorOpen && (
        <div className="p-5 rounded-2xl bg-[#F8F4EC] border-2 border-dashed border-[#C5A880] space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div>
              <h3 className="font-serif text-sm font-bold text-[#182F18] flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#7E5433]" />
                Reviewer Inbound Message Simulator
              </h3>
              <p className="text-[11px] text-stone-600">
                Test how the AI pipeline classifies intents, detects complaints, flags low-confidence queries, and fetches grounded rates.
              </p>
            </div>

            {/* Quick Presets */}
            <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
              <span className="text-stone-400 font-medium">Quick Presets:</span>
              <button
                type="button"
                onClick={() => loadSimulatorPreset("wedding")}
                className="px-2 py-1 bg-white hover:bg-stone-50 rounded border border-stone-200 text-stone-700"
              >
                👰 ENQ-4410 (Wedding)
              </button>
              <button
                type="button"
                onClick={() => loadSimulatorPreset("room")}
                className="px-2 py-1 bg-white hover:bg-stone-50 rounded border border-stone-200 text-stone-700"
              >
                🛏️ ENQ-4411 (Room Rate)
              </button>
              <button
                type="button"
                onClick={() => loadSimulatorPreset("offsite")}
                className="px-2 py-1 bg-white hover:bg-stone-50 rounded border border-stone-200 text-stone-700"
              >
                💼 ENQ-4412 (Offsite)
              </button>
              <button
                type="button"
                onClick={() => loadSimulatorPreset("complaint")}
                className="px-2 py-1 bg-red-50 hover:bg-red-100 rounded border border-red-200 text-red-700 font-medium"
              >
                🚨 Complaint (GM Alert)
              </button>
              <button
                type="button"
                onClick={() => loadSimulatorPreset("low_confidence")}
                className="px-2 py-1 bg-amber-50 hover:bg-amber-100 rounded border border-amber-200 text-amber-800 font-medium"
              >
                ⚠️ Ambiguous (&lt;80% GM Lane)
              </button>
            </div>
          </div>

          <form onSubmit={handleRunSimulator} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-stone-700 mb-1">Ingestion Channel</label>
                <select
                  value={simChannel}
                  onChange={(e) => setSimChannel(e.target.value as any)}
                  className="w-full text-xs p-2 rounded-lg border border-[#D3C6AA] bg-white font-medium"
                >
                  <option value="WHATSAPP">WhatsApp Message</option>
                  <option value="EMAIL">Forwarded Email</option>
                  <option value="WEB_FORM">Web Form Submission</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-stone-700 mb-1">Sender Name</label>
                <input
                  type="text"
                  required
                  value={simSender}
                  onChange={(e) => setSimSender(e.target.value)}
                  className="w-full text-xs p-2 rounded-lg border border-[#D3C6AA] bg-white"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-stone-700 mb-1">Email</label>
                <input
                  type="email"
                  value={simEmail}
                  onChange={(e) => setSimEmail(e.target.value)}
                  className="w-full text-xs p-2 rounded-lg border border-[#D3C6AA] bg-white"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-stone-700 mb-1">Phone</label>
                <input
                  type="tel"
                  value={simPhone}
                  onChange={(e) => setSimPhone(e.target.value)}
                  className="w-full text-xs p-2 rounded-lg border border-[#D3C6AA] bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-stone-700 mb-1">Inbound Message Body</label>
              <textarea
                rows={2}
                required
                value={simMessage}
                onChange={(e) => setSimMessage(e.target.value)}
                className="w-full text-xs p-2.5 rounded-lg border border-[#D3C6AA] bg-white"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isPending}
                className="px-5 py-2 bg-[#182F18] hover:bg-[#2F502F] text-white text-xs font-bold rounded-lg flex items-center gap-1.5 transition shadow"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isPending ? "Ingesting & Routing..." : "Ingest into AI Pipeline"}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-2 rounded-xl border border-[#D3C6AA]">
        <div className="flex items-center gap-1.5 overflow-x-auto text-xs font-medium">
          <button
            onClick={() => setActiveTab("ALL")}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeTab === "ALL"
                ? "bg-[#182F18] text-white font-bold"
                : "text-stone-600 hover:bg-stone-100"
            }`}
          >
            All Enquiries ({enquiries.length})
          </button>

          <button
            onClick={() => setActiveTab("PENDING")}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeTab === "PENDING"
                ? "bg-[#182F18] text-white font-bold"
                : "text-stone-600 hover:bg-stone-100"
            }`}
          >
            Pending Review ({pendingCount})
          </button>

          {/* Urgent GM Escalation Lane for Complaints */}
          <button
            onClick={() => setActiveTab("ESCALATED_GM")}
            className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
              activeTab === "ESCALATED_GM"
                ? "bg-red-700 text-white font-bold"
                : "text-red-700 bg-red-50 hover:bg-red-100"
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Escalated to GM (Complaints)</span>
            {escalatedCount > 0 && (
              <span className="bg-red-600 text-white text-[10px] font-bold px-1.5 rounded-full">
                {escalatedCount}
              </span>
            )}
          </button>

          {/* Low-Confidence GM Lane */}
          <button
            onClick={() => setActiveTab("NEEDS_REVIEW")}
            className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
              activeTab === "NEEDS_REVIEW"
                ? "bg-amber-600 text-white font-bold"
                : "text-amber-800 bg-amber-50 hover:bg-amber-100"
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Low Confidence / Unsorted (&lt;80%)</span>
            {needsReviewCount > 0 && (
              <span className="bg-amber-500 text-white text-[10px] font-bold px-1.5 rounded-full">
                {needsReviewCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("REPLIED")}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeTab === "REPLIED"
                ? "bg-[#182F18] text-white font-bold"
                : "text-stone-600 hover:bg-stone-100"
            }`}
          >
            Dispatched ({enquiries.filter((e) => e.isSent).length})
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-56">
          <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-2.5" />
          <input
            type="text"
            placeholder="Search enquiries..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-xs pl-8 pr-3 py-1.5 rounded-lg border border-stone-200 bg-stone-50"
          />
        </div>
      </div>

      {/* Main Split-View Inbox */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left List Pane (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-[#D3C6AA] overflow-hidden shadow-sm divide-y divide-stone-100 max-h-[750px] overflow-y-auto">
          {filteredEnquiries.length === 0 ? (
            <div className="p-8 text-center text-xs text-stone-500 space-y-2">
              <Inbox className="w-8 h-8 text-stone-300 mx-auto" />
              <p>No enquiries found in this lane.</p>
            </div>
          ) : (
            filteredEnquiries.map((enquiry) => {
              const isSelected = enquiry.id === selectedId;
              const isComplaint = enquiry.status === "ESCALATED_GM";
              const isLowConf = enquiry.status === "NEEDS_REVIEW";

              return (
                <div
                  key={enquiry.id}
                  onClick={() => handleSelectEnquiry(enquiry)}
                  className={`p-4 cursor-pointer transition text-xs space-y-2 border-l-4 ${
                    isSelected
                      ? "bg-[#FAF6F2] border-l-[#182F18]"
                      : isComplaint
                      ? "bg-red-50/40 border-l-red-500 hover:bg-red-50/70"
                      : isLowConf
                      ? "bg-amber-50/30 border-l-amber-500 hover:bg-amber-50/60"
                      : "border-l-transparent hover:bg-stone-50"
                  }`}
                >
                  {/* Top Bar in Item */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      {/* Channel Icon */}
                      {enquiry.channel === "WHATSAPP" && (
                        <span className="p-1 rounded bg-emerald-100 text-emerald-800" title="WhatsApp">
                          <MessageSquare className="w-3 h-3" />
                        </span>
                      )}
                      {enquiry.channel === "EMAIL" && (
                        <span className="p-1 rounded bg-blue-100 text-blue-800" title="Email">
                          <Mail className="w-3 h-3" />
                        </span>
                      )}
                      {enquiry.channel === "WEB_FORM" && (
                        <span className="p-1 rounded bg-stone-100 text-stone-700" title="Web Form">
                          <Globe className="w-3 h-3" />
                        </span>
                      )}
                      <span className="font-mono font-bold text-[11px] text-[#182F18]">
                        {enquiry.enquiryNumber}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {isComplaint && (
                        <span className="text-[9px] font-bold uppercase tracking-wider bg-red-600 text-white px-1.5 py-0.2 rounded animate-pulse">
                          GM Alert
                        </span>
                      )}
                      {isLowConf && (
                        <span className="text-[9px] font-bold uppercase tracking-wider bg-amber-500 text-white px-1.5 py-0.2 rounded">
                          &lt;80% GM Lane
                        </span>
                      )}
                      {enquiry.isSent ? (
                        <span className="text-[10px] text-emerald-700 font-semibold flex items-center gap-0.5">
                          <Check className="w-3 h-3" /> Replied
                        </span>
                      ) : (
                        <span className="text-[10px] text-stone-400">
                          {Math.round(enquiry.confidenceScore * 100)}% AI Conf
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Sender & Snippet */}
                  <div>
                    <p className="font-bold text-stone-900 truncate">{enquiry.senderName}</p>
                    <p className="text-stone-600 line-clamp-2 mt-0.5 leading-normal">
                      {enquiry.rawMessage}
                    </p>
                  </div>

                  {/* Badges Footer */}
                  <div className="flex items-center justify-between text-[10px] pt-1 text-stone-400 border-t border-stone-100">
                    <span className="font-semibold text-stone-600 bg-stone-100 px-1.5 py-0.5 rounded">
                      {enquiry.category}
                    </span>
                    <span className="truncate max-w-[150px]">
                      👤 {enquiry.assignedTo.split("(")[0]}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right Detail Pane (7 cols) */}
        {selectedEnquiry ? (
          <div className="lg:col-span-7 bg-white rounded-2xl border border-[#D3C6AA] shadow-sm p-6 space-y-6">
            {/* Header info */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-stone-200">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-base font-bold text-[#182F18]">
                    {selectedEnquiry.enquiryNumber}
                  </span>
                  <span className="text-xs bg-[#EFE8DA] text-[#446B44] font-semibold px-2 py-0.5 rounded">
                    Channel: {selectedEnquiry.channel}
                  </span>
                  {selectedEnquiry.status === "ESCALATED_GM" && (
                    <span className="text-xs bg-red-600 text-white font-bold px-2 py-0.5 rounded flex items-center gap-1">
                      <ShieldAlert className="w-3 h-3" /> ESCALATED TO GM
                    </span>
                  )}
                  {selectedEnquiry.status === "NEEDS_REVIEW" && (
                    <span className="text-xs bg-amber-500 text-white font-bold px-2 py-0.5 rounded flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" /> LOW CONFIDENCE GM LANE
                    </span>
                  )}
                </div>
                <p className="text-xs text-stone-500 mt-1">
                  Received from <strong>{selectedEnquiry.senderName}</strong>
                  {selectedEnquiry.senderEmail && ` • ${selectedEnquiry.senderEmail}`}
                  {selectedEnquiry.senderPhone && ` • ${selectedEnquiry.senderPhone}`}
                </p>
              </div>

              {/* 1-Click Re-Route Dropdown */}
              <div className="text-xs">
                <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-1">
                  Assigned Owner (1-Click Re-Route)
                </label>
                <select
                  value={rerouteOwner}
                  onChange={(e) => handleReroute(e.target.value)}
                  className="p-1.5 rounded-lg border border-[#D3C6AA] bg-stone-50 text-xs font-medium"
                >
                  <option value="Reservations Team">Reservations Team</option>
                  <option value="Sales Team (Events)">Sales Team (Events)</option>
                  <option value="Sales Team (Corporate)">Sales Team (Corporate)</option>
                  <option value="General Manager (Urgent Escalation)">General Manager (Urgent)</option>
                  <option value="General Manager (Unsorted Lane)">General Manager (Unsorted)</option>
                </select>
              </div>
            </div>

            {/* AI Classification & Entity Card */}
            <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#D3C6AA] space-y-3 text-xs">
              <div className="flex items-center justify-between font-bold text-stone-800">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-[#C5A880]" />
                  AI Router Extraction Analysis
                </span>
                <span className="text-emerald-700">
                  Confidence Score: {Math.round(selectedEnquiry.confidenceScore * 100)}%
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                <div className="p-2 bg-white rounded-lg border border-stone-200">
                  <span className="text-stone-400 block text-[9px] uppercase font-bold">Category</span>
                  <span className="font-bold text-[#182F18]">{selectedEnquiry.category}</span>
                </div>
                <div className="p-2 bg-white rounded-lg border border-stone-200">
                  <span className="text-stone-400 block text-[9px] uppercase font-bold">Stay / Dates</span>
                  <span className="font-medium text-stone-800">{selectedEnquiry.extractedDates || "Not specified"}</span>
                </div>
                <div className="p-2 bg-white rounded-lg border border-stone-200">
                  <span className="text-stone-400 block text-[9px] uppercase font-bold">Party / Pax</span>
                  <span className="font-medium text-stone-800">{selectedEnquiry.extractedPax ? `${selectedEnquiry.extractedPax} pax` : "Not specified"}</span>
                </div>
                <div className="p-2 bg-white rounded-lg border border-stone-200">
                  <span className="text-stone-400 block text-[9px] uppercase font-bold">Target Budget</span>
                  <span className="font-medium text-stone-800">
                    {selectedEnquiry.extractedBudget ? `₹${selectedEnquiry.extractedBudget.toLocaleString("en-IN")}` : "Flexible"}
                  </span>
                </div>
              </div>

              {selectedEnquiry.notes && (
                <p className="text-[11px] text-stone-600 bg-white p-2 rounded-lg border border-stone-200">
                  <strong>Router Note:</strong> {selectedEnquiry.notes}
                </p>
              )}
            </div>

            {/* Raw Message Box */}
            <div className="space-y-1.5 text-xs">
              <span className="font-bold uppercase tracking-wider text-stone-400 text-[10px]">
                Original Inbound Message
              </span>
              <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 text-stone-800 leading-relaxed font-mono text-[11px]">
                "{selectedEnquiry.rawMessage}"
              </div>
            </div>

            {/* Rate-Table Grounding Guarantee Notice */}
            <div className="p-2.5 rounded-lg bg-emerald-50/70 border border-emerald-200 text-[11px] text-emerald-950 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                <strong>Rate Integrity:</strong> All quoted prices in the draft are pulled from the live database rate table. The AI does not invent numbers.
              </span>
              <span className="text-[10px] uppercase font-bold text-emerald-700 bg-white px-2 py-0.5 rounded border border-emerald-200">
                Grounded
              </span>
            </div>

            {/* Editable Draft Reply Section */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <label className="font-bold uppercase tracking-wider text-[#492E1E] text-[10px] flex items-center gap-1">
                  <Edit3 className="w-3 h-3" />
                  Rate-Grounded Reply Draft (Human-In-The-Loop Approval Required)
                </label>
                {selectedEnquiry.isSent && (
                  <span className="text-emerald-700 font-bold flex items-center gap-1 text-[11px]">
                    <CheckCircle className="w-3.5 h-3.5" /> Dispatched to Guest
                  </span>
                )}
              </div>

              <textarea
                rows={9}
                value={draftText}
                disabled={selectedEnquiry.isSent}
                onChange={(e) => setDraftText(e.target.value)}
                className="w-full text-xs p-3.5 rounded-xl border border-[#D3C6AA] bg-white leading-relaxed focus:outline-none focus:ring-1 focus:ring-[#182F18] font-sans disabled:bg-stone-50"
              />

              {/* Actions Footer */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <div className="flex items-center gap-2">
                  {!selectedEnquiry.isSent && (
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={handleSaveDraft}
                      className="px-3.5 py-2 border border-[#D3C6AA] bg-stone-50 hover:bg-white text-stone-800 text-xs font-semibold rounded-xl transition"
                    >
                      {draftSaved ? "✓ Draft Saved" : "Save Changes"}
                    </button>
                  )}
                  <span className="text-[11px] text-stone-400">
                    Drafts are never sent automatically.
                  </span>
                </div>

                {!selectedEnquiry.isSent ? (
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={handleApproveAndSend}
                    className="px-5 py-2.5 bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center gap-2 transition shadow-md disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{isPending ? "Dispatching..." : "Approve & Dispatch Reply"}</span>
                  </button>
                ) : (
                  <div className="text-xs text-stone-500">
                    Replied on {new Date(selectedEnquiry.sentAt || Date.now()).toLocaleString("en-IN")}
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="lg:col-span-7 bg-white rounded-2xl border border-stone-200 p-12 text-center text-xs text-stone-400">
            Select an enquiry to review AI routing and draft replies.
          </div>
        )}
      </div>
    </div>
  );
}
