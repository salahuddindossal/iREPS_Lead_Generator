import express from "express";
import path from "path";
import cors from "cors";
import fs from "fs";
import { scrapeLeads } from "./src/services/scraper";
import { getLeads, saveLeads, clearLeads } from "./src/services/storage";

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  app.use(cors());
  app.use(express.json());

  // Ensure data directory exists
  const dataDir = path.join(process.cwd(), "data");
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir);
  }

  // API Routes
  app.get("/api/leads", async (req, res) => {
    try {
      const leads = await getLeads();
      res.json(leads);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch leads" });
    }
  });

  app.post("/api/refresh", async (req, res) => {
    try {
      await clearLeads(); // Reset leads on each scan as requested
      const newLeads = await scrapeLeads();
      await saveLeads(newLeads);
      res.json({ message: "Scrape completed", count: newLeads.length });
    } catch (error) {
      console.error("Scrape error:", error);
      res.status(500).json({ error: "Scrape failed" });
    }
  });

  app.post("/api/clear", async (req, res) => {
    try {
      await clearLeads();
      res.json({ message: "Database cleared" });
    } catch (error) {
      res.status(500).json({ error: "Clear failed" });
    }
  });

  app.get("/api/config/sources", (req, res) => {
    try {
      const configPath = path.join(process.cwd(), "src/config/source_config.json");
      const config = JSON.parse(fs.readFileSync(configPath, "utf8"));
      res.json(config);
    } catch (error) {
      res.status(500).json({ error: "Failed to load source config" });
    }
  });

  app.post("/api/config/sources", (req, res) => {
    try {
      const configPath = path.join(process.cwd(), "src/config/source_config.json");
      fs.writeFileSync(configPath, JSON.stringify(req.body, null, 4));
      res.json({ message: "Config updated" });
    } catch (error) {
      res.status(500).json({ error: "Failed to update source config" });
    }
  });

  app.get("/api/config/filters", (req, res) => {
    try {
      const configPath = path.join(process.cwd(), "src/config/filter_config.json");
      const config = JSON.parse(fs.readFileSync(configPath, "utf8"));
      res.json(config);
    } catch (error) {
      res.status(500).json({ error: "Failed to load filter config" });
    }
  });

  app.post("/api/config/filters", (req, res) => {
    try {
      const configPath = path.join(process.cwd(), "src/config/filter_config.json");
      fs.writeFileSync(configPath, JSON.stringify(req.body, null, 4));
      res.json({ message: "Config updated" });
    } catch (error) {
      res.status(500).json({ error: "Failed to update filter config" });
    }
  });

  app.get("/api/config/platforms", (req, res) => {
    try {
      const configPath = path.join(process.cwd(), "src/config/platform_config.json");
      const config = JSON.parse(fs.readFileSync(configPath, "utf8"));
      res.json(config);
    } catch (error) {
      res.status(500).json({ error: "Failed to load platform config" });
    }
  });

  app.post("/api/config/platforms", (req, res) => {
    try {
      const configPath = path.join(process.cwd(), "src/config/platform_config.json");
      fs.writeFileSync(configPath, JSON.stringify(req.body, null, 4));
      res.json({ message: "Config updated" });
    } catch (error) {
      res.status(500).json({ error: "Failed to update platform config" });
    }
  });

  app.get("/api/config/cities", (req, res) => {
    try {
      const configPath = path.join(process.cwd(), "src/config/cities.json");
      const config = JSON.parse(fs.readFileSync(configPath, "utf8"));
      res.json(config);
    } catch (error) {
      res.status(500).json({ error: "Failed to load cities config" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
