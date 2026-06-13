"use client";

import { useState } from "react";
import { Search, Loader2 } from "lucide-react";
import { SearchParams } from "@/types";

const US_STATES = [
  "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA",
  "KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ",
  "NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT",
  "VA","WA","WV","WI","WY",
];

interface SearchFormProps {
  onSearch: (params: SearchParams) => void;
  isLoading: boolean;
}

export function SearchForm({ onSearch, isLoading }: SearchFormProps) {
  const [params, setParams] = useState<SearchParams>({
    keyword: "property management company",
    city: "",
    state: "CA",
    maxResults: 20,
  });

  const handleSubmit = () => {
    if (!params.city.trim()) return;
    onSearch(params);
  };

  return (
    <div
      style={{ background: "var(--color-surface)", borderColor: "var(--color-border)" }}
      className="rounded-xl border p-6"
    >
      <h2 className="text-lg font-semibold mb-5" style={{ color: "var(--color-text)" }}>
        Search Parameters
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Keyword */}
        <div className="lg:col-span-2">
          <label className="block text-xs font-medium mb-2 uppercase tracking-wider" style={{ color: "var(--color-text-muted)" }}>
            Keyword
          </label>
          <input
            type="text"
            value={params.keyword}
            onChange={(e) => setParams((p) => ({ ...p, keyword: e.target.value }))}
            placeholder="property management company"
            style={{
              background: "var(--color-surface-2)",
              borderColor: "var(--color-border)",
              color: "var(--color-text)",
            }}
            className="w-full rounded-lg border px-4 py-2.5 text-sm outline-none focus:border-blue-500 transition-colors placeholder:text-slate-600"
          />
        </div>

        {/* City */}
        <div>
          <label className="block text-xs font-medium mb-2 uppercase tracking-wider" style={{ color: "var(--color-text-muted)" }}>
            City
          </label>
          <input
            type="text"
            value={params.city}
            onChange={(e) => setParams((p) => ({ ...p, city: e.target.value }))}
            placeholder="Los Angeles"
            style={{
              background: "var(--color-surface-2)",
              borderColor: "var(--color-border)",
              color: "var(--color-text)",
            }}
            className="w-full rounded-lg border px-4 py-2.5 text-sm outline-none focus:border-blue-500 transition-colors placeholder:text-slate-600"
          />
        </div>

        {/* State */}
        <div>
          <label className="block text-xs font-medium mb-2 uppercase tracking-wider" style={{ color: "var(--color-text-muted)" }}>
            State
          </label>
          <select
            value={params.state}
            onChange={(e) => setParams((p) => ({ ...p, state: e.target.value }))}
            style={{
              background: "var(--color-surface-2)",
              borderColor: "var(--color-border)",
              color: "var(--color-text)",
            }}
            className="w-full rounded-lg border px-4 py-2.5 text-sm outline-none focus:border-blue-500 transition-colors"
          >
            {US_STATES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        {/* Max Results */}
        <div>
          <label className="block text-xs font-medium mb-2 uppercase tracking-wider" style={{ color: "var(--color-text-muted)" }}>
            Max Results
          </label>
          <input
            type="number"
            min={1}
            max={100}
            value={params.maxResults}
            onChange={(e) => setParams((p) => ({ ...p, maxResults: Number(e.target.value) }))}
            style={{
              background: "var(--color-surface-2)",
              borderColor: "var(--color-border)",
              color: "var(--color-text)",
            }}
            className="w-full rounded-lg border px-4 py-2.5 text-sm outline-none focus:border-blue-500 transition-colors"
          />
        </div>

        {/* Submit */}
        <div className="lg:col-span-3 flex items-end">
          <button
            onClick={handleSubmit}
            disabled={isLoading || !params.city.trim()}
            className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            style={{ background: isLoading ? "var(--color-accent-dim)" : "var(--color-accent)", color: "#fff" }}
          >
            {isLoading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Scraping…
              </>
            ) : (
              <>
                <Search size={16} />
                Find Leads
              </>
            )}
          </button>
        </div>
      </div>

      {isLoading && (
        <div className="mt-4 p-4 rounded-lg bg-blue-500/5 border border-blue-500/20">
          <p className="text-sm text-blue-400 flex items-center gap-2">
            <Loader2 size={14} className="animate-spin" />
            Running Apify Google Maps Scraper, then visiting each website to extract emails. This may take 2–5 minutes…
          </p>
        </div>
      )}
    </div>
  );
}
