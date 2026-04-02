import fs from "fs/promises";
import path from "path";
import { Lead } from "../types";

const DATA_FILE = path.join(process.cwd(), "data", "leads.json");

export async function getLeads(): Promise<Lead[]> {
  try {
    const data = await fs.readFile(DATA_FILE, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

export async function saveLeads(newLeads: Lead[]): Promise<void> {
  const existingLeads = await getLeads();
  const existingIds = new Set(existingLeads.map(l => l.id));
  
  const uniqueNewLeads = newLeads.filter(l => !existingIds.has(l.id));
  const allLeads = [...uniqueNewLeads, ...existingLeads];
  
  await fs.writeFile(DATA_FILE, JSON.stringify(allLeads, null, 2));
}

export async function clearLeads(): Promise<void> {
  await fs.writeFile(DATA_FILE, JSON.stringify([], null, 2));
}
