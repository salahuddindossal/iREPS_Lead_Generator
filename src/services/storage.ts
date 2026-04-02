import fs from "fs/promises";
import path from "path";
import { Lead } from "../types";

const DATA_FILE = path.join(process.cwd(), "data", "leads.json");

// In-memory storage for Vercel sessions (transient but works)
let inMemoryLeads: Lead[] = [];
const isVercel = process.env.VERCEL === "1";

export async function getLeads(): Promise<Lead[]> {
  if (isVercel) return inMemoryLeads;
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
  
  if (isVercel) {
    inMemoryLeads = allLeads;
    return;
  }
  
  try {
    await fs.writeFile(DATA_FILE, JSON.stringify(allLeads, null, 2));
  } catch (err) {
    console.warn("Storage warning: Could not write to disk. This is expected on Vercel.");
  }
}

export async function clearLeads(): Promise<void> {
  if (isVercel) {
    inMemoryLeads = [];
    return;
  }
  try {
    await fs.writeFile(DATA_FILE, JSON.stringify([], null, 2));
  } catch (err) {
    inMemoryLeads = []; // Secondary fallback
  }
}
