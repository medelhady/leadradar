"use client";

import { useEffect, useState, useCallback } from "react";
import { Building2, Mail, Download, AlertCircle, CheckCircle, Radar, Users } from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { SearchForm } from "@/components/SearchForm";
import { LeadsTable } from "@/components/LeadsTable";
import { supabase } from "@/lib/supabase";
import { Lead, SearchParams, SearchResult } from "@/types";

export default function Dashboard() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastResult, setLastResult] = useState<SearchResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);

  const loadLeads = useCallback(async () => {
    const { data } = await supabase.from("leads").select("*").order("created_at", { ascending: false });
    if (data) setLeads(data);
  }, []);

  useEffect(() => {
    loadLeads();
  }, [loadLeads]);

  const totalEmails = leads.filter((l) => l.email).length;
  const uniqueCompanies = new Set(leads.map((l) => l.company_name)).size;

  const handleSearch = async (params: SearchParams) => {
    setIsLoading(true);
    setError(null);
    setLastResult(null);

    try {
      const res = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Search failed");
        return;
      }

      setLastResult(data as SearchResult);
      await loadLeads();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Network error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const res = await fetch("/api/export");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `leads-${Date.now()}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="min-h-screen" style={{ background: "var(--color-bg)" }}>
      {/* Header */}
      <header
        className="sticky top-0 z-10 border-b backdrop-blur-sm"
        style={{ background: "rgba(10,15,30,0.85)", borderColor: "var(--color-border)" }}
      >
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <Radar size={20} className="text-blue-400" />
            </div>
            <div>
              <h1 className="text-base font-bold" style={{ color: "var(--color-text)" }}>
                LeadRadar
              </h1>
              <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                Property Management Lead Generator
              </p>
            </div>
          </div>

          <button
            onClick={handleExport}
            disabled={exporting || leads.length === 0}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            style={{
              background: "var(--color-surface)",
              borderColor: "var(--color-border)",
              color: "var(--color-text-dim)",
            }}
          >
            <Download size={14} />
            {exporting ? "Exporting…" : "Export CSV"}
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard
            label="Total Leads"
            value={leads.length}
            icon={<Users size={20} />}
            color="blue"
            description="Rows saved in Supabase"
          />
          <StatCard
            label="Emails Found"
            value={totalEmails}
            icon={<Mail size={20} />}
            color="green"
            description="Verified email addresses"
          />
          <StatCard
            label="Companies"
            value={uniqueCompanies}
            icon={<Building2 size={20} />}
            color="amber"
            description="Unique businesses scraped"
          />
        </div>

        {/* Search Form */}
        <SearchForm onSearch={handleSearch} isLoading={isLoading} />

        {/* Result banners */}
        {error && (
          <div className="flex items-start gap-3 p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-sm text-red-400">
            <AlertCircle size={16} className="mt-0.5 shrink-0" />
            <div>
              <p className="font-medium">Error</p>
              <p className="opacity-80">{error}</p>
            </div>
          </div>
        )}

        {lastResult && (
          <div className="flex items-start gap-3 p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-sm text-emerald-400">
            <CheckCircle size={16} className="mt-0.5 shrink-0" />
            <div>
              <p className="font-medium">Search complete</p>
              <p className="opacity-80">
                Found {lastResult.stats.companiesFound} companies → {lastResult.stats.emailsFound} emails collected,{" "}
                {lastResult.stats.skippedDuplicates} duplicates skipped.
                {lastResult.errors.length > 0 && ` (${lastResult.errors.length} minor errors)`}
              </p>
            </div>
          </div>
        )}

        {/* Leads Table */}
        <LeadsTable leads={leads} />
      </main>
    </div>
  );
}
