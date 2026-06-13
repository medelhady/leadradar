import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey);

export async function getLeads() {
  const { data, error } = await supabase
    .from("leads")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

export async function getStats() {
  const { data, error } = await supabase.from("leads").select("id, email, company_name");
  if (error) throw error;

  const totalLeads = data?.length ?? 0;
  const totalEmails = data?.filter((l) => l.email).length ?? 0;
  const uniqueCompanies = new Set(data?.map((l) => l.company_name)).size;

  return { totalLeads, totalEmails, totalCompanies: uniqueCompanies };
}

export async function checkDuplicate(website: string, email: string): Promise<boolean> {
  const { data } = await supabase
    .from("leads")
    .select("id")
    .or(`website.eq.${website},email.eq.${email}`)
    .limit(1);

  return (data?.length ?? 0) > 0;
}

export async function insertLead(lead: Omit<import("@/types").Lead, "id" | "created_at">) {
  const { data, error } = await supabase.from("leads").insert([lead]).select().single();
  if (error) throw error;
  return data;
}
