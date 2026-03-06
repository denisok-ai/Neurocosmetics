/**
 * @file b2b-leads.ts
 * @description B2B-лиды — сохранение и чтение из Supabase (таблица b2b_leads)
 * @created 2025-03-06
 */

import type { SupabaseClient } from "@supabase/supabase-js";

export interface B2BLead {
  id: string;
  company: string;
  contact_name: string;
  email: string;
  phone: string;
  message: string;
  source: "b2b_form" | "b2b_chat";
  created_at: string;
}

function rowToLead(r: {
  id: string;
  company: string | null;
  contact_name: string | null;
  email: string;
  phone: string | null;
  message: string | null;
  source: string;
  created_at: string;
}): B2BLead {
  return {
    id: r.id,
    company: r.company ?? "",
    contact_name: r.contact_name ?? "",
    email: r.email,
    phone: r.phone ?? "",
    message: r.message ?? "",
    source: r.source === "b2b_chat" ? "b2b_chat" : "b2b_form",
    created_at: r.created_at,
  };
}

export async function addB2BLeadToSupabase(
  supabase: SupabaseClient,
  data: Omit<B2BLead, "id" | "created_at" | "source">,
  source: B2BLead["source"] = "b2b_form"
): Promise<B2BLead> {
  const { data: row, error } = await supabase
    .from("b2b_leads")
    .insert({
      company: data.company || null,
      contact_name: data.contact_name || null,
      email: data.email,
      phone: data.phone || null,
      message: data.message || null,
      source,
    })
    .select("id, company, contact_name, email, phone, message, source, created_at")
    .single();

  if (error) throw error;
  return rowToLead(row);
}

export async function getB2BLeadsFromSupabase(supabase: SupabaseClient): Promise<B2BLead[]> {
  const { data: rows, error } = await supabase
    .from("b2b_leads")
    .select("id, company, contact_name, email, phone, message, source, created_at")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (rows ?? []).map(rowToLead);
}
