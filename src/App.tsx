import React, { useState, useEffect } from "react";
import { 
  Search, 
  RefreshCw, 
  Download, 
  Filter, 
  TrendingUp, 
  AlertCircle, 
  Clock, 
  MapPin,
  Building2,
  Phone,
  Mail,
  ExternalLink,
  ChevronRight,
  Globe,
  Share2,
  MessageSquare,
  Facebook,
  Twitter as TwitterIcon,
  Linkedin,
  Instagram,
  Hash,
  Calendar,
  User,
  CheckCircle,
  X,
  Sparkles,
  Zap,
  Target,
  DollarSign,
  Briefcase,
  ShieldCheck,
  BrainCircuit,
  Lightbulb,
  Home,
  ArrowUpRight,
  TrendingDown,
  Activity
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Lead } from "./types";
import { cn } from "./lib/utils";
import { format } from "date-fns";

const PlatformIcon = ({ platform }: { platform?: Lead["social_platform"] }) => {
  switch (platform) {
    case "Facebook": return <Facebook className="w-4 h-4 text-blue-600" />;
    case "Twitter": return <TwitterIcon className="w-4 h-4 text-sky-500" />;
    case "Reddit": return <Share2 className="w-4 h-4 text-orange-600" />;
    case "LinkedIn": return <Linkedin className="w-4 h-4 text-blue-700" />;
    case "Instagram": return <Instagram className="w-4 h-4 text-pink-600" />;
    default: return <Globe className="w-4 h-4 text-slate-400" />;
  }
};

const CountryFlag = ({ country }: { country: Lead["country"] }) => {
  switch (country) {
    case "Canada": return <span title="Canada">🇨🇦</span>;
    case "USA": return <span title="USA">🇺🇸</span>;
    case "UK": return <span title="UK">🇬🇧</span>;
    default: return <Globe className="w-3.5 h-3.5 text-slate-400" />;
  }
};

const PlatformSelector = ({ config, onUpdate }: { config: any, onUpdate: (newConfig: any) => void }) => {
  if (!config) return null;

  const togglePlatform = (platform: string) => {
    const newConfig = { ...config };
    newConfig.platforms[platform].enabled = !newConfig.platforms[platform].enabled;
    onUpdate(newConfig);
  };

  const toggleFeature = (platform: string, feature: string) => {
    const newConfig = { ...config };
    newConfig.platforms[platform][feature] = !newConfig.platforms[platform][feature];
    onUpdate(newConfig);
  };

  const platforms = [
    { id: "reddit", name: "Reddit", icon: <Share2 className="w-5 h-5" />, color: "text-orange-600", features: ["scrape_posts", "scrape_comments"] },
    { id: "facebook", name: "Facebook", icon: <Facebook className="w-5 h-5" />, color: "text-blue-600", features: ["scrape_posts", "scrape_comments"] },
    { id: "instagram", name: "Instagram", icon: <Instagram className="w-5 h-5" />, color: "text-pink-600", features: ["scrape_posts", "scrape_comments"] },
    { id: "twitter", name: "Twitter", icon: <TwitterIcon className="w-5 h-5" />, color: "text-sky-500", features: ["scrape_tweets", "scrape_replies"] },
    { id: "linkedin", name: "LinkedIn", icon: <Linkedin className="w-5 h-5" />, color: "text-blue-700", features: ["scrape_posts", "scrape_comments"] },
  ];

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 mb-8 shadow-sm">
      <div className="flex items-center gap-2 mb-6">
        <Globe className="w-5 h-5 text-navy-900" />
        <h3 className="font-serif font-bold text-lg text-navy-900">Platform Selection</h3>
        <span className="text-xs font-medium text-slate-400 ml-2">Choose where to find buyers</span>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {platforms.map((p) => (
          <div 
            key={p.id}
            className={cn(
              "p-4 rounded-xl border transition-all",
              config.platforms[p.id].enabled 
                ? "bg-white border-gold-500 shadow-md shadow-gold-500/5" 
                : "bg-slate-50 border-slate-100 opacity-60"
            )}
          >
            <div className="flex items-center justify-between mb-3">
              <div className={cn("p-2 rounded-lg bg-slate-100", p.color)}>
                {p.icon}
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer"
                  checked={config.platforms[p.id].enabled}
                  onChange={() => togglePlatform(p.id)}
                />
                <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-gold-500"></div>
              </label>
            </div>
            
            <h4 className="font-bold text-sm mb-1">{p.name}</h4>
            <div className="space-y-1.5">
              {p.features.map(f => (
                <div key={f} className="flex items-center gap-2">
                  <input 
                    type="checkbox"
                    id={`${p.id}-${f}`}
                    className="w-3.5 h-3.5 rounded border-slate-300 text-gold-500 focus:ring-gold-500"
                    checked={config.platforms[p.id][f]}
                    onChange={() => toggleFeature(p.id, f)}
                    disabled={!config.platforms[p.id].enabled}
                  />
                  <label htmlFor={`${p.id}-${f}`} className="text-[10px] font-medium text-slate-500 capitalize">
                    {f.replace('scrape_', '').replace('_', ' ')}
                  </label>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function App() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<"All" | "High" | "Medium" | "Low">("All");
  const [countryFilter, setCountryFilter] = useState<string>("All");
  const [platformFilter, setPlatformFilter] = useState<string>("All");
  const [qualityFilter, setQualityFilter] = useState<string>("All");
  const [search, setSearch] = useState("");
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [sourceConfig, setSourceConfig] = useState<any>(null);
  const [filterConfig, setFilterConfig] = useState<any>(null);
  const [platformConfig, setPlatformConfig] = useState<any>(null);
  const [citiesConfig, setCitiesConfig] = useState<any>(null);
  const [selectedCountry, setSelectedCountry] = useState<string>("All");
  const [selectedCity, setSelectedCity] = useState<string>("All");
  const [selectedArea, setSelectedArea] = useState<string>("All");

  const fetchLeads = async () => {
    try {
      const res = await fetch("/api/leads");
      const data = await res.json();
      setLeads(data);
    } catch (error) {
      console.error("Failed to fetch leads", error);
    }
  };

  const fetchPlatformConfig = async () => {
    try {
      const res = await fetch("/api/config/platforms");
      const data = await res.json();
      setPlatformConfig(data);
    } catch (error) {
      console.error("Failed to fetch platform config", error);
    }
  };

  const fetchCitiesConfig = async () => {
    try {
      const res = await fetch("/api/config/cities");
      const data = await res.json();
      setCitiesConfig(data);
    } catch (error) {
      console.error("Failed to fetch cities config", error);
    }
  };

  const updatePlatformConfig = async (newConfig: any) => {
    try {
      await fetch("/api/config/platforms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newConfig)
      });
      setPlatformConfig(newConfig);
    } catch (error) {
      console.error("Failed to update platform config", error);
    }
  };

  const fetchSourceConfig = async () => {
    try {
      const res = await fetch("/api/config/sources");
      const data = await res.json();
      setSourceConfig(data);
    } catch (error) {
      console.error("Failed to fetch source config", error);
    }
  };

  const updateSourceConfig = async (newConfig: any) => {
    try {
      await fetch("/api/config/sources", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newConfig)
      });
      setSourceConfig(newConfig);
    } catch (error) {
      console.error("Failed to update source config", error);
    }
  };

  const fetchFilterConfig = async () => {
    try {
      const res = await fetch("/api/config/filters");
      const data = await res.json();
      setFilterConfig(data);
    } catch (error) {
      console.error("Failed to fetch filter config", error);
    }
  };

  const updateFilterConfig = async (newConfig: any) => {
    try {
      await fetch("/api/config/filters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newConfig)
      });
      setFilterConfig(newConfig);
    } catch (error) {
      console.error("Failed to update filter config", error);
    }
  };

  const handleRefresh = async () => {
    setLoading(true);
    try {
      // Save current platform config before refreshing
      if (platformConfig) {
        await updatePlatformConfig(platformConfig);
      }
      await fetch("/api/refresh", { method: "POST" });
      await fetchLeads();
    } catch (error) {
      console.error("Refresh failed", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
    fetchSourceConfig();
    fetchFilterConfig();
    fetchPlatformConfig();
    fetchCitiesConfig();
  }, []);

  const filteredLeads = leads.filter(lead => {
    const matchesPriority = filter === "All" || lead.priority === filter;
    const matchesCountry = selectedCountry === "All" || lead.country === selectedCountry;
    const matchesCity = selectedCity === "All" || lead.ai_location_city === selectedCity || lead.city === selectedCity;
    const matchesArea = selectedArea === "All" || lead.ai_location_area === selectedArea;
    const matchesPlatform = platformFilter === "All" || lead.social_platform === platformFilter;
    const matchesQuality = qualityFilter === "All" || 
                          (qualityFilter === "High" && lead.quality_level === "High") ||
                          (qualityFilter === "Medium+" && (lead.quality_level === "High" || lead.quality_level === "Medium")) ||
                          (qualityFilter === "Low" && lead.quality_level === "Low");
    
    // Phase 15: Apply persisted filters
    let matchesPersisted = true;
    if (filterConfig) {
      // Quality
      if (filterConfig.quality.level !== "All") {
        if (filterConfig.quality.level === "High" && lead.quality_level !== "High") matchesPersisted = false;
        if (filterConfig.quality.level === "Medium+" && lead.quality_level === "Low") matchesPersisted = false;
      }
      if (lead.score < filterConfig.quality.min_score) matchesPersisted = false;

      // Location
      if (filterConfig.location.country !== "All" && lead.country !== filterConfig.location.country) matchesPersisted = false;
      if (filterConfig.location.city && !lead.location.toLowerCase().includes(filterConfig.location.city.toLowerCase())) matchesPersisted = false;

      // Lead Type
      if (!filterConfig.lead_type.posts && !lead.platform_is_comment) matchesPersisted = false;
      if (!filterConfig.lead_type.comments && lead.platform_is_comment) matchesPersisted = false;
      if (filterConfig.lead_type.urgent_only && !lead.content.toLowerCase().includes("urgent")) matchesPersisted = false;
      if (filterConfig.lead_type.has_contact && !lead.phone && !lead.email) matchesPersisted = false;
      if (filterConfig.lead_type.has_budget && !lead.currency && !lead.content.toLowerCase().includes("budget")) matchesPersisted = false;
    }

    // Phase 16: AI Filters
    if (filterConfig) {
      if (filterConfig.ai?.verified_only && !lead.ai_is_lead) matchesPersisted = false;
      if (filterConfig.ai?.min_priority && (lead.ai_priority_score || 0) < filterConfig.ai.min_priority) matchesPersisted = false;
      if (filterConfig.ai?.intent !== "All" && lead.ai_intent !== filterConfig.ai.intent) matchesPersisted = false;
    }

    const matchesSearch = lead.title.toLowerCase().includes(search.toLowerCase()) || 
                         lead.content.toLowerCase().includes(search.toLowerCase()) ||
                         lead.location.toLowerCase().includes(search.toLowerCase()) ||
                         (lead.ai_summary?.toLowerCase().includes(search.toLowerCase()));
    return matchesPriority && matchesCountry && matchesCity && matchesArea && matchesPlatform && matchesQuality && matchesSearch && matchesPersisted;
  });

  const stats = {
    total: leads.length,
    hot_buyers: leads.filter(l => l.ai_intent_level === "high" || l.priority === "High").length,
    total_value: leads.reduce((acc, l) => acc + (l.ai_estimated_value || 0), 0),
    conversion: 73, // Mock conversion rate
    ai_confidence: 98 // Mock AI confidence
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* Header */}
      <header className="bg-navy-900 text-white border-b border-white/10 sticky top-0 z-40 backdrop-blur-md bg-navy-900/90">
        <div className="max-w-[1600px] mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gold-500 rounded-xl flex items-center justify-center shadow-lg shadow-gold-500/20">
              <Home className="w-6 h-6 text-navy-900" />
            </div>
            <div>
              <h1 className="text-xl font-serif font-bold tracking-tight text-white">iREPS</h1>
              <p className="text-[10px] font-bold text-gold-500 uppercase tracking-[0.2em]">Intelligent Real Estate Prospect System</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={handleRefresh}
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2.5 bg-gold-500 text-navy-900 font-bold rounded-xl hover:bg-gold-400 transition-all disabled:opacity-50 shadow-lg shadow-gold-500/20"
            >
              <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
              <span className="hidden sm:inline">Scan Markets</span>
            </button>
            <button className="p-2.5 text-white/60 hover:text-white hover:bg-white/10 rounded-xl transition-all">
              <Download className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto px-6 py-10">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <StatCard 
            title="Total Prospects" 
            value={stats.total} 
            icon={<Target className="w-5 h-5 text-navy-900" />} 
            color="navy" 
          />
          <StatCard 
            title="Hot Buyers" 
            value={stats.hot_buyers} 
            icon={<Zap className="w-5 h-5 text-rose-600" />} 
            color="rose" 
          />
          <StatCard 
            title="Pipeline Value" 
            value={`$${(stats.total_value / 1000000).toFixed(1)}M`} 
            icon={<DollarSign className="w-5 h-5 text-emerald-600" />} 
            color="emerald" 
          />
          <StatCard 
            title="AI Confidence" 
            value={`${stats.ai_confidence}%`} 
            icon={<Sparkles className="w-5 h-5 text-sky-600" />} 
            color="sky" 
          />
        </div>

        {/* Platform Selection */}
        <PlatformSelector config={platformConfig} onUpdate={updatePlatformConfig} />

        {/* Smart Filters */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 mb-8 shadow-sm">
          <div className="flex flex-wrap items-center gap-6">
            <div className="flex-1 min-w-[300px] relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search by location, property type, or buyer intent..."
                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold-500/20 focus:border-gold-500 transition-all text-sm"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            
            <div className="flex items-center gap-4">
              <select 
                className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-gold-500/20"
                value={selectedCountry}
                onChange={(e) => {
                  setSelectedCountry(e.target.value);
                  setSelectedCity("All");
                  setSelectedArea("All");
                }}
              >
                <option value="All">All Countries</option>
                <option value="Canada">Canada</option>
                <option value="USA">USA</option>
                <option value="UK">UK</option>
              </select>

              <select 
                className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-gold-500/20"
                value={selectedCity}
                onChange={(e) => {
                  setSelectedCity(e.target.value);
                  setSelectedArea("All");
                }}
                disabled={selectedCountry === "All"}
              >
                <option value="All">All Cities</option>
                {selectedCountry !== "All" && citiesConfig?.[selectedCountry] && Object.entries(citiesConfig[selectedCountry]).map(([key, city]: [string, any]) => (
                  <option key={key} value={city.name}>{city.name}</option>
                ))}
              </select>

              <select 
                className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-gold-500/20"
                value={selectedArea}
                onChange={(e) => setSelectedArea(e.target.value)}
                disabled={selectedCity === "All"}
              >
                <option value="All">All Areas</option>
                {selectedCountry !== "All" && selectedCity !== "All" && citiesConfig?.[selectedCountry] && 
                  (Object.values(citiesConfig[selectedCountry]).find((c: any) => c.name === selectedCity) as any)?.areas.map((area: string) => (
                    <option key={area} value={area}>{area}</option>
                  ))
                }
              </select>

              <select 
                className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-gold-500/20"
                value={filter}
                onChange={(e) => setFilter(e.target.value as any)}
              >
                <option value="All">All Intent Levels</option>
                <option value="High">High Intent</option>
                <option value="Medium">Medium Intent</option>
                <option value="Low">Low Intent</option>
              </select>

              <button className="flex items-center gap-2 px-4 py-3 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-all text-sm font-bold">
                <Filter className="w-4 h-4" />
                Advanced Filters
              </button>
            </div>
          </div>
        </div>

        {/* Leads Table */}
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xl shadow-slate-200/50">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Buyer Profile</th>
                  <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Property Type</th>
                  <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Location</th>
                  <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Budget Range</th>
                  <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Timeline</th>
                  <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Priority</th>
                  <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredLeads.map((lead) => (
                  <tr 
                    key={lead.id} 
                    className="hover:bg-slate-50/80 transition-all cursor-pointer group"
                    onClick={() => setSelectedLead(lead)}
                  >
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center group-hover:bg-gold-50 transition-colors">
                          <User className="w-6 h-6 text-slate-400 group-hover:text-gold-600" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="font-bold text-slate-900 group-hover:text-gold-600 transition-colors">
                              {lead.ai_summary || "Anonymous Buyer"}
                            </span>
                            {lead.ai_is_buyer && (
                              <div className="px-1.5 py-0.5 bg-gold-100 text-gold-700 rounded text-[8px] font-black uppercase tracking-tighter">Verified</div>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-slate-400">
                            <PlatformIcon platform={lead.social_platform} />
                            <span>{lead.social_platform} • {lead.ai_buyer_type || "Individual"}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-slate-300" />
                        <span className="text-sm font-semibold text-slate-700 capitalize">{lead.ai_property_type || "Residential"}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-slate-300" />
                        <span className="text-sm font-medium text-slate-600">{lead.ai_location_city || lead.location}</span>
                        <CountryFlag country={lead.country} />
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-900">
                          {lead.ai_budget_min ? `$${(lead.ai_budget_min/1000).toFixed(0)}k - $${(lead.ai_budget_max/1000).toFixed(0)}k` : "Undisclosed"}
                        </span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{lead.ai_budget_currency || "USD"}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-slate-300" />
                        <span className="text-sm font-medium text-slate-600">{lead.ai_timeline || "Flexible"}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <PriorityBadge priority={lead.priority} />
                    </td>
                    <td className="px-8 py-6 text-right">
                      <button className="p-2 text-slate-300 hover:text-gold-600 hover:bg-gold-50 rounded-xl transition-all">
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredLeads.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-8 py-20 text-center">
                      <div className="flex flex-col items-center gap-4">
                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-2">
                          <Search className="w-10 h-10 text-slate-200" />
                        </div>
                        <p className="text-slate-500 font-serif text-xl">No buyers found matching your criteria</p>
                        <p className="text-sm text-slate-400">Try adjusting your filters or scan the markets again.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Lead Detail Modal */}
      <AnimatePresence>
        {selectedLead && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedLead(null)}
              className="absolute inset-0 bg-navy-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-5xl bg-white rounded-[32px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Modal Header */}
              <div className="bg-navy-900 px-8 py-8 text-white relative">
                <button 
                  onClick={() => setSelectedLead(null)}
                  className="absolute top-6 right-6 p-2 hover:bg-white/10 rounded-full transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
                
                <div className="flex flex-wrap items-start justify-between gap-6">
                  <div className="flex gap-6">
                    <div className="w-20 h-20 bg-gold-500 rounded-3xl flex items-center justify-center shadow-xl shadow-gold-500/20">
                      <User className="w-10 h-10 text-navy-900" />
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h2 className="text-3xl font-serif font-bold">{selectedLead.ai_summary || "Anonymous Buyer"}</h2>
                        <div className="px-3 py-1 bg-gold-500 text-navy-900 rounded-full text-[10px] font-black uppercase tracking-wider">Verified Buyer</div>
                      </div>
                      <div className="flex flex-wrap items-center gap-4 text-white/60 text-sm">
                        <div className="flex items-center gap-1.5">
                          <PlatformIcon platform={selectedLead.social_platform} />
                          <span>{selectedLead.social_platform}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-4 h-4" />
                          <span>{selectedLead.ai_location_city || selectedLead.location}, {selectedLead.country}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-4 h-4" />
                          <span>Captured {format(new Date(selectedLead.timestamp), "MMM d, yyyy 'at' HH:mm")}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end gap-2">
                    <div className="text-right">
                      <p className="text-[10px] font-bold text-gold-500 uppercase tracking-widest mb-1">Priority Score</p>
                      <div className="text-4xl font-serif font-bold text-white">{selectedLead.ai_priority_score}%</div>
                    </div>
                    <PriorityBadge priority={selectedLead.priority} />
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-8 bg-slate-50">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Left Column: AI Intelligence */}
                  <div className="lg:col-span-2 space-y-8">
                    {/* Buyer Persona & Intelligence */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="p-2 bg-gold-50 rounded-xl">
                            <User className="w-5 h-5 text-gold-600" />
                          </div>
                          <h3 className="font-bold text-slate-900">Buyer Persona</h3>
                        </div>
                        <div className="space-y-3">
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-500">Persona</span>
                            <span className="font-bold text-slate-900">{selectedLead.ai_buyer_persona?.persona_name || "Unknown"}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-500">Stage</span>
                            <span className="font-bold text-gold-600 capitalize">{selectedLead.ai_buyer_persona?.buyer_stage || "Searching"}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-500">Motivation</span>
                            <span className="font-bold text-slate-900">{selectedLead.ai_buyer_persona?.primary_motivation || "Unknown"}</span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="p-2 bg-emerald-50 rounded-xl">
                            <TrendingUp className="w-5 h-5 text-emerald-600" />
                          </div>
                          <h3 className="font-bold text-slate-900">Closing Probability</h3>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          <div className="text-center">
                            <p className="text-[10px] font-bold text-slate-400 uppercase">30 Days</p>
                            <p className="text-lg font-bold text-emerald-600">{selectedLead.ai_closing_probability?.probability_30_days || 0}%</p>
                          </div>
                          <div className="text-center border-x border-slate-100">
                            <p className="text-[10px] font-bold text-slate-400 uppercase">60 Days</p>
                            <p className="text-lg font-bold text-emerald-500">{selectedLead.ai_closing_probability?.probability_60_days || 0}%</p>
                          </div>
                          <div className="text-center">
                            <p className="text-[10px] font-bold text-slate-400 uppercase">90 Days</p>
                            <p className="text-lg font-bold text-emerald-400">{selectedLead.ai_closing_probability?.probability_90_days || 0}%</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Price Prediction & Ideal Match */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="p-2 bg-blue-50 rounded-xl">
                            <DollarSign className="w-5 h-5 text-blue-600" />
                          </div>
                          <h3 className="font-bold text-slate-900">Price Prediction</h3>
                        </div>
                        <div className="space-y-3">
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-500">Predicted Price</span>
                            <span className="font-bold text-blue-600">${(selectedLead.ai_price_prediction?.predicted_price || 0).toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-500">Range</span>
                            <span className="font-bold text-slate-900">
                              ${(selectedLead.ai_price_prediction?.price_range_low || 0).toLocaleString()} - ${(selectedLead.ai_price_prediction?.price_range_high || 0).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-400 italic">"{selectedLead.ai_price_prediction?.reasoning}"</p>
                        </div>
                      </div>

                      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="p-2 bg-purple-50 rounded-xl">
                            <Target className="w-5 h-5 text-purple-600" />
                          </div>
                          <h3 className="font-bold text-slate-900">Ideal Property Match</h3>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-xs">
                            <span className="text-slate-500">Type</span>
                            <span className="font-bold text-slate-900">{selectedLead.ai_ideal_property?.property_type || "Unknown"}</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-slate-500">Size</span>
                            <span className="font-bold text-slate-900">{selectedLead.ai_ideal_property?.square_footage || "Unknown"}</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-slate-500">Neighborhood</span>
                            <span className="font-bold text-slate-900">{selectedLead.ai_ideal_property?.neighborhood_type || "Unknown"}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Preferences */}
                    <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
                      <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-gold-500" />
                        Buyer Preferences
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Must Haves</p>
                          <div className="flex flex-wrap gap-2">
                            {selectedLead.ai_must_haves?.map((item: string, i: number) => (
                              <span key={i} className="px-3 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-medium">{item}</span>
                            )) || <span className="text-xs text-slate-400 italic">No specific requirements mentioned</span>}
                          </div>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Nice to Haves</p>
                          <div className="flex flex-wrap gap-2">
                            {selectedLead.ai_nice_to_haves?.map((item: string, i: number) => (
                              <span key={i} className="px-3 py-1 bg-slate-50 text-slate-500 rounded-lg text-xs font-medium">{item}</span>
                            )) || <span className="text-xs text-slate-400 italic">None mentioned</span>}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Market Timing & Competitor Analysis */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="p-2 bg-orange-50 rounded-xl">
                            <Clock className="w-5 h-5 text-orange-600" />
                          </div>
                          <h3 className="font-bold text-slate-900">Market Timing</h3>
                        </div>
                        <div className="space-y-2">
                          <div className="px-3 py-2 bg-orange-50 text-orange-700 rounded-xl text-xs font-bold text-center uppercase tracking-wider">
                            {selectedLead.ai_market_timing?.recommendation || "Wait"}
                          </div>
                          <p className="text-xs text-slate-600 leading-relaxed">{selectedLead.ai_market_timing?.reasoning}</p>
                        </div>
                      </div>

                      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="p-2 bg-slate-900 rounded-xl">
                            <ShieldCheck className="w-5 h-5 text-gold-500" />
                          </div>
                          <h3 className="font-bold text-slate-900">Competitor Analysis</h3>
                        </div>
                        <div className="space-y-2">
                          <p className="text-[10px] font-bold text-slate-400 uppercase">Unique Value Proposition</p>
                          <p className="text-xs font-bold text-navy-900">{selectedLead.ai_competitor_analysis?.unique_value_proposition || "Personalized Service"}</p>
                          <div className="flex flex-wrap gap-1">
                            {selectedLead.ai_competitor_analysis?.gaps?.map((gap: string, i: number) => (
                              <span key={i} className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[9px] font-medium">{gap}</span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Original Post */}
                    <div className="bg-slate-900 rounded-3xl p-8 text-white">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold flex items-center gap-2">
                          <MessageSquare className="w-5 h-5 text-gold-500" />
                          Original Source Content
                        </h3>
                        <a 
                          href={selectedLead.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-xs text-gold-500 hover:underline flex items-center gap-1"
                        >
                          View Original <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                      <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                        <p className="text-slate-300 leading-relaxed italic">"{selectedLead.content}"</p>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Action & Insights */}
                  <div className="space-y-6">
                    {/* AI Strategy & Communication */}
                    <div className="bg-gold-50 rounded-3xl p-6 border border-gold-100">
                      <h3 className="font-bold text-navy-900 mb-4 flex items-center gap-2">
                        <Lightbulb className="w-5 h-5 text-gold-600" />
                        AI Strategy
                      </h3>
                      
                      <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="bg-white/50 p-3 rounded-xl">
                          <p className="text-[9px] font-bold text-gold-800 uppercase mb-1">Best Time</p>
                          <p className="text-xs font-bold text-navy-900">{selectedLead.ai_best_contact_time?.best_time_of_day}, {selectedLead.ai_best_contact_time?.best_day_of_week}</p>
                        </div>
                        <div className="bg-white/50 p-3 rounded-xl">
                          <p className="text-[9px] font-bold text-gold-800 uppercase mb-1">Preferred Channel</p>
                          <p className="text-xs font-bold text-navy-900 capitalize">{selectedLead.ai_best_contact_time?.preferred_channel}</p>
                        </div>
                      </div>

                      <p className="text-xs text-gold-800/70 mb-4 font-medium uppercase tracking-wider">Suggested Script:</p>
                      <div className="bg-white p-4 rounded-xl text-sm text-slate-700 border border-gold-200 shadow-sm mb-6 italic">
                        "{selectedLead.ai_best_contact_time?.suggested_script}"
                      </div>

                      <p className="text-xs text-gold-800/70 mb-4 font-medium uppercase tracking-wider">Negotiation Leverage:</p>
                      <div className="space-y-2 mb-6">
                        {selectedLead.ai_negotiation_tips?.negotiation_leverage?.map((tip: string, i: number) => (
                          <div key={i} className="flex items-start gap-2 text-xs text-slate-700">
                            <CheckCircle className="w-3 h-3 text-gold-600 mt-0.5 shrink-0" />
                            <span>{tip}</span>
                          </div>
                        ))}
                      </div>

                      <button className="w-full py-3 bg-navy-900 text-white rounded-xl font-bold text-sm hover:bg-slate-800 transition-all shadow-lg shadow-navy-900/20">
                        Generate Personalized Email
                      </button>
                    </div>

                    {/* Objection Handling */}
                    <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
                      <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                        <AlertCircle className="w-5 h-5 text-rose-500" />
                        Objection Handling
                      </h3>
                      <div className="space-y-4">
                        {selectedLead.ai_predicted_objections?.likely_objections?.slice(0, 2).map((obj: string, i: number) => (
                          <div key={i} className="space-y-1">
                            <p className="text-xs font-bold text-slate-900">"{obj}"</p>
                            <p className="text-[11px] text-slate-500 leading-relaxed">{selectedLead.ai_predicted_objections?.objection_handling[obj]}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Contact Card */}
                    <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
                      <h3 className="font-bold text-slate-900 mb-4">Contact Information</h3>
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center">
                            <User className="w-5 h-5 text-slate-400" />
                          </div>
                          <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Full Name</p>
                            <p className="text-sm font-bold text-slate-900">{selectedLead.author || "Unknown User"}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center">
                            <Mail className="w-5 h-5 text-slate-400" />
                          </div>
                          <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Email Address</p>
                            <p className="text-sm font-bold text-slate-900">{selectedLead.email || "Not extracted"}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center">
                            <Phone className="w-5 h-5 text-slate-400" />
                          </div>
                          <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Phone Number</p>
                            <p className="text-sm font-bold text-slate-900">{selectedLead.phone || "Not extracted"}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function StatCard({ title, value, icon, color }: { title: string; value: string | number; icon: React.ReactNode; color: "navy" | "rose" | "emerald" | "sky" | "gold" }) {
  const colors = {
    navy: "bg-navy-900/5 border-navy-900/10",
    rose: "bg-rose-50 border-rose-100",
    emerald: "bg-emerald-50 border-emerald-100",
    sky: "bg-sky-50 border-sky-100",
    gold: "bg-gold-50 border-gold-100",
  };

  return (
    <div className={cn("p-8 rounded-[32px] border shadow-sm transition-all hover:shadow-xl hover:-translate-y-1 bg-white", colors[color])}>
      <div className="flex items-center justify-between mb-4">
        <div className={cn("p-3 rounded-2xl shadow-sm bg-white")}>
          {icon}
        </div>
        <div className="flex items-center gap-1 text-emerald-600 font-bold text-xs">
          <ArrowUpRight className="w-3 h-3" />
          +12%
        </div>
      </div>
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-1">{title}</p>
      <span className="text-3xl font-serif font-bold text-navy-900">{value}</span>
    </div>
  );
}

function QualityBadge({ quality }: { quality: Lead["quality_level"] }) {
  const styles = {
    High: "bg-rose-100 text-rose-700 border-rose-200",
    Medium: "bg-amber-100 text-amber-700 border-amber-200",
    Low: "bg-emerald-100 text-emerald-700 border-emerald-200",
  };

  return (
    <span className={cn("px-2.5 py-0.5 rounded-full text-xs font-semibold border", styles[quality || "Low"])}>
      {quality}
    </span>
  );
}

function PriorityBadge({ priority }: { priority: Lead["priority"] }) {
  const styles = {
    High: "bg-rose-100 text-rose-700 border-rose-200",
    Medium: "bg-amber-100 text-amber-700 border-amber-200",
    Low: "bg-emerald-100 text-emerald-700 border-emerald-200",
  };

  return (
    <span className={cn("px-2.5 py-0.5 rounded-full text-xs font-semibold border", styles[priority])}>
      {priority}
    </span>
  );
}
