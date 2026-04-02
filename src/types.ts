export interface Lead {
  id: string;
  title: string;
  content: string;
  author: string;
  timestamp: string;
  url: string;
  score: number;
  priority: "High" | "Medium" | "Low";
  location: string;
  keywords: string[];
  phone?: string;
  email?: string;
  category: string;
  dateScraped: string;
  // Phase 11 New Fields
  country: "Canada" | "USA" | "UK" | "Other";
  city?: string;
  currency?: "CAD" | "USD" | "GBP";
  social_platform?: "Facebook" | "Twitter" | "Reddit" | "Instagram" | "LinkedIn" | "Other";
  social_username?: string;
  social_user_link?: string;
  post_link?: string;
  reddit_subreddit?: string;
  reddit_post_id?: string;
  reddit_comment_id?: string;
  reddit_comment_link?: string;
  reddit_comment_parent?: string;
  reddit_comment_depth?: number;
  reddit_is_comment?: boolean;
  reddit_permalink?: string;
  post_score?: number;
  contact_whatsapp?: string;
  contact_website?: string;
  extracted_social_links?: string[];
  // Phase 14 New Fields
  platform?: "Reddit" | "Facebook" | "Instagram" | "Twitter" | "LinkedIn" | "Other";
  platform_username?: string;
  platform_profile_link?: string;
  platform_post_link?: string;
  platform_comment_id?: string;
  platform_comment_link?: string;
  platform_is_comment?: boolean;
  platform_engagement?: number;
  platform_permalink?: string;
  quality_score?: number;
  quality_level?: "High" | "Medium" | "Low";
  contact_phone?: string;
  contact_email?: string;
  contact_social?: string[];
  // Phase 16 AI Fields
  ai_is_lead?: boolean;
  ai_intent?: "buyer" | "seller" | "contractor" | "homeowner" | "other";
  ai_urgency_score?: number;
  ai_sentiment?: "positive" | "negative" | "neutral" | "urgent";
  ai_location?: string;
  ai_budget?: string;
  ai_timeline?: string;
  ai_project_type?: "residential" | "commercial" | "renovation" | "new build" | "maintenance";
  ai_project_details?: string;
  ai_contact_info?: string; // JSON string
  ai_competitors?: string; // JSON string
  ai_summary?: string;
  ai_follow_up?: string; // JSON string
  ai_quality_score?: number;
  ai_priority_score?: number;
  // Phase 17 Real Estate Specific Fields
  ai_is_buyer?: boolean;
  ai_intent_level?: "High" | "Medium" | "Low";
  ai_property_type?: "house" | "condo" | "townhouse" | "duplex" | "land" | "investment";
  ai_bedrooms?: number;
  ai_bathrooms?: number;
  ai_location_city?: string;
  ai_location_area?: string;
  ai_budget_min?: number;
  ai_budget_max?: number;
  ai_currency?: string;
  ai_buyer_type?: "first_time" | "upgrader" | "investor" | "downsizer";
  ai_mortgage_status?: "pre_approved" | "not_yet" | "not_sure";
  ai_must_haves?: string[];
  ai_nice_to_haves?: string[];
  ai_follow_up_questions?: string[];
  ai_family_size?: number;
  ai_school_district?: string;
  ai_commute_location?: string;
  ai_estimated_value?: number;
  
  // Phase 19 Advanced AI Features
  ai_buyer_persona?: {
    persona_name: string;
    buyer_stage: string;
    primary_motivation: string;
    pain_points: string[];
    lifestyle_factors: string[];
    decision_factors: string[];
    communication_preference: string;
    suggested_approach: string;
  };
  ai_price_prediction?: {
    predicted_price: number;
    price_range_low: number;
    price_range_high: number;
    confidence_score: number;
    reasoning: string;
  };
  ai_closing_probability?: {
    probability_30_days: number;
    probability_60_days: number;
    probability_90_days: number;
    key_factors: string[];
    recommended_next_steps: string[];
  };
  ai_ideal_property?: {
    property_type: string;
    bedrooms: number;
    bathrooms: number;
    square_footage: string;
    must_have_features: string[];
    nice_to_have_features: string[];
    neighborhood_type: string;
    listing_price_range: string;
  };
  ai_best_contact_time?: {
    best_time_of_day: string;
    best_day_of_week: string;
    preferred_channel: string;
    urgency_level: string;
    suggested_script: string;
  };
  ai_predicted_objections?: {
    likely_objections: string[];
    objection_handling: { [key: string]: string };
    hidden_concerns: string[];
    trust_builders: string[];
  };
  ai_market_timing?: {
    recommendation: string;
    reasoning: string;
    market_conditions: string;
    risk_factors: string[];
    opportunity_factors: string[];
  };
  ai_competitor_analysis?: {
    mentioned_agents: string[];
    competitor_strategies: string[];
    gaps: string[];
    advantage_opportunities: string[];
    unique_value_proposition: string;
  };
  ai_negotiation_tips?: {
    negotiation_leverage: string[];
    price_strategy: string;
    concessions_to_ask: string[];
    closing_tactics: string[];
    fallback_options: string[];
  };
  ai_communication_style?: {
    style: string;
    tone: string;
    detail_level: string;
    responsiveness_likelihood: string;
    follow_up_frequency: string;
    message_style: string;
  };
}

export const REAL_ESTATE_KEYWORDS = [
  "looking to buy house", "first time home buyer", "need real estate agent", 
  "want to purchase property", "buying my first home", "house hunting", 
  "looking for a realtor", "need help buying a home", "ready to buy a house", 
  "pre-approved mortgage", "detached house", "single family home", "condo", 
  "townhouse", "apartment", "duplex", "bungalow", "luxury home", "fixer upper", 
  "investment property", "starter home", "forever home"
];

export const URGENCY_KEYWORDS = ["urgent", "immediate", "asap", "quick", "ready to buy", "now"];

export const SCORING_RULES = {
  intent: { points: 20, words: ["looking to buy", "ready to buy", "need agent", "pre-approved", "buying first home"] },
  urgency: { points: 15, words: ["urgent", "immediate", "asap", "this month", "now"] },
  budget: { points: 15, words: ["budget", "price range", "pre-approved for", "looking for around"] },
  details: { points: 10, words: ["bedrooms", "bathrooms", "backyard", "garage", "neighborhood", "school district"] }
};

export const QUALITY_INDICATORS = {
  CONTACT_METHOD: 20,
  LOCATION_SPECIFIED: 15,
  BUDGET_MENTIONED: 15,
  TIMELINE_MENTIONED: 15,
  PROJECT_DETAILS: 10,
  ENGAGEMENT: 5,
  COMPLETE_SENTENCE: 5,
  VERIFIED_PROFILE: 5
};
