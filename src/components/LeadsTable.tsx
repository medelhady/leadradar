"use client";

import { Lead } from "@/types";
import { ExternalLink, Mail, Star, ChevronUp, ChevronDown } from "lucide-react";
import { useState } from "react";

interface LeadsTableProps {
  leads: Lead[];
}

type SortKey = keyof Lead;
type SortDir = "asc" | "desc";

export function LeadsTable({ leads }: LeadsTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>("created_at");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [filter, setFilter] = useState("");

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("asc"); }
  };

  const filtered = leads.filter((l) =>
    filter === ""
      ? true
      : [l.company_name, l.email, l.city, l.state, l.website]
          .some((v) => v?.toLowerCase().includes(filter.toLowerCase()))
  );

  const sorted = [...filtered].sort((a, b) => {
    const av = a[sortKey] ?? "";
    const bv = b[sortKey] ?? "";
    const cmp = av < bv ? -1 : av > bv ? 1 : 0;
    return sortDir === "asc" ? cmp : -cmp;
  });

  const SortIcon = ({ col }: { col: SortKey }) =>
    sortKey === col ? (
      sortDir === "asc" ? <ChevronUp size={12} /> : <ChevronDown size={12} />
    ) : (
      <ChevronDown size={12} className="opacity-30" />
    );

  const cols: { key: SortKey; label: string }[] = [
    { key: "company_name", label: "Company" },
    { key: "email", label: "Email" },
    { key: "website", label: "Website" },
    { key: "phone", label: "Phone" },
    { key: "city", label: "City" },
    { key: "state", label: "State" },
    { key: "rating", label: "Rating" },
    { key: "reviews", label: "Reviews" },
  ];

  return (
    <div style={{ background: "var(--color-surface)", borderColor: "var(--color-border)" }} className="rounded-xl border">
      {/* Header row */}
      <div className="flex items-center justify-between gap-4 p-4 border-b" style={{ borderColor: "var(--color-border)" }}>
        <h2 className="font-semibold text-sm uppercase tracking-wider" style={{ color: "var(--color-text-muted)" }}>
          Results — {sorted.length} leads
        </h2>
        <input
          type="text"
          placeholder="Filter by name, email, city…"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          style={{ background: "var(--color-surface-2)", borderColor: "var(--color-border)", color: "var(--color-text)" }}
          className="rounded-lg border px-3 py-1.5 text-sm outline-none focus:border-blue-500 transition-colors w-64 placeholder:text-slate-600"
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderColor: "var(--color-border)" }} className="border-b">
              {cols.map((c) => (
                <th
                  key={c.key}
                  onClick={() => handleSort(c.key)}
                  className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer select-none whitespace-nowrap"
                  style={{ color: "var(--color-text-muted)" }}
                >
                  <span className="flex items-center gap-1">
                    {c.label}
                    <SortIcon col={c.key} />
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center" style={{ color: "var(--color-text-muted)" }}>
                  No leads yet. Run a search to collect leads.
                </td>
              </tr>
            ) : (
              sorted.map((lead, i) => (
                <tr
                  key={lead.id ?? i}
                  className="border-b transition-colors hover:bg-white/[0.02]"
                  style={{ borderColor: "var(--color-border)" }}
                >
                  <td className="px-4 py-3 font-medium max-w-[200px] truncate" style={{ color: "var(--color-text)" }}>
                    {lead.company_name}
                  </td>
                  <td className="px-4 py-3">
                    {lead.email ? (
                      <a
                        href={`mailto:${lead.email}`}
                        className="flex items-center gap-1.5 text-blue-400 hover:text-blue-300 transition-colors"
                      >
                        <Mail size={12} />
                        <span className="truncate max-w-[180px]">{lead.email}</span>
                      </a>
                    ) : (
                      <span style={{ color: "var(--color-text-muted)" }}>—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {lead.website ? (
                      <a
                        href={lead.website.startsWith("http") ? lead.website : `https://${lead.website}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-blue-400 hover:text-blue-300 transition-colors truncate max-w-[160px]"
                      >
                        <ExternalLink size={11} />
                        {lead.website.replace(/^https?:\/\/(www\.)?/, "")}
                      </a>
                    ) : (
                      <span style={{ color: "var(--color-text-muted)" }}>—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs" style={{ color: "var(--color-text-dim)" }}>
                    {lead.phone || "—"}
                  </td>
                  <td className="px-4 py-3" style={{ color: "var(--color-text-dim)" }}>
                    {lead.city || "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className="px-2 py-0.5 rounded text-xs font-mono font-medium"
                      style={{ background: "var(--color-surface-2)", color: "var(--color-text-muted)" }}
                    >
                      {lead.state || "—"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {lead.rating ? (
                      <span className="flex items-center gap-1 text-amber-400">
                        <Star size={12} fill="currentColor" />
                        {lead.rating.toFixed(1)}
                      </span>
                    ) : (
                      <span style={{ color: "var(--color-text-muted)" }}>—</span>
                    )}
                  </td>
                  <td className="px-4 py-3" style={{ color: "var(--color-text-dim)" }}>
                    {lead.reviews?.toLocaleString() ?? "—"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
